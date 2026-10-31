"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ExternalLink, Plus, Trash2, Globe, ShoppingBag, Utensils } from "lucide-react";

type Product = { id: string; name: string; description: string; price: string; category: string };
const field: React.CSSProperties = { width:"100%", minHeight:42, border:"1px solid var(--border)", borderRadius:9, background:"#0c121d", color:"#f3f6fb", padding:"0 11px", fontSize:12 };
const slugify = (value:string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export default function ProjectsPage() {
  const [kind,setKind]=useState("cardapio");
  const [company,setCompany]=useState("");
  const [slug,setSlug]=useState("");
  const [description,setDescription]=useState("Produtos selecionados com atendimento rápido.");
  const [tagline,setTagline]=useState("Qualidade e atendimento que fazem a diferença.");
  const [whatsapp,setWhatsapp]=useState("");
  const [primary,setPrimary]=useState("#705cf5");
  const [products,setProducts]=useState<Product[]>([{id:"p1",name:"Produto exemplo",description:"Edite nome, descrição e preço.",price:"29,90",category:"Destaques"}]);
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);
  const [publishedUrl,setPublishedUrl]=useState("");

  function updateProduct(id:string,key:keyof Product,value:string){setProducts(current=>current.map(p=>p.id===id?{...p,[key]:value}:p));}
  function addProduct(){setProducts(current=>[...current,{id:crypto.randomUUID(),name:"",description:"",price:"0,00",category:""}]);}
  function removeProduct(id:string){setProducts(current=>current.filter(p=>p.id!==id));}

  async function save(event:FormEvent){
    event.preventDefault(); setBusy(true); setStatus(""); setPublishedUrl("");
    const supabase=getSupabaseBrowserClient();
    if(!supabase){setStatus("Configure as variáveis do Supabase na Vercel antes de salvar projetos na nuvem.");setBusy(false);return;}
    try{
      const {data:userData,error:userError}=await supabase.auth.getUser();
      if(userError)throw userError;
      if(!userData.user)throw new Error("Entre na plataforma antes de criar um projeto.");
      const {data:member,error:memberError}=await supabase.from("organization_members").select("organization_id").eq("user_id",userData.user.id).limit(1).maybeSingle();
      if(memberError)throw memberError;
      if(!member)throw new Error("Organização não encontrada. Acesse Conta e conclua o cadastro.");
      const safeSlug=slugify(slug||company);
      if(safeSlug.length<3)throw new Error("Informe um nome de endereço com pelo menos 3 caracteres.");
      if(!company.trim())throw new Error("Informe o nome da empresa.");
      const validProducts=products.filter(p=>p.name.trim()).map(p=>({...p,price:Number(p.price.replace(",", "."))||0}));
      const config={kind,company:company.trim(),tagline,description,whatsapp:whatsapp.replace(/\D/g,""),primary,products:validProducts};
      const {data:project,error:projectError}=await supabase.from("projects").insert({organization_id:member.organization_id,name:company.trim()+" — "+kind,solution_type:kind,status:"publicacao",brief:{company:company.trim(),description},preview_config:config}).select("id").single();
      if(projectError)throw projectError;
      const {error:storeError}=await supabase.from("public_storefronts").insert({organization_id:member.organization_id,project_id:project.id,slug:safeSlug,title:company.trim(),description,published:true,config});
      if(storeError){await supabase.from("projects").delete().eq("id",project.id);throw storeError;}
      const url=window.location.origin+"/loja/"+safeSlug;
      setPublishedUrl(url);setStatus("Projeto salvo e publicado dentro da Arcany. O link público já pode ser aberto.");
    }catch(error){setStatus(error instanceof Error?error.message:"Não foi possível salvar o projeto.");}
    finally{setBusy(false);}
  }

  return <AppShell><div className="content">
    <div className="eyebrow">Fábrica de soluções digitais</div><h1 className="page-title">Criar site, cardápio ou loja</h1>
    <p className="page-description">Monte uma vitrine personalizada, salve o projeto na nuvem e gere um endereço público dentro da Arcany Digital.</p>
    <form onSubmit={save} className="section-grid" style={{gridTemplateColumns:"minmax(0,1.05fr) minmax(300px,.95fr)",marginTop:20,alignItems:"start"}}>
      <section className="panel" style={{padding:18,display:"grid",gap:12}}>
        <h2 style={{fontSize:14,margin:0}}>1. Identidade do projeto</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
          {[{id:"site",label:"Site",icon:Globe},{id:"cardapio",label:"Cardápio",icon:Utensils},{id:"loja",label:"Loja virtual",icon:ShoppingBag}].map(x=>{const Icon=x.icon;return <button type="button" key={x.id} onClick={()=>setKind(x.id)} style={{padding:11,borderRadius:10,border:kind===x.id?"1px solid #8b7cff":"1px solid var(--border)",background:kind===x.id?"rgba(139,124,255,.15)":"transparent",color:"#e7eaff",fontSize:11}}><Icon size={17}/><div style={{marginTop:5}}>{x.label}</div></button>;})}
        </div>
        <label style={label}>Nome da empresa<input required value={company} onChange={e=>{setCompany(e.target.value);if(!slug)setSlug(slugify(e.target.value));}} style={field} placeholder="Ex.: Panda Hortifruti"/></label>
        <label style={label}>Endereço do link<input required value={slug} onChange={e=>setSlug(slugify(e.target.value))} style={field} placeholder="nome-da-loja"/><small style={{color:"var(--muted)"}}>Seu link ficará /loja/{slug||"nome-da-loja"}</small></label>
        <label style={label}>Slogan<input value={tagline} onChange={e=>setTagline(e.target.value)} style={field}/></label>
        <label style={label}>Descrição<textarea value={description} onChange={e=>setDescription(e.target.value)} style={{...field,minHeight:74,padding:10}}/></label>
        <label style={label}>WhatsApp para pedidos<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={field} placeholder="5532999999999"/></label>
        <label style={label}>Cor principal<input type="color" value={primary} onChange={e=>setPrimary(e.target.value)} style={{...field,padding:4}}/></label>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{fontSize:13,margin:0}}>2. Produtos e serviços</h3><button type="button" className="secondary-button" onClick={addProduct}><Plus size={13}/> Adicionar</button></div>
        {products.map(p=><div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:7,padding:10,border:"1px solid var(--border)",borderRadius:10}}>
          <input value={p.name} onChange={e=>updateProduct(p.id,"name",e.target.value)} placeholder="Nome do item" style={field}/>
          <input value={p.price} onChange={e=>updateProduct(p.id,"price",e.target.value)} placeholder="Preço (29,90)" style={field}/>
          <button type="button" onClick={()=>removeProduct(p.id)} aria-label="Remover produto" className="secondary-button"><Trash2 size={14}/></button>
          <input value={p.category} onChange={e=>updateProduct(p.id,"category",e.target.value)} placeholder="Categoria" style={{...field,gridColumn:"1 / -1"}}/>
          <input value={p.description} onChange={e=>updateProduct(p.id,"description",e.target.value)} placeholder="Descrição" style={{...field,gridColumn:"1 / -1"}}/>
        </div>)}
        <button className="action-button" disabled={busy} style={{justifyContent:"center",minHeight:44}}>{busy?"Salvando projeto...":"Salvar e publicar projeto"}</button>
        {status&&<p role="status" style={{fontSize:12,color:"#e9c77b",lineHeight:1.6}}>{status}</p>}
        {publishedUrl&&<Link target="_blank" href={publishedUrl} className="action-button" style={{justifyContent:"center"}}>Abrir projeto publicado <ExternalLink size={14}/></Link>}
      </section>
      <section className="panel" style={{padding:18,position:"sticky",top:15}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#a99fff"}}>PRÉVIA AO VIVO</div>
        <div style={{marginTop:14,borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",background:"#f8fafc",color:"#182033"}}>
          <div style={{padding:22,background:primary,color:"white"}}><div style={{fontSize:10,letterSpacing:2,opacity:.8}}> {company||"SUA EMPRESA"} </div><h2 style={{fontSize:25,margin:"20px 0 8px",lineHeight:1.1}}>{tagline}</h2><p style={{fontSize:11,opacity:.9}}>{description}</p></div>
          <div style={{padding:14}}><div style={{fontWeight:800,fontSize:14,marginBottom:10}}>{kind==="cardapio"?"Nosso cardápio":kind==="loja"?"Produtos da loja":"Conheça nossos produtos e serviços"}</div>
            <div style={{display:"grid",gap:8}}>{products.filter(p=>p.name).map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",gap:10,padding:10,border:"1px solid #e2e8f0",borderRadius:9}}><div><strong style={{fontSize:11}}>{p.name}</strong><p style={{fontSize:9,color:"#64748b",margin:"4px 0"}}>{p.description}</p></div><strong style={{fontSize:11,color:primary}}>R$ {p.price||"0,00"}</strong></div>)}</div>
          </div>
          <div style={{padding:14,textAlign:"center",fontSize:10,color:"#64748b"}}>Atendimento e pedidos pelo WhatsApp</div>
        </div>
        <p style={{fontSize:11,color:"var(--muted)",lineHeight:1.6,marginTop:12}}>Esta é a prévia do conteúdo. Após salvar, a página fica disponível pelo endereço público da Arcany. Domínio próprio e pagamento online dependem de configuração adicional.</p>
      </section>
    </form>
  </div></AppShell>;
}
const label:React.CSSProperties={display:"grid",gap:6,fontSize:11,color:"#c8d1df"};
