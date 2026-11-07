"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccessPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("Meu espaço de trabalho");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("A conexão com o Supabase ainda não foi configurada nas variáveis de ambiente da Vercel."); return; }
    setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?org=${encodeURIComponent(name.trim() || "Minha empresa")}`,
          },
        });
        if (error) throw error;
        if (!data.session) { setMessage("Cadastro recebido. Confirme o e-mail e depois entre. Se a confirmação estiver desativada no Supabase, você poderá entrar imediatamente."); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não foi possível validar o usuário.");
      const { data: membership, error: memberError } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).limit(1).maybeSingle();
      if (memberError) throw memberError;
      if (!membership) {
        const { error: orgError } = await supabase.rpc("bootstrap_organization", { org_name: name.trim() || "Minha empresa" });
        if (orgError) throw orgError;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir o acesso.");
    } finally { setBusy(false); }
  }

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#080d16", color: "#f3f6fb" }}>
    <form onSubmit={submit} style={{ width: "min(100%, 430px)", display: "grid", gap: 14, padding: 26, border: "1px solid #263248", borderRadius: 18, background: "#101827" }}>
      <div style={{ color: "#a99fff", fontSize: 11, letterSpacing: 2 }}>ARCANY DIGITAL</div>
      <h1 style={{ fontSize: 27, margin: 0 }}>{mode === "login" ? "Acessar plataforma" : "Criar sua conta"}</h1>
      <p style={{ color: "#9aa8bc", fontSize: 13, margin: 0 }}>Acesso protegido e dados isolados na conta de cada profissional.</p>
      {mode === "signup" && <label style={{ display: "grid", gap: 6, fontSize: 12 }}>Nome do seu espaço de trabalho<input required value={name} onChange={e => setName(e.target.value)} style={field}/></label>}
      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={field}/></label>
      <label style={{ display: "grid", gap: 6, fontSize: 12 }}>Senha<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} style={field}/></label>
      <button disabled={busy} style={button}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</button>
      <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }} style={{ ...button, background: "transparent", border: "1px solid #35435a" }}>{mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}</button>
      {message && <p role="status" style={{ color: "#f4c879", fontSize: 12, lineHeight: 1.5 }}>{message}</p>}
    </form>
  </main>;
}

const field = { width: "100%", minHeight: 44, border: "1px solid #35435a", borderRadius: 9, background: "#0b1220", color: "#f3f6fb", padding: "0 12px" };
const button = { minHeight: 44, border: 0, borderRadius: 9, background: "#7666ed", color: "white", fontWeight: 700, cursor: "pointer" };
