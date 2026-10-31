"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ArrowRight, CalendarClock, MessageCircle, Search, Users } from "lucide-react";

type Stage = "novo" | "contato" | "proposta" | "negociacao" | "cliente" | "perdido";
type Lead = { id: string; company: string; contact: string; phone: string; segment: string; interest: string; stage: Stage; followUp: string; notes: string };
const STORAGE_KEY = "arcany-leads-v1";
const columns: { id: Stage; title: string; hint: string }[] = [
  { id: "novo", title: "Novos leads", hint: "Ainda não contatados" },
  { id: "contato", title: "Em contato", hint: "Primeira conversa feita" },
  { id: "proposta", title: "Proposta enviada", hint: "Aguardando resposta" },
  { id: "negociacao", title: "Negociação", hint: "Ajustando a solução" },
  { id: "cliente", title: "Fechados", hint: "Clientes conquistados" },
  { id: "perdido", title: "Não avançaram", hint: "Oportunidades encerradas" },
];

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLeads(JSON.parse(raw) as Lead[]);
    } catch { /* Dados locais inválidos não bloqueiam o CRM. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads, ready]);

  const filtered = useMemo(() => leads.filter((lead) =>
    [lead.company, lead.contact, lead.segment, lead.interest].join(" ").toLowerCase().includes(query.toLowerCase())
  ), [leads, query]);
  const active = leads.filter((lead) => !["cliente", "perdido"].includes(lead.stage)).length;
  const due = leads.filter((lead) => lead.followUp && lead.followUp <= new Date().toISOString().slice(0, 10) && !["cliente", "perdido"].includes(lead.stage)).length;

  function move(id: string, stage: Stage) {
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, stage } : lead));
  }
  function whatsapp(phone: string) {
    const number = phone.replace(/\D/g, "").replace(/^55/, "");
    return "https://wa.me/55" + number;
  }

  return <AppShell><div className="content">
    <div className="eyebrow">Gestão de vendas</div>
    <h1 className="page-title">CRM comercial</h1>
    <p className="page-description">Acompanhe sua carteira de empresas desde o primeiro contato até o fechamento. As etapas são compartilhadas com o módulo Leads neste navegador.</p>

    <div className="stat-grid" style={{ marginTop: 22 }}>
      {[{ label: "Oportunidades abertas", value: active, note: "Leads em andamento" }, { label: "Propostas e negociações", value: leads.filter((l) => ["proposta", "negociacao"].includes(l.stage)).length, note: "Em fase comercial" }, { label: "Retornos pendentes", value: due, note: "Data de retorno hoje ou atrasada" }, { label: "Clientes fechados", value: leads.filter((l) => l.stage === "cliente").length, note: "Negócios conquistados" }].map((item) => <div className="panel stat-card" key={item.label}><div className="stat-label">{item.label}</div><div className="stat-value">{item.value}</div><div className="stat-note">{item.note}</div></div>)}
    </div>

    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-heading" style={{ flexWrap: "wrap" }}>
        <div><div className="panel-title">Pipeline de vendas</div><div className="panel-subtitle">{ready ? leads.length + " empresa(s) na carteira" : "Carregando carteira..."}</div></div>
        <Link className="action-button" href="/leads">Gerenciar leads <ArrowRight size={14}/></Link>
      </div>
      <div style={{ padding: "0 16px 15px" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--border)", borderRadius: 9, padding: "0 11px", maxWidth: 420, minHeight: 40, color: "var(--muted)" }}><Search size={14}/><input aria-label="Buscar no CRM" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar empresa, contato ou segmento..." style={{ background: "transparent", border: 0, outline: 0, color: "white", width: "100%", fontSize: 11 }}/></label>
      </div>
      {!ready ? <div className="empty-state">Carregando CRM...</div> : leads.length === 0 ? <div className="empty-state"><div className="empty-icon"><Users size={19}/></div><div className="empty-title">Sua carteira ainda está vazia</div><p className="empty-copy">Cadastre empresas no módulo Leads. Elas aparecerão automaticamente neste pipeline.</p><Link className="action-button" href="/leads" style={{ marginTop: 12 }}>Cadastrar primeiro lead <ArrowRight size={14}/></Link></div> : <div style={{ display: "grid", gridTemplateColumns: "repeat( auto-fit, minmax(min(100%, 235px), 1fr))", gap: 10, padding: "0 16px 16px", alignItems: "start" }}>
        {columns.map((column) => {
          const items = filtered.filter((lead) => lead.stage === column.id);
          return <section key={column.id} style={{ background: "rgba(255,255,255,.018)", border: "1px solid var(--border)", borderRadius: 11, minWidth: 0 }}>
            <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><strong style={{ fontSize: 11 }}>{column.title}</strong><span className="coming-tag">{items.length}</span></div><div style={{ color: "var(--muted)", fontSize: 10, marginTop: 4 }}>{column.hint}</div></div>
            <div style={{ display: "grid", gap: 8, padding: 9 }}>
              {items.length ? items.map((lead) => <article key={lead.id} style={{ background: "#101827", border: "1px solid var(--border)", borderRadius: 9, padding: 10 }}>
                <strong style={{ fontSize: 11, display: "block", overflowWrap: "anywhere" }}>{lead.company}</strong>
                <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 5 }}>{[lead.contact, lead.segment].filter(Boolean).join(" · ") || "Sem contato ou segmento informado"}</div>
                {lead.interest && <div style={{ color: "#c2baff", fontSize: 10, marginTop: 6 }}>Interesse: {lead.interest}</div>}
                {lead.followUp && <div style={{ color: "#e9bd72", fontSize: 10, display: "flex", gap: 5, alignItems: "center", marginTop: 7 }}><CalendarClock size={12}/>{new Date(lead.followUp + "T12:00:00").toLocaleDateString("pt-BR")}</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                  <select aria-label={"Mover etapa de " + lead.company} value={lead.stage} onChange={(e) => move(lead.id, e.target.value as Stage)} style={{ flex: 1, minWidth: 125, background: "#0c121d", color: "#e9edf5", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 7px", fontSize: 10 }}>{columns.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}</select>
                  {lead.phone && <a className="secondary-button" href={whatsapp(lead.phone)} target="_blank" rel="noreferrer" aria-label={"Abrir WhatsApp de " + lead.company}><MessageCircle size={12}/> WhatsApp</a>}
                </div>
              </article>) : <div style={{ color: "var(--muted)", fontSize: 10, textAlign: "center", padding: "15px 5px" }}>{query ? "Nenhum resultado" : "Nenhuma empresa nesta etapa"}</div>}
            </div>
          </section>;
        })}
      </div>}
    </section>
    <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, marginTop: 12 }}>Limitação atual: o CRM compartilha os dados com Leads apenas no mesmo navegador e aparelho. Ainda não há login, banco de dados na nuvem, lembretes automáticos ou sincronização entre usuários.</p>
  </div></AppShell>;
}
