"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowRight, CalendarClock, MessageCircle, Search, Users, Cloud, HardDrive } from "lucide-react";

type Stage="novo"|"contato"|"proposta"|"negociacao"|"cliente"|"perdido";
type DbLead={id:string;company_name:string;contact_name:string|null;phone:string|null;segment:string|null;interest:string|null;stage:Stage;follow_up_at:string|null;notes:string|null};
type Lead={id:string;company:string;contact:string;phone:string;segment:string;interest:string;stage:Stage;followUp:string;notes:string};
const STORAGE_KEY="arcany-leads-v1";
const columns:{id:Stage;title:string;hint:string}[]=[
{id:"novo",title:"Novos leads",hint:"Ainda não contatados"},{id:"contato",title:"Em contato",hint:"Primeira conversa feita"},{id:"proposta",title:"Proposta enviada",hint:"Aguardando resposta"},{id:"negociacao",title:"Negociação",hint:"Ajustando a solução"},{id:"cliente",title:"Fechados",hint:"Clientes conquistados"},{id:"perdido",title:"Não avançaram",hint:"Oportunidades encerradas"}];

export default function CrmPage(){
 const [leads,setLeads]=useState<Lead[]>([]);const [ready,setReady]=useState(false);const [query,setQuery]=useState("");const [cloud,setCloud]=useState(false);const [notice,setNotice]=useState("");const [storageKey,setStorageKey]=useState<string|null>(null);
 const load=useCallback(async()=>{
  const db=getSupabaseBrowserClient();
  if(!db){setLeads([]);setCloud(false);setNotice("Conecte o Supabase para acessar o CRM desta conta.");setReady(true);return;}
  const {data:user,error:userError}=await db.auth.getUser();
  if(userError||!user.user){setLeads([]);setCloud(false);setNotice("Entre na sua conta para acessar os dados do CRM.");setReady(true);return;}
  const scopedKey=`${STORAGE_KEY}:${user.user.id}`;
  setStorageKey(scopedKey);
  const local=(()=>{try{return JSON.parse(localStorage.getItem(scopedKey)||"[]") as Lead[];}catch{return [];}})();
  const {data:membership,error:memberError}=await db.from("organization_members").select("organization_id").eq("user_id",user.user.id).limit(1).maybeSingle();
  if(memberError||!membership){setLeads(local);setCloud(false);setNotice(memberError?.message||"Organização não encontrada. Verifique seu cadastro.");setReady(true);return;}

  const {data:rows,error}=await db.from("leads").select("id,company_name,contact_name,phone,segment,interest,stage,follow_up_at,notes").eq("organization_id",membership.organization_id).order("created_at",{ascending:false});
  if(error){setLeads(local);setCloud(false);setNotice("Não foi possível ler os leads na nuvem: "+error.message);setReady(true);return;}
  if((rows||[]).length===0&&local.length){
   const payload=local.map(l=>({organization_id:membership.organization_id,company_name:l.company,contact_name:l.contact||null,phone:l.phone||null,segment:l.segment||null,interest:l.interest||null,stage:l.stage,follow_up_at:l.followUp||null,notes:l.notes||null}));
   const {error:insertError}=await db.from("leads").insert(payload);
   if(!insertError){const {data:again}=await db.from("leads").select("id,company_name,contact_name,phone,segment,interest,stage,follow_up_at,notes").eq("organization_id",membership.organization_id).order("created_at",{ascending:false});const mapped=((again||[]) as DbLead[]).map(l=>({id:l.id,company:l.company_name,contact:l.contact_name||"",phone:l.phone||"",segment:l.segment||"",interest:l.interest||"",stage:l.stage,followUp:l.follow_up_at||"",notes:l.notes||""}));setLeads(mapped);localStorage.setItem(scopedKey,JSON.stringify(mapped));setCloud(true);setNotice("Leads desta conta importados para a nuvem.");setReady(true);return;}
   setNotice("Falha ao importar dados desta conta: "+insertError.message);
  }
  const mapped=((rows||[]) as DbLead[]).map(l=>({id:l.id,company:l.company_name,contact:l.contact_name||"",phone:l.phone||"",segment:l.segment||"",interest:l.interest||"",stage:l.stage,followUp:l.follow_up_at||"",notes:l.notes||""}));
  setLeads(mapped);localStorage.setItem(scopedKey,JSON.stringify(mapped));
  setCloud(true);setReady(true);
,[]);
 useEffect(()=>{void load();},[load]);
 const filtered=useMemo(()=>leads.filter(l=>[l.company,l.contact,l.segment,l.interest].join(" ").toLowerCase().includes(query.toLowerCase())),[leads,query]);
 const active=leads.filter(l=>!["cliente","perdido"].includes(l.stage)).length;
 const due=leads.filter(l=>l.followUp&&l.followUp<=new Date().toISOString().slice(0,10)&&!["cliente","perdido"].includes(l.stage)).length;
 async function move(id:string,stage:Stage){
  const next=leads.map(l=>l.id===id?{...l,stage}:l);setLeads(next);if(storageKey)localStorage.setItem(storageKey,JSON.stringify(next));
  if(cloud){const db=getSupabaseBrowserClient();if(db){const {error}=await db.from("leads").update({stage}).eq("id",id);if(error){setNotice("Não foi possível atualizar a etapa na nuvem: "+error.message);void load();}}}

 }
 function whatsapp(phone:string){const digits=phone.replace(/\D/g,"");return "https://wa.me/"+(digits.startsWith("55")?digits:"55"+digits);}
 return <AppShell><div className="content"><div className="eyebrow">Gestão de vendas</div><h1 className="page-title">CRM comercial</h1><p className="page-description">Acompanhe sua carteira desde o primeiro contato até o fechamento. Quando conectado, o pipeline é sincronizado pelo banco da organização.</p>
 <div className="stat-grid" style={{marginTop:22}}>{[{label:"Oportunidades abertas",value:active,note:"Leads em andamento"},{label:"Propostas e negociações",value:leads.filter(l=>["proposta","negociacao"].includes(l.stage)).length,note:"Em fase comercial"},{label:"Retornos pendentes",value:due,note:"Hoje ou atrasados"},{label:"Clientes fechados",value:leads.filter(l=>l.stage==="cliente").length,note:"Negócios conquistados"}].map(x=><div className="panel stat-card" key={x.label}><div className="stat-label">{x.label}</div><div className="stat-value">{x.value}</div><div className="stat-note">{x.note}</div></div>)}</div>
 <section className="panel" style={{marginTop:16}}><div className="panel-heading" style={{flexWrap:"wrap"}}><div><div className="panel-title">Pipeline de vendas</div><div className="panel-subtitle">{ready?leads.length+" empresa(s) na carteira":"Carregando..."}</div></div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span className="coming-tag">{cloud?<><Cloud size={12} style={{verticalAlign:"middle"}}/> Sincronizado</>:<><HardDrive size={12} style={{verticalAlign:"middle"}}/> Local</>}</span><button className="secondary-button" onClick={()=>void load()}>Atualizar</button><Link className="action-button" href="/leads">Gerenciar leads <ArrowRight size={14}/></Link></div></div>
 <div style={{padding:"0 16px 15px"}}><label style={{display:"flex",gap:8,alignItems:"center",border:"1px solid var(--border)",borderRadius:9,padding:"0 11px",maxWidth:420,minHeight:40,color:"var(--muted)"}}><Search size={14}/><input aria-label="Buscar no CRM" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar empresa, contato ou segmento..." style={{background:"transparent",border:0,outline:0,color:"white",width:"100%",fontSize:11}}/></label></div>
 {!ready?<div className="empty-state">Carregando CRM...</div>:leads.length===0?<div className="empty-state"><div className="empty-icon"><Users size={19}/></div><div className="empty-title">Sua carteira ainda está vazia</div><p className="empty-copy">Cadastre empresas no módulo Leads. Elas aparecerão neste pipeline.</p><Link className="action-button" href="/leads" style={{marginTop:12}}>Cadastrar primeiro lead <ArrowRight size={14}/></Link></div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,235px),1fr))",gap:10,padding:"0 16px 16px",alignItems:"start"}}>{columns.map(col=>{const items=filtered.filter(l=>l.stage===col.id);return <section key={col.id} style={{background:"rgba(255,255,255,.018)",border:"1px solid var(--border)",borderRadius:11,minWidth:0}}><div style={{padding:12,borderBottom:"1px solid var(--border)"}}><div style={{display:"flex",justifyContent:"space-between",gap:8}}><strong style={{fontSize:11}}>{col.title}</strong><span className="coming-tag">{items.length}</span></div><div style={{color:"var(--muted)",fontSize:10,marginTop:4}}>{col.hint}</div></div><div style={{display:"grid",gap:8,padding:9}}>{items.length?items.map(l=><article key={l.id} style={{background:"#101827",border:"1px solid var(--border)",borderRadius:9,padding:10}}><strong style={{fontSize:11,display:"block",overflowWrap:"anywhere"}}>{l.company}</strong><div style={{color:"var(--muted)",fontSize:10,marginTop:5}}>{[l.contact,l.segment].filter(Boolean).join(" · ")||"Sem contato ou segmento informado"}</div>{l.interest&&<div style={{color:"#c2baff",fontSize:10,marginTop:6}}>Interesse: {l.interest}</div>}{l.followUp&&<div style={{color:"#e9bd72",fontSize:10,display:"flex",gap:5,alignItems:"center",marginTop:7}}><CalendarClock size={12}/>{new Date(l.followUp+"T12:00:00").toLocaleDateString("pt-BR")}</div>}<div style={{display:"flex",gap:6,marginTop:9,flexWrap:"wrap"}}><select aria-label={"Mover etapa de "+l.company} value={l.stage} onChange={e=>void move(l.id,e.target.value as Stage)} style={{flex:1,minWidth:125,background:"#0c121d",color:"#e9edf5",border:"1px solid var(--border)",borderRadius:7,padding:"6px 7px",fontSize:10}}>{columns.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select>{l.phone&&<a className="secondary-button" href={whatsapp(l.phone)} target="_blank" rel="noreferrer"><MessageCircle size={12}/> WhatsApp</a>}</div></article>):<div style={{color:"var(--muted)",fontSize:10,textAlign:"center",padding:15}}>{query?"Nenhum resultado":"Nenhuma empresa nesta etapa"}</div>}</div></section>;})}</div>}
 {notice&&<p style={{color:"#e9c77b",fontSize:11,lineHeight:1.5,padding:"0 16px 14px"}}>{notice}</p>}
 </section></div></AppShell>;
}
