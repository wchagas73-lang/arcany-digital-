"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Plus, Search, Building2, MessageCircle, Globe, Pencil, Trash2, Target } from "lucide-react";

type Company = { id: string; name: string; segment: string; city: string; phone: string; website: string; google: string; notes: string };
type Lead = { id: string; company: string; contact: string; phone: string; segment: string; interest: string; stage: "novo"; followUp: string; notes: string };
const COMPANY_KEY="arcany-companies-v1";
const LEAD_KEY="arcany-leads-v1";
const blank={name:"",segment:"",city:"",phone:"",website:"",google:"a_investigar",notes:""};

export default function EmpresasPage() {
  const [companies,setCompanies]=useState<Company[]>([]);
  const [ready,setReady]=useState(false);
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState<string|null>(null);
  const [show,setShow]=useState(false);
  const [query,setQuery]=useState("");\n  const [leadNames,setLeadNames]=useState<string[]>([]);
  useEffect(()=>{try{const raw=localStorage.getItem(COMPANY_KEY);if(raw)setCompanies(JSON.parse(raw) as Company[]);const savedLeads=JSON.parse(localStorage.getItem(LEAD_KEY)||"[]") as Lead[];setLeadNames(savedLeads.map(l=>l.company.toLowerCase()));}catch{/* ignora dados locais inválidos */}setReady(true);},[]);
  useEffect(()=>{if(ready)localStorage.setItem(COMPANY_KEY,JSON.stringify(companies));},[companies,ready]);
  const visible=useMemo(()=>companies.filter(c=>[c.name,c.segment,c.city,c.phone].join(" ").toLowerCase().includes(query.toLowerCase())),[companies,query]);
  function save(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!form.name.trim())return;if(editing)setCompanies(all=>all.map(c=>c.id===editing?{...c,...form,name:form.name.trim()}:c));else setCompanies(all=>[{...form,name:form.name.trim(),id:String(Date.now())},...all]);setForm(blank);setEditing(null);setShow(false);}
  function edit(c:Company){setForm({name:c.name,segment:c.segment,city:c.city,phone:c.phone,website:c.website,google:c.google,notes:c.notes});setEditing(c.id);setShow(true);}
  function createLead(c:Company){let current:Lead[]=[];try{const raw=localStorage.getItem(LEAD_KEY);if(raw)current=JSON.parse(raw) as Lead[];}catch{/* inicia carteira vazia */}if(current.some(l=>l.company.toLowerCase()===c.name.toLowerCase())){alert("Essa empresa já está cadastrada na carteira de leads.");return;}current.unshift({id:"lead-"+Date.now(),company:c.name,contact:"",phone:c.phone,segment:c.segment,interest:"A definir após diagnóstico",stage:"novo",followUp:"",notes:"Empresa adicionada a partir da base Arcany."});localStorage.setItem(LEAD_KEY,JSON.stringify(current));setLeadNames(current.map(l=>l.company.toLowerCase()));alert("Empresa adicionada à carteira de leads.");}
  const field={width:"100%",minHeight:40,border:"1px solid var(--border)",borderRadius:9,background:"#0c121d",color:"#f3f6fb",padding:"0 11px",fontSize:11};
  const label={display:"grid",gap:6,color:"#aeb9ca",fontSize:11};
  return <AppShell><div className="content">
    <div className="eyebrow">Base de negócios</div><h1 className="page-title">Empresas</h1>
    <p className="page-description">Organize os negócios encontrados na prospecção, registre informações verificadas e transforme empresas em oportunidades comerciais.</p>
    <div className="stat-grid" style={{marginTop:22}}>
      {[{label:"Empresas cadastradas",value:companies.length},{label:"Com telefone",value:companies.filter(c=>c.phone.trim()).length},{label:"Com site informado",value:companies.filter(c=>c.website.trim()).length},{label:"Na carteira de leads",value:companies.filter(c=>leadNames.includes(c.name.toLowerCase())).length}].map(s=><div className="panel stat-card" key={s.label}><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>)}
    </div>
    <section className="panel" style={{marginTop:16}}>
      <div className="panel-heading" style={{flexWrap:"wrap"}}><div><div className="panel-title">Base de empresas</div><div className="panel-subtitle">{ready?companies.length+" registro(s) neste navegador":"Carregando..."}</div></div><button type="button" className="action-button" onClick={()=>{setForm(blank);setEditing(null);setShow(v=>!v);}}><Plus size={14}/> Nova empresa</button></div>
      {show&&<form onSubmit={save} style={{margin:16,padding:15,border:"1px solid rgba(139,124,255,.28)",borderRadius:12,display:"grid",gap:11}}>
        <strong style={{fontSize:13}}>{editing?"Editar empresa":"Cadastrar empresa"}</strong>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
          <label style={label}>Nome da empresa *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={field} placeholder="Nome comercial"/></label>
          <label style={label}>Segmento<input value={form.segment} onChange={e=>setForm({...form,segment:e.target.value})} style={field} placeholder="Ex.: Academia, loja, clínica"/></label>
          <label style={label}>Cidade / UF<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} style={field} placeholder="Juiz de Fora - MG"/></label>
          <label style={label}>Telefone / WhatsApp<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={field} placeholder="(32) 99999-9999"/></label>
          <label style={label}>Site<input value={form.website} onChange={e=>setForm({...form,website:e.target.value})} style={field} placeholder="https://..."/></label>
          <label style={label}>Presença no Google<select value={form.google} onChange={e=>setForm({...form,google:e.target.value})} style={field}><option value="a_investigar">A investigar</option><option value="encontrada">Perfil encontrado</option><option value="nao_localizada">Não localizada na pesquisa</option></select></label>
        </div>
        <label style={label}>Observações<textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{...field,padding:10}} placeholder="Informações confirmadas, oportunidade percebida e próximos passos"/></label>
        <div style={{display:"flex",gap:8}}><button className="action-button" type="submit">Salvar empresa</button><button className="secondary-button" type="button" onClick={()=>{setShow(false);setEditing(null);}}>Cancelar</button></div>
      </form>}
      <div style={{padding:"0 16px 14px"}}><label style={{display:"flex",gap:8,alignItems:"center",border:"1px solid var(--border)",borderRadius:9,padding:"0 11px",maxWidth:450,minHeight:40,color:"var(--muted)"}}><Search size={14}/><input aria-label="Buscar empresas" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nome, segmento ou cidade..." style={{background:"transparent",border:0,outline:0,color:"white",width:"100%",fontSize:11}}/></label></div>
      {visible.length?<div style={{display:"grid",gap:9,padding:"0 16px 16px"}}>{visible.map(c=><article key={c.id} style={{border:"1px solid var(--border)",borderRadius:11,padding:13}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div style={{flex:1,minWidth:0}}><strong style={{fontSize:13}}>{c.name}</strong><div style={{display:"flex",gap:12,flexWrap:"wrap",color:"var(--muted)",fontSize:10,marginTop:7}}>{c.segment&&<span>{c.segment}</span>}{c.city&&<span>{c.city}</span>}{c.phone&&<span>{c.phone}</span>}</div><div style={{color:"var(--muted)",fontSize:10,marginTop:7}}>Google: {c.google==="encontrada"?"Perfil encontrado":c.google==="nao_localizada"?"Não localizada na pesquisa":"A investigar"}</div>{c.notes&&<p style={{fontSize:11,color:"#aeb9ca",margin:"8px 0 0"}}>{c.notes}</p>}</div>
        <div style={{display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap"}}>{c.phone&&<a className="secondary-button" href={"https://wa.me/55"+c.phone.replace(/\D/g,"").replace(/^55/,"")} target="_blank" rel="noreferrer"><MessageCircle size={12}/> WhatsApp</a>}{c.website&&<a className="secondary-button" href={/^https?:\/\//i.test(c.website)?c.website:"https://"+c.website} target="_blank" rel="noreferrer"><Globe size={12}/> Site</a>}<button className="secondary-button" type="button" onClick={()=>createLead(c)}><Target size={12}/> Virar lead</button><button className="secondary-button" type="button" onClick={()=>edit(c)} aria-label="Editar empresa"><Pencil size={12}/></button><button className="secondary-button" type="button" onClick={()=>{if(confirm("Excluir esta empresa da base local?"))setCompanies(all=>all.filter(x=>x.id!==c.id));}} aria-label="Excluir empresa"><Trash2 size={12}/></button></div>
      </div></article>)}</div>:<div className="empty-state"><div className="empty-icon"><Building2 size={19}/></div><div className="empty-title">{companies.length?"Nenhuma empresa encontrada":"Sua base de empresas está pronta para começar"}</div><p className="empty-copy">{companies.length?"Altere a busca para localizar um registro.":"Cadastre empresas manualmente ou salve oportunidades encontradas na prospecção."}</p></div>}
    </section>
    <p style={{color:"var(--muted)",fontSize:10,lineHeight:1.6,marginTop:12}}>Os registros desta etapa ficam no armazenamento local do navegador e aparelho. A sincronização em nuvem, os perfis de usuário e a ligação automática com os resultados do Google Places ainda dependem da implementação do banco de dados.</p>
  </div></AppShell>;
}
