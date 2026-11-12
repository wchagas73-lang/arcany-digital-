import type { SupabaseClient } from "@supabase/supabase-js";

type Membership = { organization_id: string };

/**
 * Verifies that the authenticated user has one unambiguous visible organization.
 * If a competing bootstrap fails because another request completed first, the
 * membership is re-read. Multiple memberships fail closed until the database
 * uniqueness constraint is applied.
 */
export async function ensureUserOrganization(
  supabase: SupabaseClient,
  userId: string,
  organizationName: string
): Promise<string> {
  const readMembership = () =>
    supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();

  const { data: current, error: currentError } = await readMembership();
  if (currentError) throw currentError;
  if (current) return (current as Membership).organization_id;

  const normalizedName = organizationName.trim().slice(0, 120);
  const { data: createdOrganizationId, error: bootstrapError } =
    await supabase.rpc("bootstrap_organization", {
      org_name: normalizedName.length >= 2 ? normalizedName : "Minha empresa",
    });

  if (bootstrapError) {
    // A second tab may have completed bootstrap after the first read.
    const { data: concurrentMembership, error: concurrentError } =
      await readMembership();
    if (concurrentError) throw bootstrapError;
    if (concurrentMembership) {
      return (concurrentMembership as Membership).organization_id;
    }
    throw bootstrapError;
  }

  const { data: verified, error: verificationError } = await readMembership();
  if (verificationError) throw verificationError;

  const organizationId = (verified as Membership | null)?.organization_id;
  if (!organizationId || organizationId !== createdOrganizationId) {
    throw new Error(
      "A organização foi criada, mas a associação do usuário não pôde ser confirmada."
    );
  }

  return organizationId;
}
