"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Activity, Building2, BriefcaseBusiness, CheckCircle2, CircleAlert, FileStack, FolderKanban, ShieldCheck, Users } from "lucide-react";

type Stats={companies:number;leads:number;projects:number;assets:number;email:string;workspace:boolean;connected:boolean};
const empty:Stats={companies:0,leads:0,projects:0,assets:0,email:"",workspace:false,connected:false};
const cards=[
 {key:"companies",label:"Empresas",icon:Building2,href:"/empresas"},
 {key:"leads",label:"Leads",icon:Users,href:"/leads"},
 {key:"projects",label:"Projetos",icon:FolderKanban,href:"/projetos"},
 {key:"assets",label:"Arquivos de clientes",icon:FileStack,href:"/projetos"}
] as const;

export default function AdministrationPage(){
 const [stats,setStats]=useState(empty);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  let active=true;
  async function load(){
   const db=getSupabaseBrowserClient();
   if(!db){setMessage("As variáveis públicas do Supabase não estão disponíveis neste ambiente.");setLoading(false);return;}
   try{
    const {data:userData,error:userError}=await db.auth.getUser();
    if(userError)throw userError;
    if(!userData.user)throw new Error("Sessão não encontrada. Entre com a conta proprietária.");
    const {data:member,error:memberError}=await db.from("organization_members").select("organization_id").eq("user_id",userData.user.id).maybeSingle();
    if(memberError)throw memberError;
    if(!member)throw new Error("A conta autenticada ainda não está vinculada ao workspace Arcany.");
    const org=member.organization_id;
    const [companies,leads,projects,assets]=await Promise.all([
     db.from("companies").select("id",{count:"exact",head:true}).eq("organization_id",org),
     db.from("leads").select("id",{count:"exact",head:true}).eq("organization_id",org),
     db.from("projects").select("id",{count:"exact",head:true}).eq("organization_id",org),
     db.from("project_assets").select("id",{count:"exact",head:true}).eq("organization_id",org)
    ]);
    const failure=[companies.error,leads.error,projects.error,assets.error].find(Boolean);
    if(failure)throw failure;
    if(active)setStats({companies:companies.count||0,leads:leads.count||0,projects:projects.count||0,assets:assets.count||0,email:userData.user.email||"",workspace:true,connected:true});
   }catch(error){if(active)setMessage(error instanceof Error?error.message:"Não foi possível validar o workspace.");}
   finally{if(active)setLoading(false);}
  }
  void load();return()=>{active=false;};
 },[]);
 return <AppShell><div className="content">
  <div className="eyebrow">Controle interno da agência</div>
  <h1 className="page-title">Administração</h1>
  <p className="page-description">Acompanhe a operação, os projetos e a integridade do workspace privado da Arcany Digital.</p>
  <section className="panel" style={{padding:16,marginTop:18,display:"grid",gap:10}}>
   <div style={{display:"flex",alignItems:"center",gap:8}}><ShieldCheck size={17} color="#a99fff"/><strong style={{fontSize:13}}>Conta e workspace</strong></div>
   {loading?<p style={{fontSize:11,color:"var(--muted)"}}>Verificando sessão e conexão...</p>:<>
    <div style={{display:"flex",gap:8,alignItems:"center",fontSize:11}}>{stats.connected?<CheckCircle2 size={15} color="#63c995"/>:<CircleAlert size={15} color="#e9bd72" />}{stats.connected?"Conexão autenticada e workspace localizado":"Conexão ou provisionamento pendente"}</div>
    {stats.email&&<div style={{fontSize:11,color:"var(--muted)"}}>Conta: {stats.email}</div>}
    {message&&<p role="status" style={{fontSize:11,color:"#e9c77b",lineHeight:1.6,margin:0}}>{message}</p>}
   </>}
  </section>
  <div className="stat-grid" style={{marginTop:14}}>
   {cards.map(card=>{const Icon=card.icon;return <Link key={card.key} href={card.href} className="panel stat-card" style={{textDecoration:"none",display:"block"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="stat-label">{card.label}</span><Icon size={16} color="#a99fff"/></div><div className="stat-value">{loading?"…":stats[card.key]}</div><div className="stat-note">Registros reais do banco</div></Link>;})}
  </div>
  <div className="section-grid" style={{marginTop:14}}>
   <section className="panel" style={{padding:16}}>
    <div style={{display:"flex",gap:8,alignItems:"center"}}><BriefcaseBusiness size={16} color="#a99fff"/><h2 style={{fontSize:13,margin:0}}>Operação</h2></div>
    <div className="feature-list">
     <Link href="/crm" className="feature-row"><div className="feature-name">Pipeline comercial</div><span className="coming-tag">CRM</span></Link>
     <Link href="/diagnostico" className="feature-row"><div className="feature-name">Diagnósticos e oportunidades</div><span className="coming-tag">Análise</span></Link>
     <Link href="/modelos" className="feature-row"><div className="feature-name">Biblioteca de soluções</div><span className="coming-tag">Modelos</span></Link>
     <Link href="/projetos" className="feature-row"><div className="feature-name">Produção e entrega</div><span className="coming-tag">Projetos</span></Link>
    </div>
   </section>
   <section className="panel" style={{padding:16}}>
    <div style={{display:"flex",gap:8,alignItems:"center"}}><Activity size={16} color="#a99fff"/><h2 style={{fontSize:13,margin:0}}>Controles operacionais</h2></div>
    <ul style={{paddingLeft:18,margin:0,fontSize:11,lineHeight:1.9,color:"var(--muted)"}}>
     <li>Workspace privado, sem cadastro de clientes.</li>
     <li>Rotas internas protegidas por sessão e e-mail autorizado.</li>
     <li>Dados de negócio protegidos por RLS e vínculo de organização.</li>
     <li>Arquivos de clientes armazenados em bucket privado.</li>
     <li>Links de preview e publicação registrados por projeto.</li>
    </ul>
    <p style={{fontSize:10,lineHeight:1.6,color:"var(--muted)",margin:0}}>A ativação completa ainda depende do provisionamento seguro da conta proprietária e de testes reais de autenticação e persistência.</p>
   </section>
  </div>
 </div></AppShell>;
}
