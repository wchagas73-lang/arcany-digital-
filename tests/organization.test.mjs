import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("private workspace denies access when owner email is not configured", async () => {
  const middleware = await read("../middleware.ts");
  assert.match(middleware, /Boolean\(ownerEmail && userEmail && ownerEmail === userEmail\)/);
  assert.match(middleware, /proprietario_nao_configurado/);
});

test("middleware signs out authenticated users who are not the owner", async () => {
  const middleware = await read("../middleware.ts");
  assert.match(middleware, /if \(data\.user && !isAuthorizedOwner\)/);
  assert.match(middleware, /await supabase\.auth\.signOut\(\)/);
});

test("auth callback applies the same owner-only allowlist", async () => {
  const callback = await read("../src/app/auth/callback/route.ts");
  assert.match(callback, /ownerEmail !== userEmail/);
  assert.match(callback, /await supabase\.auth\.signOut\(\)/);
});

test("self-service organization bootstrap is revoked for public roles", async () => {
  const migration = await read("../supabase/migrations/20261114150346_revoke_public_workspace_bootstrap.sql");
  assert.match(migration, /revoke all on function public\.bootstrap_organization\(text\) from public/i);
  assert.match(migration, /revoke all on function public\.bootstrap_organization\(text\) from anon/i);
  assert.match(migration, /revoke all on function public\.bootstrap_organization\(text\) from authenticated/i);
});



test("owner signup trigger rejects every email outside the owner allowlist", async () => {
  const migration = await read("../supabase/migrations/20261114154710_owner_only_auth_signup_provisioning.sql");
  assert.ok(migration.includes("lower(coalesce(new.email, '')) <> 'wchagas73@gmail.com'"));
  assert.match(migration, /raise exception/i);
  assert.ok(migration.includes("insert into public.organization_members"));
  assert.match(migration, /security definer/i);
  assert.ok(migration.includes("set search_path = ''"));
});

test("published landing pages are public only after explicit publication", async () => {
  const middleware = await read("../middleware.ts");
  const builder = await read("../src/app/projetos/[id]/pagina/page.tsx");
  const publicPage = await read("../src/app/p/[slug]/page.tsx");
  const migration = await read("../supabase/migrations/20261114154420_project_publications_and_public_media.sql");
  assert.ok(middleware.includes('pathname.startsWith("/p/")'));
  assert.ok(builder.includes("project_publications"));
  assert.ok(builder.includes("published: nextPublished"));
  assert.ok(publicPage.includes('.eq("published", true)'));
  assert.ok(migration.includes("using (published = true)"));
});
