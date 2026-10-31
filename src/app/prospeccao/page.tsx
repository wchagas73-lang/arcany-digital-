"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Search, MapPin, Building2, SlidersHorizontal, Globe2, Sparkles } from "lucide-react";

export default function ProspeccaoPage() {
  const [city, setCity] = useState("Juiz de Fora");
  const [state, setState] = useState("MG");
  const [segment, setSegment] = useState("");
  const [status, setStatus] = useState("todos");
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  function handleSearch() {
    if (!city.trim() || !state.trim() || !segment.trim()) {
      setMessage("Preencha cidade, estado e segmento para preparar a pesquisa.");
      setSearched(false);
      return;
    }
    setMessage("Filtros preenchidos. A conexão com fontes reais de empresas será a próxima implementação; nenhum resultado fictício será exibido.");
    setSearched(true);
  }

  return (
    <AppShell>
      <div className="content">
        <div className="eyebrow">Encontrar oportunidades</div>
        <h1 className="page-title">Prospecção inteligente</h1>
        <p className="page-description">Encontre negócios por localização e segmento, avalie sua presença digital e transforme oportunidades em clientes.</p>

        <section className="panel" style={{ marginTop: 26, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 19 }}>
            <div className="empty-icon" style={{ margin: 0 }}><Search size={19} /></div>
            <div>
              <h2 style={{ fontSize: 14, margin: 0 }}>Configurar pesquisa</h2>
              <p style={{ color: "var(--muted)", fontSize: 11, margin: "5px 0 0" }}>Defina onde e que tipo de empresa deseja prospectar.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
            <label style={{ display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={13} /> Cidade</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Juiz de Fora" style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 }}>
              Estado (UF)
              <input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" maxLength={2} style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Building2 size={13} /> Segmento / nicho</span>
              <input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex.: restaurantes, pet shops, clínicas..." style={fieldStyle} />
            </label>
            <label style={{ display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><SlidersHorizontal size={13} /> Presença de site</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={fieldStyle}>
                <option value="todos">Todas as empresas</option>
                <option value="sem-site">Priorizar empresas sem site</option>
                <option value="com-site">Empresas que já têm site</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 19 }}>
            <button className="action-button" onClick={handleSearch}><Search size={15} /> Preparar pesquisa</button>
            <button className="secondary-button" onClick={() => { setCity("Juiz de Fora"); setState("MG"); setSegment(""); setStatus("todos"); setSearched(false); setMessage(""); }}>Limpar filtros</button>
          </div>
          {message && <div role="status" style={{ marginTop: 16, border: "1px solid rgba(139,124,255,.25)", background: "rgba(139,124,255,.08)", borderRadius: 10, padding: 13, color: "#d2ccff", fontSize: 12, lineHeight: 1.6 }}>{message}</div>}
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-heading">
            <div>
              <div className="panel-title">Empresas encontradas</div>
              <div className="panel-subtitle">{searched ? `Pesquisa preparada: ${segment} · ${city}/${state} · ${status === "sem-site" ? "sem site" : status === "com-site" ? "com site" : "todas"}` : "Os resultados reais aparecerão aqui após conectar as fontes de dados."}</div>
            </div>
            <span className="coming-tag">Integração pendente</span>
          </div>
          <div className="empty-state">
            <div className="empty-icon"><Globe2 size={19} /></div>
            <div className="empty-title">Sua próxima lista de clientes começa aqui</div>
            <p className="empty-copy">A busca ainda não consulta diretórios ou mapas. Na próxima etapa vamos integrar uma fonte real, analisar site e presença digital e permitir salvar cada empresa como lead.</p>
          </div>
        </section>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>
          <Sparkles size={15} color="#a99fff" style={{ flex: "0 0 auto", marginTop: 1 }} />
          A Arcany será multissetorial: você poderá pesquisar qualquer nicho, não apenas um segmento específico.
        </div>
      </div>
    </AppShell>
  );
}

const fieldStyle = {
  width: "100%",
  minHeight: 42,
  border: "1px solid var(--border)",
  borderRadius: 9,
  background: "#0c121d",
  color: "#f3f6fb",
  padding: "0 12px",
  outline: "none",
  fontSize: 12,
};
