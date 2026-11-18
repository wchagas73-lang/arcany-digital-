import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// A rota Node.js original permanece na Vercel para preservar DNS pinning.
// O Worker encaminha somente esta operação para a origem fixa e confiável.
const VERIFIER_ORIGIN = "https://arcany-digital-seven.vercel.app";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Formato de solicitação inválido." }, { status: 415 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
  }

  if (body.length > 8192) {
    return NextResponse.json({ error: "Solicitação muito grande." }, { status: 413 });
  }

  try {
    const upstream = await fetch(`${VERIFIER_ORIGIN}/api/prospeccao/verificar`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "O serviço de verificação está temporariamente indisponível." },
      { status: 502 },
    );
  }
}
