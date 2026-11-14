"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Search, Copy, Check, Layers3, Sparkles, ChevronDown, ClipboardList } from "lucide-react";
import { solutionTemplates, templateNiches, templateTypes } from "@/lib/solution-templates";

const inputStyle: React.CSSProperties = {
  width: "100%", minHeight: 42, border: "1px solid var(--border)", borderRadius: 9,
  background: "rgba(255,255,255,.025)", color: "#eef2fa", padding: "10px 12px", fontSize: 12,
};

export default function ModelosPage() {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("Todos");
  const [type, setType] = useState("Todos");
  const [selectedId, setSelectedId] = useState(solutionTemplates[0]?.id ?? "");
  const [copied, setCopied] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

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

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <AppShell>
      <div className="content">
        <div className="eyebrow">Estúdio de soluções · Biblioteca reutilizável</div>
        <h1 className="page-title">Biblioteca de modelos</h1>
        <p className="page-description">Encontre uma estrutura inicial por nicho e tipo de serviço. Personalize a identidade, os dados reais e as regras de cada cliente antes de produzir.</p>

        <section className="panel" style={{ padding: 18, marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
            <div className="empty-icon" style={{ margin: 0 }}><Layers3 size={17} /></div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 14, margin: 0 }}>Modelos prontos para personalizar</h2>
              <p style={{ color: "var(--muted)", fontSize: 11, margin: "4px 0 0" }}>{solutionTemplates.length} estruturas iniciais em {templateNiches.length - 1} segmentos</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 10 }}>
            <label style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 10 }}>
              Buscar modelo
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 11, top: 13, color: "#8390a5" }} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: pet, catálogo, estoque..." style={{ ...inputStyle, paddingLeft: 34 }} />
              </div>
            </label>
            <label style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 10 }}>
              Segmento
              <select value={niche} onChange={(event) => setNiche(event.target.value)} style={inputStyle}>
                {templateNiches.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 10 }}>
              Tipo de solução
              <select value={type} onChange={(event) => setType(event.target.value)} style={inputStyle}>
                {templateTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 14, marginTop: 14, alignItems: "start" }}>
          <section className="panel" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "3px 3px 12px" }}>
              <strong style={{ fontSize: 12 }}>Modelos disponíveis</strong>
              <span style={{ color: "var(--muted)", fontSize: 10 }}>{filtered.length} encontrados</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map((item) => {
                const active = selected?.id === item.id;
                return <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setShowPrompt(false); }} style={{
                  textAlign: "left", cursor: "pointer", border: active ? "1px solid #9586ff" : "1px solid var(--border)",
                  background: active ? "rgba(149,134,255,.10)" : "rgba(255,255,255,.018)",
                  borderRadius: 10, padding: 12, color: "#eef2fa",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
                    <strong style={{ fontSize: 12, lineHeight: 1.45 }}>{item.title}</strong>
                    {active ? <Check size={15} color="#b9adff" /> : null}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    <span className="status-pill">{item.niche}</span>
                    <span className="status-pill">{item.type}</span>
                  </div>
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
                <div style={{ color: "#b9adff", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>OBJETIVO DE NEGÓCIO</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>{selected.objective}</p>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, marginBottom: 9 }}><ClipboardList size={15} /> Estrutura recomendada</div>
                <div style={{ display: "grid", gap: 7 }}>
                  {selected.sections.map((item, index) => <div key={item} style={{ display: "flex", gap: 9, alignItems: "start", fontSize: 11, color: "#d5dceb" }}><span style={{ color: "#a99fff", fontWeight: 700, minWidth: 17 }}>{String(index + 1).padStart(2, "0")}</span><span>{item}</span></div>)}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 9 }}>Funcionalidades previstas</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {selected.features.map((item) => <span key={item} style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "7px 9px", fontSize: 10, color: "#cbd4e3" }}>{item}</span>)}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                <button type="button" className="action-button" onClick={() => copyText(selected.prompt, "prompt")}>
                  {copied === "prompt" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "prompt" ? "Prompt copiado" : "Copiar prompt de produção"}
                </button>
                <button type="button" className="secondary-button" onClick={() => setShowPrompt((value) => !value)}>
                  <Sparkles size={14} /> {showPrompt ? "Ocultar prompt" : "Ver prompt"}
                  <ChevronDown size={13} />
                </button>
              </div>

              {showPrompt ? <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 360, overflow: "auto", marginTop: 14, padding: 13, border: "1px solid var(--border)", borderRadius: 9, background: "#090e17", color: "#cbd5e4", fontSize: 10, lineHeight: 1.65 }}>{selected.prompt}</pre> : null}
              <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, margin: "15px 0 0" }}>Este modelo é um ponto de partida de produção. Ainda é necessário validar escopo, conteúdo, integrações, segurança, dados e publicação de cada projeto.</p>
            </> : <div style={{ padding: 30, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>Selecione um modelo para ver a estrutura.</div>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
