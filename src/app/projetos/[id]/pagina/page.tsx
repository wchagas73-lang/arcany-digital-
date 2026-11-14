"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, ExternalLink, Eye, Globe, ImagePlus, Save, Send } from "lucide-react";

type PageContent = {
  company: string;
  tagline: string;
  description: string;
  city: string;
  whatsapp: string;
  instagram: string;
  googleUrl: string;
  ctaLabel: string;
  primaryColor: string;
  servicesText: string;
  heroImage: string;
  gallery: string[];
  publishedAssetIds?: string[];
  publishedAssetPaths?: string[];
};
type Asset = { id: string; file_path: string; file_name: string; mime_type: string };
type Project = { id: string; name: string; solution_type: string; brief: Record<string, unknown> };
type Publication = { id: string; slug: string; content: PageContent; published: boolean; published_at: string | null };

const field: React.CSSProperties = { width: "100%", minHeight: 42, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", fontSize: 12 };
const label: React.CSSProperties = { display: "grid", gap: 6, color: "#c8d1df", fontSize: 11 };
const area: React.CSSProperties = { ...field, minHeight: 92, padding: 10, resize: "vertical" };
const emptyContent: PageContent = { company: "", tagline: "", description: "", city: "", whatsapp: "", instagram: "", googleUrl: "", ctaLabel: "Fale conosco pelo WhatsApp", primaryColor: "#6655d9", servicesText: "", heroImage: "", gallery: [] };
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

export default function LandingPageBuilder() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [organizationId, setOrganizationId] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [content, setContent] = useState<PageContent>(emptyContent);
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const db = getSupabaseBrowserClient();
    if (!db) { setMessage("Supabase não está configurado."); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: userData, error: userError } = await db.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Entre com a conta proprietária.");
      const { data: member, error: memberError } = await db.from("organization_members").select("organization_id").eq("user_id", userData.user.id).maybeSingle();
      if (memberError) throw memberError;
      if (!member) throw new Error("Workspace do proprietário ainda não foi provisionado.");
      setOrganizationId(member.organization_id);
      const { data: row, error: projectError } = await db.from("projects").select("id,name,solution_type,brief").eq("id", projectId).eq("organization_id", member.organization_id).single();
      if (projectError) throw projectError;
      const p = row as Project;
      setProject(p);
      const brief = p.brief || {};
      const customer = (brief.customer_brief || {}) as Record<string, string>;
      setContent(current => ({
        ...current,
        company: current.company || customer.company || p.name,
        city: current.city || customer.city || "",
        whatsapp: current.whatsapp || customer.whatsapp || "",
        tagline: current.tagline || String(brief.objective || ""),
      }));
      const { data: assetRows, error: assetError } = await db.from("project_assets").select("id,file_path,file_name,mime_type").eq("project_id", projectId).eq("organization_id", member.organization_id).order("created_at", { ascending: false });
      if (assetError) throw assetError;
      setAssets((assetRows || []) as Asset[]);
      const { data: publication, error: publicationError } = await db.from("project_publications").select("id,slug,content,published,published_at").eq("project_id", projectId).eq("organization_id", member.organization_id).maybeSingle();
      if (publicationError) throw publicationError;
      if (publication) {
        const pub = publication as Publication;
        setSlug(pub.slug);
        setContent({ ...emptyContent, ...(pub.content as PageContent) });
        setPublished(pub.published);
        setPublishedAt(pub.published_at);
        setSelectedAssetIds(pub.content.publishedAssetIds || []);
      } else {
        setSlug(slugify(p.name) + "-" + p.id.slice(0, 6));
      }
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar o projeto.");
    } finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  function update<K extends keyof PageContent>(key: K, value: PageContent[K]) {
    setContent(current => ({ ...current, [key]: value }));
  }

  async function savePublication(nextContent = content, nextPublished = published, gallery = nextContent.gallery) {
    const db = getSupabaseBrowserClient();
    if (!db || !project || !organizationId) throw new Error("Projeto ou workspace indisponível.");
    const cleanSlug = slugify(slug);
    if (!cleanSlug) throw new Error("Informe um endereço válido para a landing page.");
    const payload = { ...nextContent, gallery };
    const { error } = await db.from("project_publications").upsert({
      organization_id: organizationId,
      project_id: project.id,
      slug: cleanSlug,
      content: payload,
      published: nextPublished,
      published_at: nextPublished ? (publishedAt || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "project_id" });
    if (error) throw error;
    setSlug(cleanSlug);
    setContent(payload);
    setPublished(nextPublished);
    if (nextPublished && !publishedAt) setPublishedAt(new Date().toISOString());
    return cleanSlug;
  }

  async function saveDraft() {
    setSaving(true); setMessage("");
    try {
      await savePublication(content, published);
      setMessage("Conteúdo salvo no projeto.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setSaving(false); }
  }

  async function publishPage() {
    const db = getSupabaseBrowserClient();
    if (!db || !project || !organizationId) return;
    setPublishing(true); setMessage("");
    try {
      const images = assets.filter(asset => asset.mime_type.startsWith("image/") && selectedAssetIds.includes(asset.id));
      const previousPaths = content.publishedAssetPaths || [];
      if (previousPaths.length) {
        const { error: cleanupError } = await db.storage.from("arcany-published-media").remove(previousPaths);
        if (cleanupError) throw cleanupError;
      }
      const gallery: string[] = [];
      const publishedAssetPaths: string[] = [];
      for (const asset of images) {
        const { data: file, error: downloadError } = await db.storage.from("arcany-client-assets").download(asset.file_path);
        if (downloadError) throw downloadError;
        const extension = asset.file_name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = organizationId + "/" + project.id + "/" + asset.id + "." + extension;
        const { error: uploadError } = await db.storage.from("arcany-published-media").upload(path, file, { contentType: asset.mime_type, upsert: true });
        if (uploadError) throw uploadError;
        gallery.push(db.storage.from("arcany-published-media").getPublicUrl(path).data.publicUrl);
        publishedAssetPaths.push(path);
      }
      const nextContent = { ...content, gallery, heroImage: gallery[0] || content.heroImage, publishedAssetIds: selectedAssetIds, publishedAssetPaths };
      const cleanSlug = await savePublication(nextContent, true, gallery);
      const publicUrl = window.location.origin + "/p/" + cleanSlug;
      const { error: projectUpdateError } = await db.from("projects").update({ status: "publicado", published_url: publicUrl }).eq("id", project.id).eq("organization_id", organizationId);
      if (projectUpdateError) throw projectUpdateError;
      setMessage("Landing page publicada. Abra o endereço público para revisar.");
      setPublished(true);
      setPublishedAt(new Date().toISOString());
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível publicar."); }
    finally { setPublishing(false); }
  }

  const publicUrl = typeof window !== "undefined" && slug ? window.location.origin + "/p/" + slug : "";
  const input = (key: Exclude<keyof PageContent, "gallery">, value: string) => update(key, value);

  return <AppShell><div className="content">
    <Link href={"/projetos/" + projectId} style={{ display: "inline-flex", gap: 7, alignItems: "center", color: "#b9adff", fontSize: 11, textDecoration: "none", marginBottom: 14 }}><ArrowLeft size={14}/> Voltar ao projeto</Link>
    {loading ? <section className="panel" style={{ padding: 18 }}>Carregando editor...</section> : !project ? <section className="panel" style={{ padding: 18 }}><p>{message || "Projeto não encontrado."}</p></section> : <>
      <div className="eyebrow">Estúdio de páginas Arcany</div>
      <h1 className="page-title">Landing page: {project.name}</h1>
      <p className="page-description">Edite o conteúdo, use as fotos aprovadas do cliente e publique uma página responsiva em um endereço compartilhável.</p>
      <div className="section-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(280px,.85fr)", marginTop: 18, alignItems: "start" }}>
        <section className="panel" style={{ padding: 18, display: "grid", gap: 11 }}>
          <h2 style={{ fontSize: 14, margin: 0 }}>Conteúdo da página</h2>
          <label style={label}>Nome comercial<input value={content.company} onChange={e => input("company", e.target.value)} style={field}/></label>
          <label style={label}>Título principal<input value={content.tagline} onChange={e => input("tagline", e.target.value)} style={field} placeholder="Uma frase clara sobre o negócio"/></label>
          <label style={label}>Descrição<textarea value={content.description} onChange={e => input("description", e.target.value)} style={area} placeholder="Apresente a empresa com informações confirmadas."/></label>
          <label style={label}>Cidade / região<input value={content.city} onChange={e => input("city", e.target.value)} style={field}/></label>
          <label style={label}>WhatsApp comercial<input value={content.whatsapp} onChange={e => input("whatsapp", e.target.value)} style={field}/></label>
          <label style={label}>Instagram<input value={content.instagram} onChange={e => input("instagram", e.target.value)} style={field} placeholder="@perfil"/></label>
          <label style={label}>Link do Google Perfil da Empresa<input value={content.googleUrl} onChange={e => input("googleUrl", e.target.value)} style={field} placeholder="https://maps.app.goo.gl/..."/></label>
          <label style={label}>Texto do botão principal<input value={content.ctaLabel} onChange={e => input("ctaLabel", e.target.value)} style={field}/></label>
          <label style={label}>Cor principal<input type="color" value={content.primaryColor} onChange={e => input("primaryColor", e.target.value)} style={{ ...field, padding: 5 }}/></label>
          <label style={label}>Serviços ou diferenciais, um por linha<textarea value={content.servicesText} onChange={e => input("servicesText", e.target.value)} style={area} placeholder={"Serviço 1\nServiço 2\nDiferencial confirmado"}/></label>
          <label style={label}>Endereço da página<input value={slug} onChange={e => setSlug(slugify(e.target.value))} style={field}/></label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="action-button" disabled={saving || publishing} onClick={() => void saveDraft()}><Save size={14}/>{saving ? "Salvando..." : "Salvar rascunho"}</button>
            <button type="button" className="action-button" disabled={saving || publishing} onClick={() => void publishPage()}><Send size={14}/>{publishing ? "Publicando..." : published ? "Atualizar publicação" : "Publicar landing page"}</button>
          </div>
          {published && publicUrl && <a href={publicUrl} target="_blank" rel="noreferrer" className="secondary-button"><ExternalLink size={13}/> Abrir página pública</a>}
          {message && <p role="status" aria-live="polite" style={{ color: "#e9c77b", fontSize: 11, lineHeight: 1.6, margin: 0 }}>{message}</p>}
          <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, margin: 0 }}>Ao publicar, as imagens anexadas ao projeto são copiadas para um bucket público de mídia. Não publique dados pessoais ou fotos sem autorização do cliente.</p>
        </section>
        <section className="panel" style={{ padding: 18, display: "grid", gap: 12, position: "sticky", top: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Eye size={16} color="#a99fff"/><h2 style={{ fontSize: 14, margin: 0 }}>Prévia do conteúdo</h2></div>
          <div style={{ overflow: "hidden", borderRadius: 12, background: "#f7f7fb", color: "#202336" }}>
            <div style={{ background: content.primaryColor || "#6655d9", color: "white", padding: "28px 18px" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, opacity: .8 }}>{content.company || "Nome da empresa"}</div>
              <h2 style={{ fontSize: 25, lineHeight: 1.12, margin: "12px 0" }}>{content.tagline || "Título principal da landing page"}</h2>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>{content.description || "A descrição confirmada do negócio aparecerá aqui."}</p>
            </div>
            {content.heroImage && <img src={content.heroImage} alt="" style={{ width: "100%", maxHeight: 190, objectFit: "cover" }}/>}
            <div style={{ padding: 16 }}>
              <strong style={{ fontSize: 14 }}>Conheça nossos serviços</strong>
              <div style={{ display: "grid", gap: 7, marginTop: 10 }}>{content.servicesText.split("\n").filter(Boolean).slice(0, 5).map((item, index) => <div key={index} style={{ background: "white", borderRadius: 8, padding: 10, fontSize: 11 }}>{item}</div>)}</div>
              <div style={{ marginTop: 14, fontSize: 11, color: "#64748b" }}>{content.city}</div>
              <div style={{ marginTop: 12, background: content.primaryColor || "#6655d9", color: "white", borderRadius: 8, padding: 11, textAlign: "center", fontSize: 11 }}>{content.ctaLabel || "Fale conosco"}</div>
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11 }}><ImagePlus size={14} color="#a99fff"/> Materiais disponíveis</div>
            <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5, margin: "6px 0 0" }}>{assets.filter(asset => asset.mime_type.startsWith("image/")).length} imagem(ns) anexada(s). Marque apenas as imagens autorizadas para aparecer publicamente.</p>
            {assets.filter(asset => asset.mime_type.startsWith("image/")).map(asset => <label key={asset.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#c8d1df", padding: "6px 0" }}><input type="checkbox" checked={selectedAssetIds.includes(asset.id)} onChange={e => setSelectedAssetIds(current => e.target.checked ? [...current, asset.id] : current.filter(id => id !== asset.id))}/><span>{asset.file_name}</span></label>)}
            {assets.length === 0 && <Link href={"/projetos/" + projectId} className="secondary-button" style={{ marginTop: 9 }}>Anexar fotos e logo</Link>}
          </div>
          {publishedAt && <p style={{ color: "var(--muted)", fontSize: 9, margin: 0 }}>Publicado em {new Date(publishedAt).toLocaleString("pt-BR")}</p>}
        </section>
      </div>
    </>}
  </div></AppShell>;
}
