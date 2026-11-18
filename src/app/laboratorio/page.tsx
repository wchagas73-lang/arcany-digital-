"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getAccountScopedStorageKey } from "@/lib/supabase/account-storage";
import { FlaskConical, Building2, Target, FolderKanban, RotateCcw, CheckCircle2, Circle, ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";

type DemoCompany = { id: string; name: string; segment: string; city: string; phone: string; website: string; google: string; notes: string };
type DemoLead = { id: string; company: string; contact: string; phone: string; segment: string; interest: string; stage: "novo" | "contato" | "proposta" | "negociacao" | "cliente" | "perdido"; followUp: string; notes: string };
type CheckItem = { id: string; label: string; detail: string };
const COMPANY_KEY = "arcany-companies-v1";
const LEAD_KEY = "arcany-leads-v1";
const CHECK_KEY = "arcany-lab-checks-v1";
const prefix = "arcany-demo-";
const demoCompanies: DemoCompany[] = [
  { id: prefix + "company-cafe", name: "[DEMO] Café Horizonte", segment: "Cafeteria", city: "Juiz de Fora/MG", phone: "32990001001", website: "https://exemplo.invalid/cafe-horizonte", google: "a_investigar", notes: "DADO FICTÍCIO PARA TESTES. Cenário: cafeteria sem cardápio digital." },
  { id: prefix + "company-pet", name: "[DEMO] Pet Amigo", segment: "Pet shop", city: "Juiz de Fora/MG", phone: "32990001002", website: "", google: "a_investigar", notes: "DADO FICTÍCIO PARA TESTES. Cenário: pet shop que precisa de catálogo e agendamento." },
  { id: prefix + "company-beauty", name: "[DEMO] Studio Bella", segment: "Beleza", city: "Matias Barbosa/MG", phone: "32990001003", website: "https://exemplo.invalid/studio-bella", google: "a_investigar", notes: "DADO FICTÍCIO PARA TESTES. Cenário: salão que precisa de agenda online." },
];
const demoLeads: DemoLead[] = [
  { id: prefix + "lead-cafe", company: "[DEMO] Café Horizonte", contact: "Marina (personagem fictícia)", phone: "32990001001", segment: "Cafeteria", interest: "Cardápio digital e pedidos pelo WhatsApp", stage: "novo", followUp: "", notes: "Lead de demonstração. Não contatar." },
  { id: prefix + "lead-pet", company: "[DEMO] Pet Amigo", contact: "Rafael (personagem fictícia)", phone: "32990001002", segment: "Pet shop", interest: "Catálogo e agendamento", stage: "proposta", followUp: "2026-11-20", notes: "Lead de demonstração. Não contatar." },
  { id: prefix + "lead-beauty", company: "[DEMO] Studio Bella", contact: "Bianca (personagem fictícia)", phone: "32990001003", segment: "Beleza", interest: "Agendamento online", stage: "negociacao", followUp: "2026-11-21", notes: "Lead de demonstração. Não contatar." },
];
const checks: CheckItem[] = [
  { id: "access", label: "Acesso e segurança", detail: "Entrar, sair, atualizar a página e conferir bloqueio de rotas privadas." },
  { id: "companies", label: "Cadastro de empresas", detail: "Abrir Empresas, editar uma empresa de demonstração e salvar." },
  { id: "leads", label: "Carteira de leads", detail: "Alterar etapa, telefone e próximo contato de um lead de demonstração." },
  { id: "crm", label: "CRM e acompanhamento", detail: "Conferir etapas, filtros, busca e histórico disponível." },
  { id: "templates", label: "Biblioteca de modelos", detail: "Filtrar nichos, selecionar um modelo e personalizar o briefing." },
  { id: "projects", label: "Criação de projetos", detail: "Criar um projeto de demonstração usando dados fictícios e conferir o registro." },
  { id: "assets", label: "Arquivos do projeto", detail: "Enviar, visualizar e excluir um arquivo de teste." },
  { id: "publication", label: "Editor e publicação", detail: "Salvar rascunho, publicar uma página de teste e abrir em janela anônima." },
  { id: "mobile", label: "Uso no celular", detail: "Navegar pelos módulos em tela pequena, conferir menus, formulários e botões." },
  { id: "backup", label: "Backup e recuperação", detail: "Exportar backup local e conferir se os dados podem ser restaurados." },
];

export default function LaboratorioPage() {
  const [companyKey, setCompanyKey] = useState<string | null>(null);
  const [leadKey, setLeadKey] = useState<string | null>(null);
  const [checksDone, setChecksDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [counts, setCounts] = useState({ companies: 0, leads: 0 });

  async function refresh() {
    const [ck, lk] = await Promise.all([getAccountScopedStorageKey(COMPANY_KEY), getAccountScopedStorageKey(LEAD_KEY)]);
    setCompanyKey(ck); setLeadKey(lk);
    if (!ck || !lk) { setReady(true); setMessage("Entre na conta autorizada para preparar dados de demonstração na carteira desta conta."); return; }
    try {
      const companies = JSON.parse(localStorage.getItem(ck) || "[]") as DemoCompany[];
      const leads = JSON.parse(localStorage.getItem(lk) || "[]") as DemoLead[];
      setCounts({ companies: companies.length, leads: leads.length });
      const savedChecks = JSON.parse(localStorage.getItem(CHECK_KEY) || "[]") as string[];
      setChecksDone(savedChecks);
    } catch { setMessage("Não foi possível ler os dados locais. Os registros existentes foram preservados."); }
    setReady(true);
  }

  useEffect(() => { void refresh(); }, []);

  function seedDemo() {
    if (!companyKey || !leadKey) { setMessage("A conta precisa estar conectada antes de preparar a demonstração."); return; }
    try {
      const companies = JSON.parse(localStorage.getItem(companyKey) || "[]") as DemoCompany[];
      const leads = JSON.parse(localStorage.getItem(leadKey) || "[]") as DemoLead[];
      const knownCompanies = new Set(companies.map(item => item.id));
      const knownLeads = new Set(leads.map(item => item.id));
      localStorage.setItem(companyKey, JSON.stringify([...demoCompanies.filter(item => !knownCompanies.has(item.id)), ...companies]));
      localStorage.setItem(leadKey, JSON.stringify([...demoLeads.filter(item => !knownLeads.has(item.id)), ...leads]));
      setMessage("Ambiente preparado. Os registros [DEMO] aparecem em Empresas, Leads, CRM e nos indicadores. Nenhum dado real foi substituído.");
      void refresh();
    } catch { setMessage("Falha ao preparar a demonstração. Seus dados existentes não foram apagados."); }
  }

  function resetDemo() {
    if (!companyKey || !leadKey) return;
    try {
      const companies = JSON.parse(localStorage.getItem(companyKey) || "[]") as DemoCompany[];
      const leads = JSON.parse(localStorage.getItem(leadKey) || "[]") as DemoLead[];
      localStorage.setItem(companyKey, JSON.stringify(companies.filter(item => !item.id.startsWith(prefix))));
      localStorage.setItem(leadKey, JSON.stringify(leads.filter(item => !item.id.startsWith(prefix))));
      setMessage("Somente os registros de demonstração da Arcany foram removidos. Seus registros sem o prefixo DEMO foram preservados.");
      void refresh();
    } catch { setMessage("Não foi possível limpar a demonstração. Nenhum registro foi removido."); }
  }

  function toggleCheck(id: string) {
    setChecksDone(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
      localStorage.setItem(CHECK_KEY, JSON.stringify(next));
      return next;
    });
  }

  const progress = Math.round((checksDone.length / checks.length) * 100);
  return <AppShell><div className="content">
    <div className="eyebrow">Ambiente isolado de validação</div>
    <h1 className="page-title">Laboratório de testes</h1>
    <p className="page-description">Teste a Arcany sozinho, sem depender de empresas reais. Os dados abaixo são fictícios, identificados e ficam separados dos registros de clientes reais.</p>

    <section className="panel" style={{ marginTop: 22, padding: 20, borderColor: "rgba(169,159,255,.35)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="feature-icon"><FlaskConical size={19}/></div>
        <div style={{ flex: 1 }}><div className="panel-title">Preparar dados de demonstração</div><div className="panel-subtitle">3 empresas fictícias e 3 leads com etapas diferentes do funil.</div></div>
        <span className="coming-tag">TESTE</span>
      </div>
      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat-card"><div className="stat-label">Empresas neste aparelho</div><div className="stat-value">{counts.companies}</div></div>
        <div className="stat-card"><div className="stat-label">Leads neste aparelho</div><div className="stat-value">{counts.leads}</div></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 16 }}>
        <button className="action-button" type="button" onClick={seedDemo}><Sparkles size={14}/> Preparar ambiente de teste</button>
        <button className="secondary-button" type="button" onClick={resetDemo}><RotateCcw size={14}/> Remover somente dados DEMO</button>
      </div>
      {message && <p role="status" className="panel-subtitle" style={{ marginTop: 13 }}>{message}</p>}
      <p className="panel-subtitle" style={{ marginTop: 12 }}>Os dados de demonstração são armazenados no navegador deste aparelho. Eles não são enviados ao Supabase nem a serviços externos. Não use os telefones fictícios para contato.</p>
    </section>

    <div className="section-grid" style={{ marginTop: 16 }}>
      <section className="panel">
        <div className="panel-heading"><div><div className="panel-title">Cenários prontos</div><div className="panel-subtitle">Use os exemplos para percorrer os módulos.</div></div><Building2 size={17} color="#a99fff"/></div>
        {demoCompanies.map(item => <div key={item.id} className="feature-row"><div className="feature-icon"><Building2 size={15}/></div><div style={{ flex: 1 }}><div className="feature-name">{item.name}</div><div className="feature-detail">{item.segment} · {item.city}</div></div><span className="coming-tag">FICTÍCIO</span></div>)}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 13 }}>
          <Link className="secondary-button" href="/empresas">Abrir empresas <ArrowUpRight size={13}/></Link>
          <Link className="secondary-button" href="/leads">Abrir leads <ArrowUpRight size={13}/></Link>
          <Link className="secondary-button" href="/crm">Abrir CRM <ArrowUpRight size={13}/></Link>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><div className="panel-title">Fluxo de produção</div><div className="panel-subtitle">Percorra o caminho de uma solução até a entrega.</div></div><FolderKanban size={17} color="#a99fff"/></div>
        {[["1. Escolher modelo","/modelos"],["2. Criar projeto","/projetos"],["3. Gerenciar arquivos","/projetos"],["4. Editar página e publicar","/projetos"]].map(([label, href]) => <Link href={href} key={label} className="feature-row" style={{ textDecoration: "none" }}><div className="feature-icon"><ArrowUpRight size={15}/></div><div className="feature-name" style={{ flex: 1 }}>{label}</div><ArrowUpRight size={13} color="#9aa6b8"/></Link>)}
        <p className="panel-subtitle" style={{ marginTop: 12 }}>Projetos e publicações usam o banco da Arcany. Crie um projeto marcado como DEMO e não publique dados reais sem autorização.</p>
      </section>
    </div>

    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-heading"><div><div className="panel-title">Checklist de validação pessoal</div><div className="panel-subtitle">Marque cada etapa conforme for percorrendo a plataforma.</div></div><ShieldCheck size={17} color="#a99fff"/></div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", margin: "12px 0" }}><strong style={{ fontSize: 12 }}>{checksDone.length} de {checks.length} etapas</strong><strong style={{ fontSize: 12, color: "#a99fff" }}>{progress}%</strong></div>
      <div style={{ height: 7, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}><div style={{ width: progress + "%", height: "100%", background: "#8d83ef", transition: "width .2s" }}/></div>
      <div style={{ display: "grid", gap: 4, marginTop: 12 }}>
        {checks.map(item => <button type="button" key={item.id} onClick={() => toggleCheck(item.id)} className="feature-row" style={{ width: "100%", textAlign: "left", border: 0, background: "transparent", color: "inherit", cursor: "pointer" }}><span style={{ color: checksDone.includes(item.id) ? "#6dd6a1" : "#718096" }}>{checksDone.includes(item.id) ? <CheckCircle2 size={18}/> : <Circle size={18}/>}</span><span style={{ flex: 1 }}><span className="feature-name">{item.label}</span><span className="feature-detail" style={{ display: "block" }}>{item.detail}</span></span></button>)}
      </div>
      <button type="button" className="secondary-button" style={{ marginTop: 12 }} onClick={() => { setChecksDone([]); localStorage.removeItem(CHECK_KEY); }}><RotateCcw size={13}/> Reiniciar checklist</button>
    </section>
  </div></AppShell>;
}
