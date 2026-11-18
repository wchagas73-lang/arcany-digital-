"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type BackupItem = {
  name: string;
  key: string;
  exists: boolean;
  data?: unknown;
  raw?: string;
};

/**
 * Exports only the legacy keys and the current authenticated user's scoped keys.
 * It never scans other users' keys, uploads data, or changes localStorage.
 */
export async function downloadArcanyLocalBackup(): Promise<number> {
  if (typeof window === "undefined") {
    throw new Error("O backup só pode ser gerado no navegador.");
  }

  let userId: string | null = null;
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    userId = data.user?.id ?? null;
  }

  const keyDefinitions = [
    { name: "Empresas (chave antiga, sem conta)", baseKey: "arcany-companies-v1" },
    { name: "Leads (chave antiga, sem conta)", baseKey: "arcany-leads-v1" },
    ...(userId
      ? [
          { name: "Empresas (conta atual)", baseKey: `arcany-companies-v1:${userId}` },
          { name: "Leads (conta atual)", baseKey: `arcany-leads-v1:${userId}` },
        ]
      : []),
  ];

  const items: BackupItem[] = keyDefinitions.map(({ name, baseKey }) => {
    const raw = window.localStorage.getItem(baseKey);
    if (raw === null) return { name, key: baseKey, exists: false };

    try {
      return { name, key: baseKey, exists: true, data: JSON.parse(raw) as unknown };
    } catch {
      return { name, key: baseKey, exists: true, raw };
    }
  });

  const payload = {
    application: "Arcany Digital",
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    authenticatedUserId: userId,
    instructions: [
      "Este arquivo é uma cópia local para conferência e recuperação.",
      "Nenhum dado foi enviado ao Supabase ou removido do navegador.",
      "As chaves antigas sem identificação de conta não devem ser importadas automaticamente.",
      "Antes de migrar, confira a qual organização cada registro pertence.",
    ],
    items,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  anchor.href = objectUrl;
  anchor.download = `arcany-backup-${stamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

  return items.filter((item) => item.exists).length;
}
