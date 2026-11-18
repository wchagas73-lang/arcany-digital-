"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const OWNER_EMAIL = "wchagas73@gmail.com";

export default function AccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "setup">("login");
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
      if (mode === "setup") {
        if (email.trim().toLowerCase() !== OWNER_EMAIL) throw new Error("O primeiro acesso está restrito ao e-mail proprietário autorizado.");
        if (password.length < 12) throw new Error("Crie uma senha com pelo menos 12 caracteres.");
        if (password !== confirmPassword) throw new Error("A confirmação da senha não confere.");
        const { data, error } = await supabase.auth.signUp({
          email: OWNER_EMAIL,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth/callback" },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }
        setMessage("Solicitação de primeiro acesso enviada. Confira a caixa de entrada do e-mail autorizado e confirme a conta para liberar o workspace.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir o acesso.");
    } finally {
      setBusy(false);
    }
  }

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#080d16", color: "#f3f6fb" }}>
    <form onSubmit={submit} style={{ width: "min(100%, 430px)", display: "grid", gap: 14, padding: 26, border: "1px solid #263248", borderRadius: 18, background: "#101827" }}>
      <div style={{ color: "#a99fff", fontSize: 11, letterSpacing: 2 }}>ARCANY DIGITAL</div>
      <h1 style={{ fontSize: 27, margin: 0 }}>{mode === "login" ? "Acesso do proprietário" : "Primeiro acesso"}</h1>
      <p style={{ color: "#9aa8bc", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        Workspace privado da agência. Somente a conta proprietária autorizada pode entrar. Empresas e clientes são registros de trabalho, não usuários da Arcany.
      </p>
      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>E-mail proprietário
        <input required autoComplete="username" type="email" value={email} readOnly={mode === "setup"} onChange={e => setEmail(e.target.value)} style={field}/>
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>Senha
        <input required autoComplete={mode === "login" ? "current-password" : "new-password"} type="password" minLength={mode === "setup" ? 12 : 1} value={password} onChange={e => setPassword(e.target.value)} style={field}/>
      </label>
      {mode === "setup" && <label style={{ display: "grid", gap: 6, fontSize: 12 }}>Confirmar senha
        <input required autoComplete="new-password" type="password" minLength={12} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={field}/>
      </label>}
      <button disabled={busy} style={button}>{busy ? "Processando..." : mode === "login" ? "Entrar no workspace" : "Criar acesso do proprietário"}</button>
      <button type="button" disabled={busy} onClick={() => { setMode(mode === "login" ? "setup" : "login"); setPassword(""); setConfirmPassword(""); setMessage(""); }} style={secondaryButton}>
        {mode === "login" ? "Primeiro acesso do proprietário" : "Já tenho uma conta. Voltar ao login"}
      </button>
      {message && <p role="status" aria-live="polite" style={{ color: "#f4c879", fontSize: 12, lineHeight: 1.5 }}>{message}</p>}
      <p style={{ color: "#718096", fontSize: 10, lineHeight: 1.5, margin: 0 }}>
        O primeiro acesso cria somente a conta autorizada e seu workspace interno. O banco rejeita cadastros de qualquer outro e-mail.
      </p>
    </form>
  </main>;
}

const field: React.CSSProperties = { width: "100%", minHeight: 44, border: "1px solid #35435a", borderRadius: 9, background: "#0b1220", color: "#f3f6fb", padding: "0 12px" };
const button: React.CSSProperties = { minHeight: 44, border: 0, borderRadius: 9, background: "#7666ed", color: "white", fontWeight: 700, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { minHeight: 40, border: "1px solid #35435a", borderRadius: 9, background: "transparent", color: "#cbd5e1", fontWeight: 600, cursor: "pointer" };
