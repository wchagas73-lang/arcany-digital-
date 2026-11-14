"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("A conexão com o Supabase ainda não foi configurada neste ambiente.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#080d16", color: "#f3f6fb" }}>
    <form onSubmit={submit} style={{ width: "min(100%, 430px)", display: "grid", gap: 14, padding: 26, border: "1px solid #263248", borderRadius: 18, background: "#101827" }}>
      <div style={{ color: "#a99fff", fontSize: 11, letterSpacing: 2 }}>ARCANY DIGITAL</div>
      <h1 style={{ fontSize: 27, margin: 0 }}>Acesso do proprietário</h1>
      <p style={{ color: "#9aa8bc", fontSize: 13, lineHeight: 1.6, margin: 0 }}>Workspace privado da agência. O acesso é permitido somente à conta proprietária autorizada pela configuração segura da plataforma. Não existe cadastro público de empresas ou clientes.</p>
      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>E-mail<input required autoComplete="username" type="email" value={email} onChange={e => setEmail(e.target.value)} style={field}/></label>
      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>Senha<input required autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={field}/></label>
      <button disabled={busy} style={button}>{busy ? "Validando acesso..." : "Entrar no workspace"}</button>
      {message && <p role="status" style={{ color: "#f4c879", fontSize: 12, lineHeight: 1.5 }}>{message}</p>}
      <p style={{ color: "#718096", fontSize: 10, lineHeight: 1.5, margin: 0 }}>Se sua conta ainda não foi criada e autorizada, o acesso não estará disponível. A conta inicial é provisionada de forma controlada, sem auto cadastro.</p>
    </form>
  </main>;
}

const field: React.CSSProperties = { width: "100%", minHeight: 44, border: "1px solid #35435a", borderRadius: 9, background: "#0b1220", color: "#f3f6fb", padding: "0 12px" };
const button: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 9, background: "#7666ed", color: "white", fontWeight: 700, cursor: "pointer" };
