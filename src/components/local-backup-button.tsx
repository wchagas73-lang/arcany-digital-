"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { downloadArcanyLocalBackup } from "@/lib/local-backup";

export function LocalBackupButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleBackup() {
    setBusy(true);
    setMessage("");
    try {
      const count = await downloadArcanyLocalBackup();
      setMessage(count
        ? `Backup gerado com ${count} conjunto(s) de dados. Confira o arquivo no aparelho.`
        : "Backup gerado. Nenhum registro local foi encontrado nas chaves conhecidas.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível gerar o backup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 5 }}>
      <button
        className="secondary-button"
        type="button"
        onClick={handleBackup}
        disabled={busy}
      >
        <Download size={13} /> {busy ? "Gerando backup..." : "Backup JSON"}
      </button>
      {message && (
        <span role="status" style={{ color: "var(--muted)", fontSize: 10, maxWidth: 260 }}>
          {message}
        </span>
      )}
    </div>
  );
}
