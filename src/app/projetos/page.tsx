"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { solutionTemplates } from "@/lib/solution-templates";
import { Copy, ExternalLink, FilePlus2, FolderKanban, RefreshCw, Sparkles } from "lucide-react";

type SavedProject = { id: string; name: string; solution_type: string; status: string; created_at: string; published_url?: string | null };
const field: React.CSSProperties = { width: "100%", minHeight: 42, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", fontSize: 12 };
const label: React.CSSProperties = { display: "grid", gap: 6, fontSize: 11, color: "#c8d1df" };
const area: React.CSSProperties = { ...field, minHeight: 82, padding: 10, resize: "vertical" };

export default function ProjectsPage() {
  const [templateId, setTemplateId] = useState(solutionTemplates[0]?.id ?? "");
  const [projectName, setProjectName] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [brand, setBrand] = useState("");
  const [materials, setMaterials] = useState("");
  const [rules, setRules] = useState("");
  const [integrations, setIntegrations] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [organizationId, setOrganizationId] = useState("");

  const selected = solutionTemplates.find(item => item.id === templateId) ?? solutionTemplates[0];

  const brief = useMemo(() => ({
    template_id: selected.id,
    template_title: selected.title,
    niche: selected.niche,
    solution_type: selected.type,
    objective: selected.objective,
    sections: selected.sections,
    features: selected.features,
    customer_brief: {
      company: company.trim(),
      city: city.trim(),
      whatsapp: whatsapp.trim(),
      brand_identity: brand.trim(),
      materials_and_content: materials.trim(),
      business_rules: rules.trim(),
      integrations: integrations.trim(),
    },
    production_prompt: [
      selected.prompt,
      "",
      "DADOS CONFIRMADOS DO CLIENTE",
      "Empresa: " + (company.trim() || "PENDENTE"),
      "Cidade/região: " + (city.trim() || "PENDENTE"),
      "WhatsApp: " + (whatsapp.trim() || "PENDENTE"),
      "Identidade visual: " + (brand.trim() || "PENDENTE"),
      "Materiais e conteúdo: " + (materials.trim() || "PENDENTE"),
      "Regras de negócio: " + (rules.trim() || "PENDENTE"),
      "Integrações: " + (integrations.trim() || "PENDENTE"),
      "",
      "Não inventar dados. Listar pendências e confirmar escopo antes de implementar ou publicar.",
    ].join("\n"),
  }), [selected, company, city, whatsapp, brand, materials, rules, integrations]);

  async function loadProjects() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setStatus("O Supabase não está configurado neste ambiente."); setLoading(false); return; }
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) { setStatus("Entre com a conta autorizada para consultar e salvar projetos."); setLoading(false); return; }
      const { data: member, error: memberError } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).maybeSingle();
      if (memberError) throw memberError;
      if (!member) { setStatus("A conta ainda não possui um workspace configurado."); setLoading(false); return; }
      setOrganizationId(member.organization_id);
      const { data, error } = await supabase.from("projects").select("id,name,solution_type,status,created_at,published_url").eq("organization_id", member.organization_id).order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      setSavedProjects((data ?? []) as SavedProject[]);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível carregar os projetos.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadProjects(); }, []);

  async function saveProject(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      if (!projectName.trim()) throw new Error("Informe um nome para identificar este projeto.");
      if (!company.trim()) throw new Error("Informe o nome do cliente ou empresa.");
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Configure a conexão com o Supabase.");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Entre na plataforma para salvar o projeto.");
      let orgId = organizationId;
      if (!orgId) {
        const { data: member, error: memberError } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).maybeSingle();
        if (memberError) throw memberError;
        if (!member) throw new Error("Workspace não encontrado. O acesso do proprietário precisa ser configurado.");
        orgId = member.organization_id;
      }
      const config = {
        template_id: selected.id,
        niche: selected.niche,
        type: selected.type,
        sections: selected.sections,
        features: selected.features,
        company: company.trim(),
        city: city.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        brand_identity: brand.trim(),
        materials: materials.trim(),
        business_rules: rules.trim(),
        integrations: integrations.trim(),
      };
      const { data: project, error: insertError } = await supabase.from("projects").insert({
        organization_id: orgId,
        name: projectName.trim(),
        solution_type: selected.type,
        status: "planejamento",
        brief,
        preview_config: config,
      }).select("id,name,solution_type,status,created_at").single();
      if (insertError) throw insertError;
      setSavedProjects(current => [project as SavedProject, ...current.filter(item => item.id !== project.id)]);
      setProjectName("");
      setStatus("Projeto salvo na nuvem como planejamento. Ele ainda não foi publicado para o cliente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível salvar o projeto.");
    } finally { setBusy(false); }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(brief.production_prompt);
      setStatus("Prompt personalizado copiado.");
    } catch {
      setStatus("Não foi possível copiar automaticamente. Revise as permissões de área de transferência do navegador.");
    }
  }

  return <AppShell><div className="content">
    <div className="eyebrow">Fábrica de soluções digitais</div>
    <h1 className="page-title">Criar projeto</h1>
    <p className="page-description">Escolha um modelo por nicho, personalize o briefing e salve o projeto no workspace privado da Arcany. Publicação é uma etapa posterior.</p>

    <form onSubmit={saveProject} className="section-grid" style={{ gridTemplateColumns: "minmax(0,1.05fr) minmax(280px,.95fr)", marginTop: 20, alignItems: "start" }}>
      <section className="panel" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><FilePlus2 size={17} color="#a99fff"/><h2 style={{ fontSize: 14, margin: 0 }}>1. Identificação e modelo</h2></div>
        <label style={label}>Nome interno do projeto<input required value={projectName} onChange={e => setProjectName(e.target.value)} style={field} placeholder="Ex.: Landing page da Pet Feliz"/></label>
        <label style={label}>Cliente / empresa<input required value={company} onChange={e => setCompany(e.target.value)} style={field} placeholder="Nome comercial confirmado"/></label>
        <label style={label}>Modelo por segmento
          <select value={templateId} onChange={e => setTemplateId(e.target.value)} style={field}>
            {solutionTemplates.map(item => <option key={item.id} value={item.id}>{item.niche} · {item.title}</option>)}
          </select>
        </label>
        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, background: "rgba(255,255,255,.02)" }}>
          <div style={{ color: "#b9adff", fontSize: 10, fontWeight: 700 }}>{selected.niche} · {selected.type}</div>
          <strong style={{ display: "block", fontSize: 13, marginTop: 5 }}>{selected.title}</strong>
          <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.6, margin: "6px 0 0" }}>{selected.objective}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>{selected.features.map(item => <span key={item} className="status-pill">{item}</span>)}</div>
          <a href="/modelos" style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "#b9adff", fontSize: 10, marginTop: 10, textDecoration: "none" }}>Ver biblioteca completa <ExternalLink size={12}/></a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}><Sparkles size={16} color="#a99fff"/><h3 style={{ fontSize: 13, margin: 0 }}>2. Briefing do cliente</h3></div>
        <label style={label}>Cidade / região<input value={city} onChange={e => setCity(e.target.value)} style={field} placeholder="Cidade e área atendida"/></label>
        <label style={label}>WhatsApp comercial<input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={field} placeholder="DDD + número"/></label>
        <label style={label}>Identidade visual<textarea value={brand} onChange={e => setBrand(e.target.value)} style={area} placeholder="Logo, cores, fontes e referências confirmadas..."/></label>
        <label style={label}>Fotos, produtos, serviços e conteúdo<textarea value={materials} onChange={e => setMaterials(e.target.value)} style={area} placeholder="Fotos reais, produtos, preços, textos e links fornecidos..."/></label>
        <label style={label}>Regras específicas do negócio<textarea value={rules} onChange={e => setRules(e.target.value)} style={area} placeholder="Entrega, agendamento, variações, horários, permissões..."/></label>
        <label style={label}>Integrações desejadas<textarea value={integrations} onChange={e => setIntegrations(e.target.value)} style={area} placeholder="WhatsApp, pagamentos, mapas, estoque, CRM..."/></label>
        <button className="action-button" disabled={busy || loading} style={{ justifyContent: "center", minHeight: 44 }}>{busy ? "Salvando..." : "Salvar projeto no workspace"}</button>
        <button type="button" className="secondary-button" onClick={copyPrompt} style={{ justifyContent: "center" }}><Copy size={14}/> Copiar prompt personalizado</button>
        {status && <p role="status" style={{ fontSize: 11, color: "#e9c77b", lineHeight: 1.6, margin: 0 }}>{status}</p>}
      </section>

      <section className="panel" style={{ padding: 18, position: "sticky", top: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><FolderKanban size={17} color="#a99fff"/><h2 style={{ fontSize: 14, margin: 0 }}>Projetos recentes</h2></div>
        <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5 }}>Registros reais salvos no banco da Arcany. Nenhum projeto de demonstração foi criado.</p>
        <button type="button" className="secondary-button" onClick={() => void loadProjects()} disabled={loading} style={{ marginBottom: 12 }}><RefreshCw size={13}/> Atualizar lista</button>
        {loading ? <p style={{ color: "var(--muted)", fontSize: 11 }}>Carregando projetos...</p> : savedProjects.length ? <div style={{ display: "grid", gap: 8 }}>
          {savedProjects.map(project => <div key={project.id} style={{ padding: 11, border: "1px solid var(--border)", borderRadius: 9 }}>
            <strong style={{ fontSize: 11 }}>{project.name}</strong>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}><span className="status-pill">{project.solution_type}</span><span className="status-pill">{project.status}</span></div>
            <div style={{ color: "var(--muted)", fontSize: 9, marginTop: 6 }}>{new Date(project.created_at).toLocaleString("pt-BR")}</div><Link href={"/projetos/"+project.id} className="secondary-button" style={{display:"inline-flex",marginTop:9}}>Abrir produção e entrega <ExternalLink size={12}/></Link>
          </div>)}
        </div> : <div style={{ padding: 20, border: "1px dashed var(--border)", borderRadius: 10, textAlign: "center" }}><FolderKanban size={22} color="#8390a5"/><p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>Nenhum projeto salvo ainda. Ao criar o primeiro projeto real, ele aparecerá aqui.</p></div>}
        <div style={{ marginTop: 15, padding: 12, borderRadius: 9, background: "rgba(149,134,255,.07)", border: "1px solid rgba(149,134,255,.18)" }}>
          <strong style={{ fontSize: 11 }}>Etapa atual: planejamento</strong>
          <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, margin: "5px 0 0" }}>Abra o projeto para anexar materiais do cliente, acompanhar a produção, registrar o link de preview e controlar a entrega. A publicação efetiva continua dependendo da hospedagem e validação do projeto produzido.</p>
        </div>
      </section>
    </form>
  </div></AppShell>;
}
