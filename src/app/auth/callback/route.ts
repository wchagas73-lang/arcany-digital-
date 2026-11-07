import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const organizationName = (requestUrl.searchParams.get("org") || "Minha empresa").trim();

  if (!code) {
    return NextResponse.redirect(new URL("/acesso?erro=confirmacao", request.url));
  }

  const supabase = await getSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL("/acesso?erro=confirmacao", request.url));
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.redirect(new URL("/acesso?erro=usuario", request.url));
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.redirect(new URL("/acesso?erro=organizacao", request.url));
  }

  if (!membership) {
    const { error: bootstrapError } = await supabase.rpc("bootstrap_organization", {
      org_name: organizationName.length >= 2 ? organizationName : "Minha empresa",
    });
    if (bootstrapError) {
      return NextResponse.redirect(new URL("/acesso?erro=organizacao", request.url));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
