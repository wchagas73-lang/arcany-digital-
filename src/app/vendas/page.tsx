"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Copy, MessageCircle, Save, Sparkles, Globe, ShoppingBag, Workflow } from "lucide-react";

type Stage = "novo";
type Lead = { id: string; company: string; contact: string; phone: string; segment: string; interest: string; stage: Stage; followUp: string; notes: string };

const offers = [
  { title: "Presença digital profissional", icon: Globe, fit: "Lojas, profissionais e prestadores de serviço", includes: ["Site profissional adaptado para celular", "Apresentação de serviços, fotos e localização", "Botão de WhatsApp e formulário de contato"], pitch: "um site profissional para apresentar melhor sua empresa e facilitar o contato de novos clientes" },
  { title: "Catálogo e pedidos pelo WhatsApp", icon: ShoppingBag, fit: "Restaurantes, hortifrutis, lojas e delivery", includes: ["Catálogo organizado por categorias", "Produtos, preços e informações", "Carrinho ou seleção de itens e envio do pedido pelo WhatsApp"], pitch: "um catálogo digital para seus clientes conhecerem os produtos e enviarem pedidos pelo WhatsApp" },
  { title: "Organização e gestão comercial", icon: Workflow, fit: "Negócios com equipe, clientes ou estoque", includes: ["Levantamento do processo atual", "Proposta de CRM, estoque ou painel de indicadores", "Projeto sob medida conforme a necessidade"], pitch: "uma solução para organizar clientes, estoque ou informações da operação, conforme a necessidade da empresa" }
];

export default function VendasPage() {
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState("");
  const [segment, setSegment] = useState("");
  const [offer, setOffer] = useState(0);
  const [observation, setObservation] = useState("");
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => {
    const greeting = contact.trim() ? "Olá, " + contact.trim() + "! Tudo bem?" : "Olá! Tudo bem?";
    const business = company.trim() ? " Vi a " + company.trim() + " e gostaria de apresentar uma ideia." : " Gostaria de apresentar uma ideia para sua empresa.";
    const detail = observation.trim() ? " Notei um ponto que pode valer a pena avaliar: " + observation.trim() + "." : "";
    return greeting + business + detail + " Trabalho com soluções digitais para negócios, como " + offers[offer].pitch + ". A ideia é entender primeiro como vocês trabalham e mostrar uma demonstração, sem compromisso. Podemos conversar por alguns minutos?";
  }, [company, contact, observation, offer]);

  const cleanPhone = phone.replace(/\D/g, "").replace(/^55/, "");
  const whatsappUrl = cleanPhone.length >= 10 ? "https://wa.me/55" + cleanPhone + "?text=" + encodeURIComponent(message) : "";

  async function copyMessage() {
    try { await navigator.clipboard.writeText(message); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { alert("Não foi possível copiar automaticamente. Selecione e copie o texto da mensagem."); }
  }

  function saveLead() {
    if (!company.trim()) { alert("Informe o nome da empresa antes de salvar."); return; }
    const key = "arcany-leads-v1";
    let current: Lead[] = [];
    try { current = JSON.parse(localStorage.getItem(key) || "[]") as Lead[]; } catch { current = []; }
    if (current.some((lead) => lead.company.trim().toLowerCase() === company.trim().toLowerCase())) {
      alert("Essa empresa já está na carteira de leads."); return;
    }
    current.unshift({ id: "lead-" + Date.now(), company: company.trim(), contact: contact.trim(), phone: phone.trim(), segment: segment.trim(), interest: offers[offer].title, stage: "novo", followUp: "", notes: observation.trim() || "Lead criado na Central de vendas." });
    localStorage.setItem(key, JSON.stringify(current));
    alert("Lead salvo na carteira. Abra o módulo Leads para acompanhar.");
  }

  const field: React.CSSProperties = { width: "100%", minHeight: 42, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", fontSize: 12 };
  const label: React.CSSProperties = { display: "grid", gap: 6, color: "#aeb9ca", fontSize: 11 };

  return <AppShell><div className="content">
    <div className="eyebrow">Operação comercial</div>
    <h1 className="page-title">Central de vendas</h1>
    <p className="page-description">Escolha uma solução, personalize a abordagem e abra a conversa no WhatsApp. Registre cada oportunidade para não perder o acompanhamento.</p>

    <div className="section-grid" style={{ marginTop: 20 }}>
      {offers.map((item, index) => { const Icon = item.icon; return <button key={item.title} type="button" onClick={() => setOffer(index)} className="panel" style={{ textAlign: "left", padding: 16, cursor: "pointer", border: offer === index ? "1px solid #8e82f3" : "1px solid var(--border)", background: offer === index ? "rgba(142,130,243,.08)" : undefined, color: "inherit" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><span className="feature-icon"><Icon size={17}/></span>{offer === index && <span className="coming-tag">Selecionado</span>}</div>
        <h2 style={{ fontSize: 14, margin: "13px 0 5px" }}>{item.title}</h2>
        <p style={{ color: "var(--muted)", fontSize: 10, margin: "0 0 10px" }}>{item.fit}</p>
        <ul style={{ paddingLeft: 17, margin: 0, color: "#c5cede", fontSize: 11, lineHeight: 1.8 }}>{item.includes.map((line) => <li key={line}>{line}</li>)}</ul>
      </button>; })}
    </div>

    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-heading"><div><div className="panel-title">Preparar abordagem</div><div className="panel-subtitle">Preencha os dados conhecidos e personalize antes de enviar</div></div><Sparkles size={17} color="#a99fff"/></div>
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
          <label style={label}>Nome da empresa *<input value={company} onChange={(e) => setCompany(e.target.value)} style={field} placeholder="Ex.: Loja Exemplo"/></label>
          <label style={label}>Nome do responsável (opcional)<input value={contact} onChange={(e) => setContact(e.target.value)} style={field} placeholder="Como a pessoa prefere ser chamada"/></label>
          <label style={label}>WhatsApp da empresa<input value={phone} onChange={(e) => setPhone(e.target.value)} style={field} placeholder="(32) 99999-9999"/></label>
          <label style={label}>Segmento<input value={segment} onChange={(e) => setSegment(e.target.value)} style={field} placeholder="Ex.: Pet shop, restaurante..."/></label>
        </div>
        <label style={label}>Oportunidade observada (opcional)<textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={2} style={{ ...field, padding: 10 }} placeholder="Ex.: não encontrei um catálogo online; confirmar com a empresa."/></label>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 13, background: "#0c121d" }}>
          <div style={{ fontSize: 10, color: "#a99fff", fontWeight: 700, marginBottom: 8 }}>MENSAGEM SUGERIDA — REVISE ANTES DE ENVIAR</div>
          <p style={{ whiteSpace: "pre-wrap", color: "#e1e7f0", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{message}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" className="action-button" onClick={copyMessage}><Copy size={13}/>{copied ? "Copiado!" : "Copiar mensagem"}</button>
          <a className="action-button" href={whatsappUrl || undefined} target="_blank" rel="noreferrer" aria-disabled={!whatsappUrl} onClick={(e) => { if (!whatsappUrl) { e.preventDefault(); alert("Informe um WhatsApp válido com DDD."); } }} style={{ opacity: whatsappUrl ? 1 : .5, textDecoration: "none" }}><MessageCircle size={13}/> Abrir WhatsApp</a>
          <button type="button" className="secondary-button" onClick={saveLead}><Save size={13}/> Salvar lead</button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, margin: 0 }}>A mensagem é um primeiro contato, não uma promessa de resultado. Personalize com algo verdadeiro que você observou e respeite pedidos para não receber novas mensagens. Os leads salvos ficam neste navegador até a integração com o banco de dados.</p>
      </div>
    </section>
  </div></AppShell>;
}
