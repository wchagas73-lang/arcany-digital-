import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import http from "node:http";
import https from "node:https";

export const runtime = "nodejs";

type PublicTarget = { url: URL; address: string; family: number };
type PageResult = { url: string; html: string; status: number };

function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) {
    const p = address.split(".").map(Number);
    return p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && (p[1] === 168 || p[1] === 0)) ||
      (p[0] === 198 && (p[1] === 18 || p[1] === 19 || p[1] === 51)) ||
      (p[0] === 203 && p[1] === 0 && p[2] === 113);
  }
  if (version === 6) {
    const value = address.toLowerCase();
    return value === "::" || value === "::1" || value.startsWith("fc") ||
      value.startsWith("fd") || value.startsWith("fe80") ||
      value.startsWith("ff") || value.startsWith("::ffff:") ;
  }
  return true;
}

async function resolvePublicTarget(raw: string): Promise<PublicTarget> {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Endereço de site inválido.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Endereço não permitido.");
  }
  const addresses = isIP(host)
    ? [{ address: host, family: isIP(host) }]
    : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) {
    throw new Error("O site não pôde ser validado como endereço público.");
  }
  return { url, address: addresses[0].address, family: addresses[0].family };
}

function requestPinned(target: PublicTarget): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const { url, address, family } = target;
    const transport = url.protocol === "https:" ? https : http;
    const req = transport.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: url.pathname + url.search,
      method: "GET",
      headers: { "User-Agent": "ArcanyDigitalPublicCheck/1.0", Accept: "text/html,application/xhtml+xml" },
      servername: url.protocol === "https:" ? url.hostname : undefined,
      lookup: ((_hostname: string, _options: unknown, callback: (error: Error | null, address: string, family: number) => void) => {
        callback(null, address, family);
      }) as never,
    }, (res) => {
      const chunks: Buffer[] = [];
      let size = 0;
      res.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > 500_000) {
          req.destroy(new Error("Página excedeu o limite de leitura."));
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", () => resolve({
        status: res.statusCode ?? 0,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    req.setTimeout(5500, () => req.destroy(new Error("Tempo limite excedido.")));
    req.on("error", reject);
    req.end();
  });
}

async function getPublicPage(raw: string, originalHost: string): Promise<PageResult> {
  let target = await resolvePublicTarget(raw);
  if (target.url.hostname.toLowerCase() !== originalHost.toLowerCase()) {
    throw new Error("A análise só segue links do mesmo domínio.");
  }
  for (let redirect = 0; redirect < 4; redirect++) {
    const result = await requestPinned(target);
    if (result.status >= 300 && result.status < 400) {
      const location = result.headers.location;
      if (!location) throw new Error("Redirecionamento sem destino.");
      const next = new URL(location, target.url);
      if (next.hostname.toLowerCase() !== originalHost.toLowerCase()) {
        throw new Error("Redirecionamento para outro domínio bloqueado.");
      }
      target = await resolvePublicTarget(next.toString());
      continue;
    }
    const type = String(result.headers["content-type"] ?? "");
    if (result.status < 200 || result.status >= 300) throw new Error("Página não respondeu com sucesso.");
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
      throw new Error("Endereço não retornou uma página HTML.");
    }
    return { url: target.url.toString(), html: result.body, status: result.status };
  }
  throw new Error("Muitos redirecionamentos.");
}

function cleanText(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

function extractLinks(html: string, pageUrl: string, host: string) {
  const found: Array<{ url: string; text: string }> = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1], pageUrl);
      if (url.hostname.toLowerCase() !== host.toLowerCase() || !["http:", "https:"].includes(url.protocol)) continue;
      const text = cleanText(match[2]).slice(0, 100);
      found.push({ url: url.toString(), text });
    } catch { /* ignora links inválidos */ }
  }
  return found;
}

export async function POST(request: Request) {
  let body: { website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
  }
  if (!body.website || typeof body.website !== "string" || body.website.length > 2048) {
    return NextResponse.json({ error: "Informe um endereço de site válido." }, { status: 400 });
  }

  try {
    const initialTarget = await resolvePublicTarget(body.website);
    const host = initialTarget.url.hostname;
    const homepage = await getPublicPage(initialTarget.url.toString(), host);
    const homepageLinks = extractLinks(homepage.html, homepage.url, host);
    const priority = /card[aá]pio|menu|produto|catalog|loja|shop|carrinho|cart|pedido|order|delivery|comprar|store/i;
    const candidates = homepageLinks.filter((link) => priority.test(link.text + " " + link.url));
    const uniquePages = [...new Map(candidates.map((item) => [item.url.split("#")[0], item])).values()]
      .filter((item) => item.url !== homepage.url)
      .slice(0, 4);

    const subpages: PageResult[] = [];
    for (const link of uniquePages) {
      try {
        subpages.push(await getPublicPage(link.url, host));
      } catch {
        // Página secundária indisponível: mantém análise parcial da página inicial.
      }
    }

    const pages = [homepage, ...subpages];
    const checks = [
      { key: "cardapio", label: "Cardápio / menu", regex: /card[aá]pio|menu|nosso menu|pratos|bebidas/i },
      { key: "catalogo", label: "Catálogo de produtos", regex: /cat[aá]logo|produtos|product catalog|vitrine/i },
      { key: "ecommerce", label: "Loja virtual / e-commerce", regex: /loja virtual|e-commerce|ecommerce|shopify|woocommerce|comprar agora|finalizar compra|shopping cart/i },
      { key: "carrinho", label: "Carrinho de compras", regex: /carrinho|shopping cart|sacola de compras|adicionar ao carrinho/i },
      { key: "pedidos", label: "Pedidos / encomendas on-line", regex: /fazer pedido|pedir online|pedido online|encomendar|delivery|faça seu pedido/i },
    ];

    const findings = checks.map((check) => {
      const evidence: Array<{ url: string; text: string }> = [];
      for (const page of pages) {
        const text = cleanText(page.html);
        const links = extractLinks(page.html, page.url, host);
        for (const link of links) {
          if (check.regex.test(link.text + " " + link.url)) {
            evidence.push({ url: link.url, text: link.text || check.label });
          }
        }
        if (evidence.length < 3 && check.regex.test(text)) {
          const match = text.match(check.regex);
          if (match) evidence.push({ url: page.url, text: "Texto da página: " + text.slice(Math.max(0, match.index! - 45), match.index! + 100) });
        }
      }
      return {
        key: check.key,
        label: check.label,
        status: evidence.length ? "sinal_encontrado" : "nao_identificado",
        evidence: evidence.slice(0, 3),
      };
    });

    return NextResponse.json({
      checkedUrl: homepage.url,
      checkedAt: new Date().toISOString(),
      pagesChecked: pages.map((page) => page.url),
      findings,
      note: "A Arcany analisou a página inicial e até quatro páginas internas públicas sugeridas pelos links do próprio site. Os sinais são indícios, não confirmação de funcionamento. Não encontrar um recurso nas páginas consultadas não prova que ele não exista em outra área do site."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível verificar o site.";
    return NextResponse.json({ error: message.includes("timeout") || message.includes("Tempo limite") ? "O site demorou para responder ou bloqueou a consulta." : message }, { status: 502 });
  }
}
