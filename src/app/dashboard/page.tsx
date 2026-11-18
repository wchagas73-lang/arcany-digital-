"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getAccountScopedStorageKey } from "@/lib/supabase/account-storage";
import { ArrowUpRight, Building2, ContactRound, Search, Sparkles, Target, Workflow, Globe } from "lucide-react";

type Lead = { stage?: string };
type Company = { id: string };
const modules = [
  { title: "Prospecção inteligente", detail: "Encontre negócios por cidade e segmento.", icon: Search, tag: "Pesquisar empresas", href: "/prospeccao" },
  { title: "Análise de presença digital", detail: "Identifique sites, avaliações e canais online.", icon: ArrowUpRight, tag: "Fazer diagnóstico", href: "/diagnostico" },
  { title: "CRM comercial", detail: "Organize contatos, etapas e acompanhamentos.", icon: ContactRound, tag: "Abrir pipeline", href: "/crm" },
  { title: "Criador de projetos", detail: "Monte sites, cardápios e vitrines digitais.", icon: Globe, tag: "Criar projeto", href: "/projetos" },
];

export default function DashboardPage() {
  const [stats,setStats]=useState({companies:0,leads:0,opportunities:0,clients:0});
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    let active=true;
    async function loadAccountStats(){
      const [companyKey,leadKey]=await Promise.all([getAccountScopedStorageKey("arcany-companies-v1"),getAccountScopedStorageKey("arcany-leads-v1")]);
      if(!active)return;
      try{
        const companies=companyKey?JSON.parse(localStorage.getItem(companyKey)||"[]") as Company[]:[];
        const leads=leadKey?JSON.parse(localStorage.getItem(leadKey)||"[]") as Lead[]:[];
        setStats({companies:companies.length,leads:leads.length,opportunities:leads.filter(l=>["novo","contato","proposta","negociacao"].includes(l.stage||"")).length,clients:leads.filter(l=>l.stage==="cliente").length});
      }catch{/* Mantém indicadores zerados se o armazenamento local estiver inválido. */}
      setLoaded(true);
    }
    void loadAccountStats();
    return ()=>{active=false;};
  },[]);
  const cards=[
    {label:"Empresas na base",value:stats.companies,note:"Registros organizados",icon:Building2,href:"/empresas"},
    {label:"Leads cadastrados",value:stats.leads,note:"Contatos na carteira",icon:Target,href:"/leads"},
    {label:"Oportunidades abertas",value:stats.opportunities,note:"Negociações em andamento",icon:Workflow,href:"/crm"},
    {label:"Clientes fechados",value:stats.clients,note:"Negócios conquistados",icon:Sparkles,href:"/crm"}
  ];
  return <AppShell><div className="content">
    <div className="eyebrow">Seu centro de inteligência comercial</div>
    <h1 className="page-title">Visão geral</h1>
    <p className="page-description">Bem-vindo à Arcany Digital. Encontre empresas, registre oportunidades, acompanhe negociações e prepare soluções digitais para cada negócio.</p>
    <div className="stat-grid" style={{marginTop:22}}>
      {cards.map((stat)=>{const Icon=stat.icon;return <Link href={stat.href} className="panel stat-card" key={stat.label} style={{textDecoration:"none",display:"block"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className="stat-label">{stat.label}</span><Icon size={17} color="#a99fff"/></div><div className="stat-value">{loaded?stat.value:"—"}</div><div className="stat-note">{stat.note}</div></Link>;})}
    </div>
    <div className="section-grid" style={{marginTop:16}}>
      <section className="panel">
        <div className="panel-heading"><div><div className="panel-title">Comece por aqui</div><div className="panel-subtitle">Acesse os principais módulos da plataforma</div></div><span style={{color:"#8e82f3",fontSize:10}}>ARCANY</span></div>
        <div className="feature-list">{modules.map((module)=>{const Icon=module.icon;return <Link href={module.href} className="feature-row" key={module.title} style={{textDecoration:"none"}}><div className="feature-icon"><Icon size={16}/></div><div style={{flex:1}}><div className="feature-name">{module.title}</div><div className="feature-detail">{module.detail}</div></div><span className="coming-tag">{module.tag}</span></Link>;})}</div>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><div className="panel-title">Próxima ação</div><div className="panel-subtitle">Transforme pesquisa em oportunidade</div></div><Sparkles size={17} color="#a99fff"/></div>
        <div className="empty-state"><div className="empty-icon"><Search size={19}/></div><div className="empty-title">Encontre seu próximo cliente</div><p className="empty-copy">Pesquise por cidade e segmento, analise os sinais públicos e salve as empresas que merecem uma abordagem comercial.</p><Link className="action-button" href="/prospeccao" style={{marginTop:17}}>Iniciar prospecção <ArrowUpRight size={14}/></Link></div>
      </section>
    </div>
    <div className="panel page-card" style={{marginTop:16}}><h2>Uma plataforma, vários mercados</h2><p>A Arcany está sendo construída para atender diferentes nichos — do comércio local aos prestadores de serviços. Os indicadores refletem os dados locais da conta neste aparelho. A sincronização completa entre dispositivos continua em desenvolvimento.</p></div>
  </div></AppShell>;
}
