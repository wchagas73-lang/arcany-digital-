import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectPreservingCookies(target: URL, source: NextResponse) {
  const redirect = NextResponse.redirect(target);
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const organizationName = (requestUrl.searchParams.get("org") || "Minha empresa")
    .trim()
    .slice(0, 120);

  if (!code) {
    return NextResponse.redirect(new URL("/acesso?erro=confirmacao", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/acesso?setup=supabase", request.url));
  }

  let response = NextResponse.redirect(new URL("/dashboard", request.url));
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.redirect(new URL("/dashboard", request.url));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return redirectPreservingCookies(
      new URL("/acesso?erro=confirmacao", request.url),
      response
    );
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return redirectPreservingCookies(new URL("/acesso?erro=usuario", request.url), response);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    return redirectPreservingCookies(
      new URL("/acesso?erro=organizacao", request.url),
      response
    );
  }

  if (!membership) {
    const { error: bootstrapError } = await supabase.rpc("bootstrap_organization", {
      org_name: organizationName.length >= 2 ? organizationName : "Minha empresa",
    });
    if (bootstrapError) {
      return redirectPreservingCookies(
        new URL("/acesso?erro=organizacao", request.url),
        response
      );
    }
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
