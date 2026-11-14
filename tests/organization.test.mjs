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
  const migration = await read("../supabase/migrations/20261114130000_revoke_public_workspace_bootstrap.sql");
  assert.match(migration, /revoke all on function public\.bootstrap_organization\(text\) from public/i);
  assert.match(migration, /revoke all on function public\.bootstrap_organization\(text\) from anon/i);
  assert.match(migration, /revoke all on function public\.bootstrap_organization\(text\) from authenticated/i);
});
