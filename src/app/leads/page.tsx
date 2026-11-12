"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAccountScopedStorageKey } from "@/lib/supabase/account-storage";
import { LocalBackupButton } from "@/components/local-backup-button";
import { Plus, Search, Phone, MessageCircle, Pencil, Trash2, Download, CloudUpload } from "lucide-react";

type Stage = "novo" | "contato" | "proposta" | "negociacao" | "cliente" | "perdido";
type Lead = { id: string; company: string; contact: string; phone: string; segment: string; interest: string; stage: Stage; followUp: string; notes: string };
const stages: Record<Stage, string> = { novo: "Novo lead", contato: "Contato realizado", proposta: "Proposta enviada", negociacao: "Em negociação", cliente: "Cliente fechado", perdido: "Não avançou" };
const STORAGE_KEY = "arcany-leads-v1";
const blank = { company: "", contact: "", phone: "", segment: "", interest: "", stage: "novo" as Stage, followUp: "", notes: "" };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ready, setReady] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAccountData() {
      const scopedKey = await getAccountScopedStorageKey(STORAGE_KEY);
      if (!active) return;
      setStorageKey(scopedKey);
      if (scopedKey) {
        try {
          const saved = localStorage.getItem(scopedKey);
          if (saved) setLeads(JSON.parse(saved) as Lead[]);
        } catch { /* Mantém a tela utilizável se houver dados locais inválidos. */ }
      }
      setReady(true);
    }
    void loadAccountData();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (ready && storageKey) localStorage.setItem(storageKey, JSON.stringify(leads));
  }, [leads, ready, storageKey]);

  const visible = useMemo(() => leads.filter((lead) => {
    const text = [lead.company, lead.contact, lead.phone, lead.segment, lead.interest].join(" ").toLowerCase();
    return (filter === "todos" || lead.stage === filter) && text.includes(query.toLowerCase());
  }), [leads, query, filter]);
  const metrics = [
    ["Total", leads.length],
    ["Em andamento", leads.filter((l) => !["cliente", "perdido"].includes(l.stage)).length],
    ["Propostas", leads.filter((l) => ["proposta", "negociacao"].includes(l.stage)).length],
    ["Clientes", leads.filter((l) => l.stage === "cliente").length],
  ];

  async function syncToCloud() {
    const db = getSupabaseBrowserClient();
    if (!db) { setSyncMessage("Configure o Supabase na Vercel para sincronizar."); return; }
    setSyncing(true); setSyncMessage("");
    try {
      const { data: userData, error: userError } = await db.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Entre na sua conta antes de sincronizar.");
      const { data: membership, error: memberError } = await db.from("organization_members").select("organization_id").eq("user_id", userData.user.id).maybeSingle();
      if (memberError) throw memberError;
      if (!membership) throw new Error("Organização não encontrada. Acesse Conta e conclua o cadastro.");
      const { data: existing, error: existingError } = await db.from("leads").select("company_name,phone").eq("organization_id", membership.organization_id);
      if (existingError) throw existingError;
      const keys = new Set((existing || []).map((x: {company_name:string;phone:string|null}) => x.company_name.toLowerCase().trim()+"|"+(x.phone||"").replace(/\D/g,"")));
      const pending = leads.filter(l => !keys.has(l.company.toLowerCase().trim()+"|"+l.phone.replace(/\D/g,"")));
      if (!pending.length) { setSyncMessage("Seus leads já estão sincronizados. Nenhum registro duplicado foi criado."); return; }
      const payload = pending.map(l => ({ organization_id: membership.organization_id, company_name: l.company, contact_name: l.contact || null, phone: l.phone || null, segment: l.segment || null, interest: l.interest || null, stage: l.stage, follow_up_at: l.followUp || null, notes: l.notes || null }));
      const { error } = await db.from("leads").insert(payload);
      if (error) throw error;
      setSyncMessage(pending.length+" lead(s) enviados para a nuvem com sucesso.");
    } catch (error) { setSyncMessage(error instanceof Error ? error.message : "Não foi possível sincronizar."); }
    finally { setSyncing(false); }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.company.trim()) return;
    if (editing) setLeads((all) => all.map((l) => l.id === editing ? { ...l, ...form, company: form.company.trim() } : l));
    else setLeads((all) => [{ ...form, company: form.company.trim(), id: String(Date.now()) }, ...all]);
    setForm(blank); setEditing(null); setShowForm(false);
  }
  function edit(lead: Lead) { setForm({ company: lead.company, contact: lead.contact, phone: lead.phone, segment: lead.segment, interest: lead.interest, stage: lead.stage, followUp: lead.followUp, notes: lead.notes }); setEditing(lead.id); setShowForm(true); }
  function exportCsv() {
    const rows = [["Empresa","Contato","Telefone","Segmento","Interesse","Etapa","Retorno","Observações"], ...leads.map((l) => [l.company,l.contact,l.phone,l.segment,l.interest,stages[l.stage],l.followUp,l.notes])];
    const csv = rows.map((r) => r.map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "arcany-leads.csv"; a.click(); URL.revokeObjectURL(url);
  }
  const field = { width: "100%", minHeight: 40, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", fontSize: 11 };
  const label = { display: "grid", gap: 6, color: "#aeb9ca", fontSize: 11 };

  return <AppShell><div className="content">
    <div className="eyebrow">Relacionamento comercial</div><h1 className="page-title">Leads</h1>
    <p className="page-description">Cadastre empresas interessadas e acompanhe cada conversa até fechar negócio.</p>
    <div className="stat-grid" style={{ marginTop: 22 }}>{metrics.map(([name, value]) => <div className="panel stat-card" key={name}><div className="stat-label">{name}</div><div className="stat-value">{value}</div></div>)}</div>
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-heading" style={{ flexWrap: "wrap" }}><div><div className="panel-title">Carteira de oportunidades</div><div className="panel-subtitle">{ready ? leads.length + " lead(s) salvos neste navegador" : "Carregando..."}</div></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><LocalBackupButton/><button className="secondary-button" type="button" onClick={syncToCloud} disabled={!leads.length || syncing}><CloudUpload size={13}/> {syncing ? "Sincronizando..." : "Sincronizar nuvem"}</button><button className="secondary-button" type="button" onClick={exportCsv} disabled={!leads.length}><Download size={13}/> Exportar CSV</button><button className="action-button" type="button" onClick={() => { setForm(blank); setEditing(null); setShowForm(!showForm); }}><Plus size={14}/> Novo lead</button></div>
      </div>
      {syncMessage && <p role="status" style={{padding:"0 16px",fontSize:11,color:"#e9c77b"}}>{syncMessage}</p>}
      {showForm && <form onSubmit={save} style={{ margin: 16, padding: 15, border: "1px solid rgba(139,124,255,.28)", borderRadius: 12, display: "grid", gap: 11 }}>
        <strong style={{ fontSize: 13 }}>{editing ? "Editar lead" : "Cadastrar lead"}</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          <label style={label}>Empresa *<input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={field} placeholder="Nome da empresa"/></label>
          <label style={label}>Responsável<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} style={field}/></label>
          <label style={label}>Telefone / WhatsApp<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={field} placeholder="(32) 99999-9999"/></label>
          <label style={label}>Segmento<input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} style={field} placeholder="Ex.: Restaurante"/></label>
          <label style={label}>Solução de interesse<input value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} style={field} placeholder="Site, estoque, CRM..."/></label>
          <label style={label}>Etapa<select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })} style={field}>{Object.entries(stages).map(([v,n]) => <option key={v} value={v}>{n}</option>)}</select></label>
          <label style={label}>Data para retornar<input type="date" value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} style={field}/></label>
        </div>
        <label style={label}>Anotações<textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...field, padding: 10 }} placeholder="Resumo da conversa e próximo passo"/></label>
        <div style={{ display: "flex", gap: 8 }}><button className="action-button" type="submit">Salvar lead</button><button className="secondary-button" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</button></div>
      </form>}
      <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
        <label style={label}><span style={{ display: "flex", gap: 6, alignItems: "center" }}><Search size={13}/> Buscar</span><input value={query} onChange={(e) => setQuery(e.target.value)} style={field} placeholder="Empresa, contato, segmento..."/></label>
        <label style={label}>Etapa<select value={filter} onChange={(e) => setFilter(e.target.value)} style={field}><option value="todos">Todas</option>{Object.entries(stages).map(([v,n]) => <option key={v} value={v}>{n}</option>)}</select></label>
      </div>
      {visible.length ? <div style={{ display: "grid", gap: 9, padding: "0 16px 16px" }}>{visible.map((lead) => <article key={lead.id} style={{ border: "1px solid var(--border)", borderRadius: 11, padding: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div style={{ flex: 1, minWidth: 0 }}><strong style={{ fontSize: 13 }}>{lead.company}</strong><span className="coming-tag" style={{ marginLeft: 8 }}>{stages[lead.stage]}</span>
          <p style={{ color: "var(--muted)", fontSize: 10, margin: "7px 0" }}>{[lead.contact, lead.segment, lead.interest].filter(Boolean).join(" · ")}</p>
          {lead.followUp && <p style={{ color: "#e9bd72", fontSize: 10, margin: "6px 0" }}>Retorno: {new Date(lead.followUp + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
          {lead.notes && <p style={{ color: "#aeb9ca", fontSize: 11, margin: "6px 0" }}>{lead.notes}</p>}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>{lead.phone && <><a className="secondary-button" href={"tel:" + lead.phone.replace(/[^+\d]/g,"")}><Phone size={12}/> Ligar</a><a className="secondary-button" href={"https://wa.me/55" + lead.phone.replace(/\D/g,"").replace(/^55/,"")} target="_blank" rel="noreferrer"><MessageCircle size={12}/> WhatsApp</a></>}<button className="secondary-button" type="button" onClick={() => edit(lead)} aria-label="Editar"><Pencil size={12}/></button><button className="secondary-button" type="button" onClick={() => { if (confirm("Excluir este lead?")) setLeads((all) => all.filter((l) => l.id !== lead.id)); }} aria-label="Excluir"><Trash2 size={12}/></button></div>
        </div>
      </article>)}</div> : <div className="empty-state"><div className="empty-title">{leads.length ? "Nenhum resultado" : "Sua carteira começa com o primeiro contato"}</div><p className="empty-copy">{leads.length ? "Altere a busca ou o filtro." : "Cadastre uma empresa encontrada na prospecção para acompanhar o contato."}</p></div>}
    </section>
    <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, marginTop: 12 }}>Os cadastros feitos nesta tela permanecem no navegador até você usar “Sincronizar nuvem”. A sincronização envia os registros para a organização conectada e evita duplicar empresa + telefone.</p>
  </div></AppShell>;
}
