"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Search, Copy, Check, Layers3, Sparkles, ClipboardList, WandSparkles, FileText } from "lucide-react";
import { solutionTemplates, templateNiches, templateTypes } from "@/lib/solution-templates";

const inputStyle: React.CSSProperties = {
  width: "100%", minHeight: 42, border: "1px solid var(--border)", borderRadius: 9,
  background: "rgba(255,255,255,.025)", color: "#eef2fa", padding: "10px 12px", fontSize: 12,
};
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, color: "var(--muted)", fontSize: 10 };
const areaStyle: React.CSSProperties = { ...inputStyle, minHeight: 88, resize: "vertical" };

export default function ModelosPage() {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("Todos");
  const [type, setType] = useState("Todos");
  const [selectedId, setSelectedId] = useState(solutionTemplates[0]?.id ?? "");
  const [copied, setCopied] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [brand, setBrand] = useState("");
  const [assets, setAssets] = useState("");
  const [businessRules, setBusinessRules] = useState("");
  const [integrations, setIntegrations] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return solutionTemplates.filter((item) => {
      const matchesNiche = niche === "Todos" || item.niche === niche;
      const matchesType = type === "Todos" || item.type === type;
      const searchable = [item.title, item.niche, item.type, item.summary, item.objective].join(" ").toLocaleLowerCase("pt-BR");
      return matchesNiche && matchesType && (!normalized || searchable.includes(normalized));
    });
  }, [query, niche, type]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const customizedPrompt = useMemo(() => {
    if (!selected) return "";
    return [
      selected.prompt,
      "",
      "BRIEFING DE PERSONALIZAÇÃO DESTE PROJETO",
      "Empresa: " + (company.trim() || "PENDENTE: solicitar ao cliente"),
      "Cidade/região: " + (city.trim() || "PENDENTE: solicitar ao cliente"),
      "WhatsApp comercial: " + (whatsapp.trim() || "PENDENTE: solicitar ao cliente"),
      "Site atual: " + (website.trim() || "Não informado"),
      "Identidade visual e direção de marca: " + (brand.trim() || "PENDENTE: coletar logo, cores e referências"),
      "Materiais, produtos, serviços e conteúdo fornecidos: " + (assets.trim() || "PENDENTE: coletar fotos, textos, produtos, preços e informações reais"),
      "Regras operacionais específicas: " + (businessRules.trim() || "PENDENTE: validar com o responsável"),
      "Integrações desejadas: " + (integrations.trim() || "PENDENTE: definir escopo, credenciais, custos e autorização"),
      "",
      "INSTRUÇÕES DE EXECUÇÃO DESTE PROJETO:",
      "- Não preencher lacunas com informações inventadas. Marcar itens pendentes e solicitar os dados.",
      "- Criar uma experiência visual própria para este negócio, usando o modelo como arquitetura inicial e não como cópia genérica.",
      "- Separar conteúdo e configurações do cliente dos componentes reutilizáveis.",
      "- Entregar uma lista de dados faltantes, decisões de escopo, riscos e critérios de aceite antes da publicação.",
      "- Não publicar, contratar serviços ou ativar integrações pagas sem autorização explícita.",
    ].join("\n");
  }, [selected, company, city, whatsapp, website, brand, assets, businessRules, integrations]);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("error");
      window.setTimeout(() => setCopied(""), 1800);
    }
  }

  return (
    <AppShell>
      <div className="content">
        <div className="eyebrow">Estúdio de soluções · Biblioteca reutilizável</div>
        <h1 className="page-title">Biblioteca de modelos</h1>
        <p className="page-description">Escolha um modelo por nicho, preencha o briefing do cliente e gere um prompt de produção personalizado. Os dados permanecem neste formulário enquanto a página estiver aberta.</p>

        <section className="panel" style={{ padding: 18, marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
            <div className="empty-icon" style={{ margin: 0 }}><Layers3 size={17} /></div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 14, margin: 0 }}>Modelos prontos para personalizar</h2>
              <p style={{ color: "var(--muted)", fontSize: 11, margin: "4px 0 0" }}>{solutionTemplates.length} estruturas iniciais em {templateNiches.length - 1} segmentos</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 10 }}>
            <label style={labelStyle}>Buscar modelo
              <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 11, top: 13, color: "#8390a5" }} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: pet, catálogo, estoque..." style={{ ...inputStyle, paddingLeft: 34 }} /></div>
            </label>
            <label style={labelStyle}>Segmento
              <select value={niche} onChange={(event) => setNiche(event.target.value)} style={inputStyle}>{templateNiches.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
            <label style={labelStyle}>Tipo de solução
              <select value={type} onChange={(event) => setType(event.target.value)} style={inputStyle}>{templateTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            </label>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 14, marginTop: 14, alignItems: "start" }}>
          <section className="panel" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "3px 3px 12px" }}>
              <strong style={{ fontSize: 12 }}>Modelos disponíveis</strong><span style={{ color: "var(--muted)", fontSize: 10 }}>{filtered.length} encontrados</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map((item) => {
                const active = selected?.id === item.id;
                return <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setShowPrompt(false); }} style={{ textAlign: "left", cursor: "pointer", border: active ? "1px solid #9586ff" : "1px solid var(--border)", background: active ? "rgba(149,134,255,.10)" : "rgba(255,255,255,.018)", borderRadius: 10, padding: 12, color: "#eef2fa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}><strong style={{ fontSize: 12, lineHeight: 1.45 }}>{item.title}</strong>{active ? <Check size={15} color="#b9adff" /> : null}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}><span className="status-pill">{item.niche}</span><span className="status-pill">{item.type}</span></div>
                  <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5, margin: "8px 0 0" }}>{item.summary}</p>
                </button>;
              })}
              {filtered.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>Nenhum modelo encontrado. Tente outro termo ou filtro.</div> : null}
            </div>
          </section>

          <section className="panel" style={{ padding: 18, minWidth: 0 }}>
            {selected ? <>
              <div className="eyebrow">{selected.niche} · {selected.type}</div>
              <h2 style={{ fontSize: 18, lineHeight: 1.35, margin: "8px 0" }}>{selected.title}</h2>
              <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.65, margin: "0 0 15px" }}>{selected.summary}</p>
              <div style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,.02)", borderRadius: 10, padding: 13 }}>
                <div style={{ color: "#b9adff", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>OBJETIVO DE NEGÓCIO</div><p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>{selected.objective}</p>
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, marginBottom: 9 }}><ClipboardList size={15} /> Estrutura recomendada</div>
                <div style={{ display: "grid", gap: 7 }}>{selected.sections.map((item, index) => <div key={item} style={{ display: "flex", gap: 9, alignItems: "start", fontSize: 11, color: "#d5dceb" }}><span style={{ color: "#a99fff", fontWeight: 700, minWidth: 17 }}>{String(index + 1).padStart(2, "0")}</span><span>{item}</span></div>)}</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 9 }}>Funcionalidades previstas</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{selected.features.map((item) => <span key={item} style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "7px 9px", fontSize: 10, color: "#cbd4e3" }}>{item}</span>)}</div>
              </div>
            </> : <div style={{ padding: 30, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>Selecione um modelo para ver a estrutura.</div>}
          </section>
        </div>

        {selected ? <section className="panel" style={{ padding: 18, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}><div className="empty-icon" style={{ margin: 0 }}><WandSparkles size={16} /></div><h2 style={{ fontSize: 14, margin: 0 }}>Personalizar para um cliente</h2></div>
          <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.6, margin: "0 0 15px" }}>Preencha o que já foi confirmado. Os campos vazios serão tratados como pendências no prompt, nunca como autorização para inventar informações.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 11 }}>
            <label style={labelStyle}>Nome da empresa<input value={company} onChange={e => setCompany(e.target.value)} placeholder="Nome comercial" style={inputStyle} /></label>
            <label style={labelStyle}>Cidade / região<input value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade e área atendida" style={inputStyle} /></label>
            <label style={labelStyle}>WhatsApp comercial<input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="DDD + número" style={inputStyle} /></label>
            <label style={labelStyle}>Site atual (opcional)<input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={inputStyle} /></label>
            <label style={labelStyle}>Identidade visual<textarea value={brand} onChange={e => setBrand(e.target.value)} placeholder="Cores, logo, fontes e referências confirmadas..." rows={3} style={areaStyle} /></label>
            <label style={labelStyle}>Fotos, produtos e serviços<textarea value={assets} onChange={e => setAssets(e.target.value)} placeholder="Links de fotos, lista de produtos, preços e descrições fornecidos..." rows={3} style={areaStyle} /></label>
            <label style={labelStyle}>Regras específicas do negócio<textarea value={businessRules} onChange={e => setBusinessRules(e.target.value)} placeholder="Horários, entrega, agendamento, variações, permissões..." rows={3} style={areaStyle} /></label>
            <label style={labelStyle}>Integrações desejadas<textarea value={integrations} onChange={e => setIntegrations(e.target.value)} placeholder="WhatsApp, pagamentos, mapas, estoque, CRM..." rows={3} style={areaStyle} /></label>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <button type="button" className="action-button" onClick={() => copyText(customizedPrompt, "prompt")}><Copy size={14} />{copied === "prompt" ? "Prompt personalizado copiado" : "Copiar prompt personalizado"}</button>
            <button type="button" className="secondary-button" onClick={() => setShowPrompt(v => !v)}><FileText size={14} />{showPrompt ? "Ocultar prompt" : "Visualizar prompt"}</button>
          </div>
          {copied === "error" ? <p role="status" style={{ color: "#f4c879", fontSize: 11 }}>Não foi possível copiar automaticamente neste navegador. Você pode visualizar e selecionar o texto abaixo.</p> : null}
          {showPrompt ? <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 460, overflow: "auto", marginTop: 14, padding: 13, border: "1px solid var(--border)", borderRadius: 9, background: "#090e17", color: "#cbd5e4", fontSize: 10, lineHeight: 1.65 }}>{customizedPrompt}</pre> : null}
          <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, margin: "13px 0 0" }}>Nesta etapa, o briefing é montado no navegador e não é salvo como projeto. A gravação permanente, o editor visual, a geração de repositório e a publicação serão integrados em etapas próprias.</p>
        </section> : null}
      </div>
    </AppShell>
  );
}
