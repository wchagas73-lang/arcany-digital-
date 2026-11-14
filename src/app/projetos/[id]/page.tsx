"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, ExternalLink, FileText, Image as ImageIcon, Link2, LoaderCircle, Save, Trash2, UploadCloud, Video } from "lucide-react";

type Project = { id:string; name:string; solution_type:string; status:string; brief:Record<string,unknown>; preview_config:Record<string,unknown>; published_url:string|null; created_at:string };
type Asset = { id:string; file_path:string; file_name:string; mime_type:string; file_size:number; asset_type:string; created_at:string; signedUrl?:string };
const stages = [
  ["planejamento","Planejamento"],["producao","Em produção"],["revisao","Revisão interna"],["aprovado","Aprovado pelo cliente"],["publicado","Publicado"],["entregue","Entregue"],["pausado","Pausado"]
];
const field:React.CSSProperties={width:"100%",minHeight:42,border:"1px solid var(--border)",borderRadius:9,background:"#0c121d",color:"#f3f6fb",padding:"0 11px",fontSize:12};
const label:React.CSSProperties={display:"grid",gap:6,fontSize:11,color:"#c8d1df"};
const panel:React.CSSProperties={padding:18,display:"grid",gap:12};

export default function ProjectProductionPage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const projectId=params.id;
  const [project,setProject]=useState<Project|null>(null);
  const [assets,setAssets]=useState<Asset[]>([]);
  const [organizationId,setOrganizationId]=useState("");
  const [publishedUrl,setPublishedUrl]=useState("");
  const [status,setStatus]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [assetType,setAssetType]=useState("foto");

  const load=useCallback(async()=>{
    const db=getSupabaseBrowserClient();
    if(!db){setMessage("Conexão com Supabase não configurada.");setLoading(false);return;}
    setLoading(true);
    try{
      const {data:userData,error:userError}=await db.auth.getUser();
      if(userError)throw userError;
      if(!userData.user)throw new Error("Entre com a conta autorizada.");
      const {data:member,error:memberError}=await db.from("organization_members").select("organization_id").eq("user_id",userData.user.id).maybeSingle();
      if(memberError)throw memberError;
      if(!member)throw new Error("Workspace do proprietário ainda não foi provisionado.");
      setOrganizationId(member.organization_id);
      const {data:row,error:projectError}=await db.from("projects").select("id,name,solution_type,status,brief,preview_config,published_url,created_at").eq("id",projectId).eq("organization_id",member.organization_id).single();
      if(projectError)throw projectError;
      const p=row as Project;
      setProject(p);setPublishedUrl(p.published_url||"");setStatus(p.status||"planejamento");
      const {data:rows,error:assetError}=await db.from("project_assets").select("id,file_path,file_name,mime_type,file_size,asset_type,created_at").eq("project_id",projectId).eq("organization_id",member.organization_id).order("created_at",{ascending:false});
      if(assetError)throw assetError;
      const signed=await Promise.all((rows||[]).map(async(item:Asset)=>{
        const {data}=await db.storage.from("arcany-client-assets").createSignedUrl(item.file_path,3600);
        return {...item,signedUrl:data?.signedUrl};
      }));
      setAssets(signed);setMessage("");
    }catch(error){setMessage(error instanceof Error?error.message:"Não foi possível carregar o projeto.");}
    finally{setLoading(false);}
  },[projectId]);

  useEffect(()=>{void load();},[load]);

  async function saveWorkflow(){
    const db=getSupabaseBrowserClient();if(!db||!project||!organizationId)return;
    setSaving(true);setMessage("");
    try{
      const cleanUrl=publishedUrl.trim();
      if(cleanUrl && !/^https:\/\//i.test(cleanUrl))throw new Error("Use o endereço completo começando com https://.");
      const {error}=await db.from("projects").update({status,published_url:cleanUrl||null}).eq("id",project.id).eq("organization_id",organizationId);
      if(error)throw error;
      setProject({...project,status,published_url:cleanUrl||null});
      setMessage("Etapa e endereço de entrega atualizados.");
    }catch(error){setMessage(error instanceof Error?error.message:"Não foi possível salvar.");}
    finally{setSaving(false);}
  }

  async function uploadFiles(event:ChangeEvent<HTMLInputElement>){
    const files=Array.from(event.target.files||[]);event.target.value="";
    if(!files.length||!project||!organizationId)return;
    const db=getSupabaseBrowserClient();if(!db)return;
    setUploading(true);setMessage("");
    try{
      for(const file of files){
        const allowed=["image/jpeg","image/png","image/webp","application/pdf","video/mp4"];
        if(!allowed.includes(file.type))throw new Error("Formato não permitido: "+file.name+". Use JPG, PNG, WEBP, PDF ou MP4.");
        if(file.size>25*1024*1024)throw new Error(file.name+" ultrapassa o limite de 25 MB.");
        const safeName=file.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"-").slice(-90);
        const path=organizationId+"/"+project.id+"/"+crypto.randomUUID()+"-"+safeName;
        const {error:uploadError}=await db.storage.from("arcany-client-assets").upload(path,file,{contentType:file.type,upsert:false});
        if(uploadError)throw uploadError;
        const {error:insertError}=await db.from("project_assets").insert({organization_id:organizationId,project_id:project.id,file_path:path,file_name:file.name,mime_type:file.type,file_size:file.size,asset_type:assetType});
        if(insertError){await db.storage.from("arcany-client-assets").remove([path]);throw insertError;}
      }
      setMessage(files.length+" arquivo(s) anexado(s) ao projeto.");
      await load();
    }catch(error){setMessage(error instanceof Error?error.message:"Falha no envio dos arquivos.");}
    finally{setUploading(false);}
  }

  async function removeAsset(asset:Asset){
    if(!confirm("Excluir o arquivo "+asset.file_name+" deste projeto?"))return;
    const db=getSupabaseBrowserClient();if(!db)return;
    setMessage("");
    const {error:removeError}=await db.storage.from("arcany-client-assets").remove([asset.file_path]);
    if(removeError){setMessage(removeError.message);return;}
    const {error}=await db.from("project_assets").delete().eq("id",asset.id).eq("organization_id",organizationId);
    if(error){setMessage(error.message);return;}
    setAssets(current=>current.filter(item=>item.id!==asset.id));
    setMessage("Arquivo removido.");
  }

  const brief=project?.brief||{};
  const customer=(brief.customer_brief||{}) as Record<string,string>;
  const bytes=(value:number)=>value<1024*1024?(value/1024).toFixed(0)+" KB":(value/1024/1024).toFixed(1)+" MB";

  return <AppShell><div className="content">
    <Link href="/projetos" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#b9adff",fontSize:11,textDecoration:"none",marginBottom:14}}><ArrowLeft size={14}/> Voltar aos projetos</Link>
    {loading?<section className="panel" style={panel}><LoaderCircle size={18}/> Carregando projeto...</section>:!project?<section className="panel" style={panel}><h1 className="page-title">Projeto indisponível</h1><p className="page-description">{message||"Não foi possível localizar este projeto."}</p></section>:<>
      <div className="eyebrow">Centro de produção e entrega</div>
      <h1 className="page-title">{project.name}</h1>
      <p className="page-description">{project.solution_type} · Criado em {new Date(project.created_at).toLocaleDateString("pt-BR")}</p>
      <Link href={"/projetos/" + project.id + "/pagina"} className="action-button" style={{display:"inline-flex",marginTop:10}}><ExternalLink size={13}/> Montar landing page</Link>
      <div className="section-grid" style={{gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",marginTop:18,alignItems:"start"}}>
        <section className="panel" style={panel}>
          <h2 style={{fontSize:14,margin:0}}>Fluxo de produção</h2>
          <label style={label}>Etapa atual<select value={status} onChange={e=>setStatus(e.target.value)} style={field}>{stages.map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
          <label style={label}>Link do preview ou endereço publicado<input value={publishedUrl} onChange={e=>setPublishedUrl(e.target.value)} style={field} placeholder="https://seu-projeto.pages.dev"/></label>
          <button type="button" className="action-button" disabled={saving} onClick={()=>void saveWorkflow()} style={{justifyContent:"center"}}><Save size={14}/>{saving?"Salvando...":"Salvar etapa e entrega"}</button>
          {publishedUrl&&/^https:\/\//i.test(publishedUrl)&&<a href={publishedUrl} target="_blank" rel="noreferrer" className="secondary-button" style={{justifyContent:"center"}}><ExternalLink size={13}/> Abrir preview / entrega</a>}
          <p style={{fontSize:10,color:"var(--muted)",lineHeight:1.6,margin:0}}>O endereço é registrado no projeto. A publicação real deve ser feita no provedor de hospedagem e validada antes de marcar como entregue.</p>
        </section>
        <section className="panel" style={panel}>
          <h2 style={{fontSize:14,margin:0}}>Dados confirmados do cliente</h2>
          {Object.entries(customer).length?Object.entries(customer).map(([key,value])=><div key={key} style={{borderBottom:"1px solid var(--border)",paddingBottom:7}}><div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase"}}>{key.replace(/_/g," ")}</div><div style={{fontSize:11,whiteSpace:"pre-wrap",marginTop:4}}>{value||"Não informado"}</div></div>):<p style={{fontSize:11,color:"var(--muted)"}}>O briefing deste projeto não contém campos estruturados do cliente.</p>}
          {typeof brief.production_prompt==="string"&&<details><summary style={{fontSize:11,cursor:"pointer",color:"#b9adff"}}>Ver instruções de produção</summary><pre style={{whiteSpace:"pre-wrap",fontSize:10,lineHeight:1.6,color:"#c8d1df"}}>{brief.production_prompt}</pre></details>}
        </section>
      </div>
      <section className="panel" style={{...panel,marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{fontSize:14,margin:0}}>Materiais do cliente</h2><p style={{fontSize:10,color:"var(--muted)",margin:"5px 0 0"}}>Fotos, logos, vídeos e documentos em armazenamento privado, acessíveis apenas à conta autorizada.</p></div><UploadCloud size={20} color="#a99fff"/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:9}}>
          <label style={label}>Tipo de arquivo<select value={assetType} onChange={e=>setAssetType(e.target.value)} style={field}><option value="logo">Logo</option><option value="foto">Foto / imagem</option><option value="video">Vídeo</option><option value="documento">Documento / briefing</option><option value="outro">Outro</option></select></label>
          <label style={label}>Selecionar arquivos<input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" onChange={uploadFiles} disabled={uploading} style={{...field,padding:"9px 10px",height:"auto"}}/></label>
        </div>
        {uploading&&<p style={{fontSize:11,color:"#b9adff"}}>Enviando arquivos...</p>}
        {assets.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:9}}>{assets.map(asset=><article key={asset.id} style={{border:"1px solid var(--border)",borderRadius:10,padding:10,display:"grid",gap:7}}>
          {asset.mime_type.startsWith("image/")&&asset.signedUrl?<a href={asset.signedUrl} target="_blank" rel="noreferrer"><img src={asset.signedUrl} alt={asset.file_name} style={{width:"100%",height:130,objectFit:"contain",background:"#0b111b",borderRadius:7}}/></a>:<div style={{height:70,display:"grid",placeItems:"center",background:"#0b111b",borderRadius:7}}>{asset.mime_type.startsWith("video/")?<Video size={22}/>:asset.mime_type==="application/pdf"?<FileText size={22}/>:<ImageIcon size={22}/>}</div>}
          <strong style={{fontSize:10,overflowWrap:"anywhere"}}>{asset.file_name}</strong><span style={{fontSize:9,color:"var(--muted)"}}>{asset.asset_type} · {bytes(asset.file_size)}</span>
          <div style={{display:"flex",gap:7}}>{asset.signedUrl&&<a href={asset.signedUrl} target="_blank" rel="noreferrer" className="secondary-button" style={{flex:1,justifyContent:"center"}}><Link2 size={12}/> Abrir</a>}<button type="button" className="secondary-button" onClick={()=>void removeAsset(asset)} aria-label="Excluir arquivo"><Trash2 size={12}/></button></div>
        </article>)}</div>:<div style={{padding:20,border:"1px dashed var(--border)",borderRadius:10,textAlign:"center",fontSize:11,color:"var(--muted)"}}>Nenhum material anexado ainda.</div>}
      </section>
      {message&&<p role="status" aria-live="polite" style={{fontSize:11,color:"#e9c77b",marginTop:12}}>{message}</p>}
    </>}
  </div></AppShell>;
}
