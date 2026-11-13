import assert from "node:assert/strict";
import test from "node:test";

import { ensureUserOrganization } from "../src/lib/supabase/organization.ts";

function createSupabaseMock({ reads, rpcResult }) {
  const calls = { reads: 0, rpc: [] };

  const supabase = {
    from(table) {
      assert.equal(table, "organization_members");
      return {
        select(columns) {
          assert.equal(columns, "organization_id");
          return {
            eq(column, value) {
              assert.equal(column, "user_id");
              assert.equal(value, "user-1");
              return {
                async maybeSingle() {
                  calls.reads += 1;
                  const next = reads.shift();
                  if (!next) throw new Error("Unexpected membership read");
                  return next;
                },
              };
            },
          };
        },
      };
    },
    async rpc(name, args) {
      calls.rpc.push({ name, args });
      return rpcResult;
    },
  };

  return { supabase, calls };
}

test("reuses the existing organization without calling bootstrap", async () => {
  const { supabase, calls } = createSupabaseMock({
    reads: [{ data: { organization_id: "org-existing" }, error: null }],
    rpcResult: { data: "org-created", error: null },
  });

  const result = await ensureUserOrganization(supabase, "user-1", "Minha empresa");

  assert.equal(result, "org-existing");
  assert.equal(calls.reads, 1);
  assert.equal(calls.rpc.length, 0);
});

test("creates and verifies an organization when membership is absent", async () => {
  const { supabase, calls } = createSupabaseMock({
    reads: [
      { data: null, error: null },
      { data: { organization_id: "org-created" }, error: null },
    ],
    rpcResult: { data: "org-created", error: null },
  });

  const result = await ensureUserOrganization(supabase, "user-1", "  Arcany Teste  ");

  assert.equal(result, "org-created");
  assert.equal(calls.reads, 2);
  assert.deepEqual(calls.rpc, [{
    name: "bootstrap_organization",
    args: { org_name: "Arcany Teste" },
  }]);
});

test("uses the membership created by a concurrent bootstrap request", async () => {
  const { supabase, calls } = createSupabaseMock({
    reads: [
      { data: null, error: null },
      { data: { organization_id: "org-from-other-tab" }, error: null },
    ],
    rpcResult: { data: null, error: new Error("Bootstrap already completed") },
  });

  const result = await ensureUserOrganization(supabase, "user-1", "Minha empresa");

  assert.equal(result, "org-from-other-tab");
  assert.equal(calls.reads, 2);
  assert.equal(calls.rpc.length, 1);
});

test("fails closed when membership lookup is ambiguous or denied", async () => {
  const lookupError = new Error("Multiple rows or permission denied");
  const { supabase, calls } = createSupabaseMock({
    reads: [{ data: null, error: lookupError }],
    rpcResult: { data: null, error: null },
  });

  await assert.rejects(
    ensureUserOrganization(supabase, "user-1", "Minha empresa"),
    lookupError
  );
  assert.equal(calls.rpc.length, 0);
});

test("rejects a bootstrap result that does not match the verified membership", async () => {
  const { supabase } = createSupabaseMock({
    reads: [
      { data: null, error: null },
      { data: { organization_id: "org-different" }, error: null },
    ],
    rpcResult: { data: "org-created", error: null },
  });

  await assert.rejects(
    ensureUserOrganization(supabase, "user-1", "Minha empresa"),
    /associação do usuário não pôde ser confirmada/
  );
});

test("does not proceed when bootstrap fails and no membership exists", async () => {
  const bootstrapError = new Error("Bootstrap unavailable");
  const { supabase } = createSupabaseMock({
    reads: [
      { data: null, error: null },
      { data: null, error: null },
    ],
    rpcResult: { data: null, error: bootstrapError },
  });

  await assert.rejects(
    ensureUserOrganization(supabase, "user-1", "Minha empresa"),
    bootstrapError
  );
});
