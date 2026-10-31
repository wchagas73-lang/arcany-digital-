import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";

function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) {
    const p = address.split(".").map(Number);
    return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 169 && p[1] === 254) || p[0] >= 224;
  }
  if (version === 6) {
    const value = address.toLowerCase();
    return value === "::1" || value === "::" || value.startsWith("fc") ||
      value.startsWith("fd") || value.startsWith("fe80") ||
      value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.");
  }
  return true;
}

async function validatePublicUrl(raw: string) {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Endereço de site inválido.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Endereço não permitido.");
  }
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new Error("Endereço não permitido.");
  } else {
    const addresses = await lookup(host, { all: true, verbatim: true });
    if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) {
      throw new Error("O site não pôde ser validado como endereço público.");
    }
  }
  return url;
}

async function readLimited(response: Response, limit: number) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total > limit ? limit : total);
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = merged.length - offset;
    if (remaining <= 0) break;
    merged.set(chunk.subarray(0, remaining), offset);
    offset += Math.min(chunk.length, remaining);
  }
  return new TextDecoder().decode(merged);
}

export async function POST(request: Request) {
  let body: { website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
  }

  if (!body.website || typeof body.website !== "string") {
    return NextResponse.json({ error: "Esta empresa não tem um endereço de site listado para verificar." }, { status: 400 });
  }

  try {
    let currentUrl = await validatePublicUrl(body.website);
    let response: Response | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(7000),
        headers: { "User-Agent": "ArcanyDigitalPublicCheck/1.0", "Accept": "text/html,application/xhtml+xml" },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || attempt === 3) break;
        currentUrl = await validatePublicUrl(new URL(location, currentUrl).toString());
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: "O site não respondeu com sucesso. Tente novamente mais tarde." }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return NextResponse.json({ error: "O endereço não retornou uma página HTML pública para análise." }, { status: 422 });
    }

    const html = (await readLimited(response, 600_000)).toLowerCase();
    const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .slice(0, 500)
      .map((match) => ({
        url: match[1].slice(0, 250),
        text: match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100),
      }));

    const checks = [
      { key: "cardapio", label: "Cardápio / menu", regex: /card[aá]pio|menu|nosso menu|pratos|bebidas/i },
      { key: "catalogo", label: "Catálogo de produtos", regex: /cat[aá]logo|produtos|product catalog|vitrine/i },
      { key: "ecommerce", label: "Loja virtual / e-commerce", regex: /loja virtual|e-commerce| ecommerce|shopify|woocommerce|comprar agora|finalizar compra|shopping cart/i },
      { key: "carrinho", label: "Carrinho de compras", regex: /carrinho|cart|sacola de compras|adicionar ao carrinho/i },
      { key: "pedidos", label: "Pedidos / encomendas on-line", regex: /fazer pedido|pedir online|pedido online|encomendar|delivery|faça seu pedido/i },
    ];

    const findings = checks.map((check) => {
      const matches = anchors.filter((anchor) => check.regex.test(anchor.text + " " + anchor.url));
      const pageSignal = check.regex.test(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "));
      return {
        key: check.key,
        label: check.label,
        status: matches.length || pageSignal ? "sinal_encontrado" : "nao_identificado",
        evidence: matches.slice(0, 3),
      };
    });

    return NextResponse.json({
      checkedUrl: currentUrl.toString(),
      checkedAt: new Date().toISOString(),
      findings,
      note: "Análise automática limitada à página pública inicial. Um sinal não garante que a função esteja ativa; não encontrar um sinal não prova que o recurso não exista em outras páginas."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível verificar o site.";
    return NextResponse.json({ error: message.includes("fetch") || message.includes("timeout") ? "O site demorou para responder ou bloqueou a consulta." : message }, { status: 502 });
  }
}
