"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Search, MapPin, Building2, SlidersHorizontal, Globe2, Sparkles, ExternalLink, Phone, Star, Loader2 } from "lucide-react";

type Company = {
  id: string;
  name: string;
  address: string;
  website: string | null;
  phone: string | null;
  rating: number | null;
  reviews: number;
  mapsUrl: string | null;
  types: string[];
  googleProfileFound?: boolean;
  websiteListed?: boolean;
  menuOnlineStatus?: string;
  ecommerceStatus?: string;
  inventorySystemStatus?: string;
  crmStatus?: string;
  financialSystemStatus?: string;
};

type WebsiteCheck = { checkedUrl: string; checkedAt: string; findings: Array<{ key: string; label: string; status: string; evidence: Array<{ url: string; text: string }> }>; note: string };

export default function ProspeccaoPage() {
  const [city, setCity] = useState("Juiz de Fora");
  const [state, setState] = useState("MG");
  const [segment, setSegment] = useState("");
  const [status, setStatus] = useState("todos");
  const [focus, setFocus] = useState("geral");
  const [results, setResults] = useState<Company[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalFound, setTotalFound] = useState(0);
  const [websiteChecks, setWebsiteChecks] = useState<Record<string, WebsiteCheck>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationErrors, setVerificationErrors] = useState<Record<string, string>>({});

  async function handleSearch() {
    if (!city.trim() || !state.trim() || !segment.trim()) {
      setMessage("Preencha cidade, estado e segmento para pesquisar.");
      setSearched(false);
      return;
    }

    setLoading(true);
    setMessage("");
    setResults([]);
    setSearched(false);

    try {
      const response = await fetch("/api/prospeccao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, state, segment, status, focus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível realizar a pesquisa.");
      }

      setResults(data.results ?? []);
      setTotalFound(data.totalFound ?? 0);
      setSearched(true);
      setMessage(
        data.totalShown > 0
          ? `Pesquisa concluída. ${data.totalShown} empresa(s) exibida(s) de ${data.totalFound} encontrada(s) na consulta do Google.`
          : data.totalFound > 0
            ? "O Google encontrou empresas, mas nenhuma corresponde ao filtro de presença de site selecionado."
            : "O Google não retornou empresas para esses termos. Tente outro segmento ou cidade."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado na pesquisa.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyWebsite(company: Company) {
    if (!company.website) return;
    setVerifyingId(company.id);
    setVerificationErrors((current) => ({ ...current, [company.id]: "" }));
    try {
      const response = await fetch("/api/prospeccao/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: company.website }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível analisar este site.");
      setWebsiteChecks((current) => ({ ...current, [company.id]: data }));
    } catch (error) {
      setVerificationErrors((current) => ({ ...current, [company.id]: error instanceof Error ? error.message : "Erro ao analisar o site." }));
    } finally {
      setVerifyingId(null);
    }
  }

  function clearFilters() {
    setCity("Juiz de Fora");
    setState("MG");
    setSegment("");
    setStatus("todos");
    setFocus("geral");
    setResults([]);
    setSearched(false);
    setMessage("");
    setTotalFound(0);
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
              <p style={{ color: "var(--muted)", fontSize: 11, margin: "5px 0 0" }}>Pesquise empresas reais por cidade e segmento.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
            <label style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={13} /> Cidade</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Juiz de Fora" style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              Estado (UF)
              <input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" maxLength={2} style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Building2 size={13} /> Segmento / nicho</span>
              <input
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Digite ou escolha qualquer nicho..."
                list="arcany-segmentos"
                style={fieldStyle}
              />
              <datalist id="arcany-segmentos">
                {segmentSuggestions.map((item) => <option key={item} value={item} />)}
              </datalist>
              <span style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5 }}>
                Sugestões para agilizar: você também pode digitar um segmento que não esteja na lista.
              </span>
            </label>
            <label style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><SlidersHorizontal size={13} /> Presença de site</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={fieldStyle}>
                <option value="todos">Todas as empresas</option>
                <option value="sem-site">Somente empresas sem site listado</option>
                <option value="com-site">Empresas com site listado</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 19 }}>
            <button className="action-button" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
              {loading ? "Pesquisando..." : "Buscar empresas"}
            </button>
            <button className="secondary-button" onClick={clearFilters} disabled={loading}>Limpar filtros</button>
          </div>
          {message && <div role="status" style={{ marginTop: 16, border: "1px solid rgba(139,124,255,.25)", background: "rgba(139,124,255,.08)", borderRadius: 10, padding: 13, color: "#d2ccff", fontSize: 12, lineHeight: 1.6 }}>{message}</div>}
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-heading">
            <div>
              <div className="panel-title">Empresas encontradas</div>
              <div className="panel-subtitle">{searched ? `${results.length} exibida(s) · ${totalFound} retornada(s) pelo Google` : "Os resultados da pesquisa aparecerão aqui."}</div>
              {searched && <div style={{ color: "#b8adff", fontSize: 10, marginTop: 5 }}>Foco selecionado: {focusLabels[focus] ?? focusLabels.geral}</div>}
            </div>
            <span className="coming-tag">Google Places</span>
          </div>

          {!searched && !loading && (
            <div className="empty-state">
              <div className="empty-icon"><Globe2 size={19} /></div>
              <div className="empty-title">Sua próxima lista de clientes começa aqui</div>
              <p className="empty-copy">Informe a cidade e o segmento para consultar empresas no Google. A ausência de um site listado é apenas um sinal para conferir, não uma confirmação de que a empresa não possui site.</p>
            </div>
          )}

          {loading && <div className="empty-state"><Loader2 size={24} className="spin" /><p className="empty-copy">Consultando empresas no Google...</p></div>}

          {searched && results.length > 0 && (
            <div style={{ display: "grid", gap: 10, padding: "0 18px 18px" }}>
              {results.map((company) => (
                <div key={company.id || company.name} style={{ display: "grid", gap: 8 }}>
                <article style={companyCardStyle}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ margin: 0, color: "#f3f6fb", fontSize: 13, fontWeight: 650 }}>{company.name}</h3>
                    <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 11, lineHeight: 1.5 }}>{company.address}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9, color: "#aeb9ca", fontSize: 10 }}>
                      {company.googleProfileFound && <span style={signalPill}>Perfil localizado no Google</span>}
                      {company.websiteListed && <span style={signalPill}>Site listado</span>}
                      {!company.websiteListed && <span style={signalWarning}>Site não listado (confirmar)</span>}
                      <span style={signalPill}>Cardápio: investigar</span>
                      <span style={signalPill}>E-commerce: investigar</span>
                      <span style={signalPill}>Estoque / CRM / financeiro: confirmar com a empresa</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 9, color: "#aeb9ca", fontSize: 11 }}>
                      {company.rating !== null && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Star size={12} /> {company.rating.toFixed(1)} ({company.reviews})</span>}
                      {company.phone && <a href={`tel:${company.phone}`} style={linkStyle}><Phone size={12} /> {company.phone}</a>}
                      {!company.website && <span style={{ color: "#e9bd72" }}>Sem site listado no Google</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9 }}>
                    {company.website && <><a href={company.website} target="_blank" rel="noreferrer" style={linkStyle}>Site <ExternalLink size={12} /></a><button type="button" onClick={() => verifyWebsite(company)} disabled={verifyingId === company.id} className="secondary-button" style={{ fontSize: 10, padding: "7px 9px" }}>{verifyingId === company.id ? <Loader2 size={12} className="spin" /> : <Search size={12} />} Analisar site</button></>}
                    {company.mapsUrl && <a href={company.mapsUrl} target="_blank" rel="noreferrer" style={linkStyle}>Google Maps <ExternalLink size={12} /></a>}
                  </div>
                </article>
                {verificationErrors[company.id] && <div role="alert" style={{ border: "1px solid rgba(233,189,114,.3)", borderRadius: 9, padding: 10, color: "#e9bd72", fontSize: 11 }}>{verificationErrors[company.id]}</div>}
                {websiteChecks[company.id] && <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 13, background: "rgba(139,124,255,.045)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginBottom: 10 }}><strong style={{ fontSize: 11, color: "#e7e3ff" }}>Sinais encontrados na página pública</strong><span style={{ fontSize: 10, color: "var(--muted)" }}>Verificado em {new Date(websiteChecks[company.id].checkedAt).toLocaleString("pt-BR")}</span></div>
                  <div style={{ display: "grid", gap: 8 }}>{websiteChecks[company.id].findings.map((finding) => <div key={finding.key} style={{ display: "grid", gap: 4, fontSize: 11 }}><span style={{ color: finding.status === "sinal_encontrado" ? "#a9dfbd" : "#e9bd72" }}>{finding.status === "sinal_encontrado" ? "Possível sinal: " : "Não identificado na página inicial: "}{finding.label}</span>{finding.evidence.map((item, index) => <a key={index} href={new URL(item.url, websiteChecks[company.id].checkedUrl).toString()} target="_blank" rel="noreferrer" style={linkStyle}>{item.text || item.url} <ExternalLink size={10} /></a>)}</div>)}</div>
                  <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5, margin: "10px 0 0" }}>{websiteChecks[company.id].note}</p>
                </div>}
                </div>
              ))}
            </div>
          )}

          {searched && results.length === 0 && <div className="empty-state"><div className="empty-icon"><Search size={19} /></div><div className="empty-title">Nenhuma empresa para exibir</div><p className="empty-copy">Tente ampliar o segmento ou alterar a localização e faça uma nova busca.</p></div>}
        </section>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>
          <Sparkles size={15} color="#a99fff" style={{ flex: "0 0 auto", marginTop: 1 }} />
          Importante: o Google Places ajuda a localizar empresas e consultar dados públicos do perfil, como site, telefone e avaliações. Ele não revela se a empresa usa estoque, CRM ou sistema financeiro interno. Cardápios e lojas online precisam ser verificados no site ou em fontes públicas; sistemas internos devem ser confirmados em conversa com o responsável. A Arcany não deve marcar uma ausência como fato sem verificação.
        </div>
      </div>
    </AppShell>
  );
}

const focusLabels: Record<string, string> = { geral: "Diagnóstico digital completo", site: "Site profissional", cardapio: "Cardápio / catálogo online", ecommerce: "E-commerce / pedidos online", google: "Presença no Google", estoque: "Controle de estoque digital", crm: "CRM / cadastro de clientes", financeiro: "Gestão financeira" };

const segmentSuggestions = [
  "Academias", "Agências de publicidade", "Agências de turismo", "Advogados", "Agricultura",
  "Alimentação saudável", "Aluguel de equipamentos", "Autoescolas", "Autopeças", "Barbearias",
  "Bares", "Clínicas", "Clínicas médicas", "Clínicas odontológicas", "Contabilidades",
  "Cosméticos", "Construção civil", "Cursos profissionalizantes", "Distribuidoras",
  "Escolas", "Eletricistas", "Eletrônicos", "Escritórios de arquitetura", "Farmácias",
  "Fisioterapia", "Floriculturas", "Hotéis", "Imobiliárias", "Indústrias",
  "Lojas de roupas", "Lojas de calçados", "Lojas de móveis", "Lojas de variedades",
  "Materiais de construção", "Mercados", "Oficinas mecânicas", "Óticas", "Padarias",
  "Pet shops", "Papelarias", "Perfumarias", "Prestadores de serviços", "Psicólogos",
  "Restaurantes", "Salões de beleza", "Serviços de limpeza", "Supermercados",
  "Transportadoras", "Veterinários", "Hortifrutis", "Açougues", "Confeitarias",
  "Marmitarias", "Pizzarias", "Lanchonetes", "Assistência técnica", "Informática",
  "Clínicas veterinárias", "Laboratórios", "Consultórios", "Fotógrafos", "Gráficas",
  "Marcenarias", "Serralherias", "Vidraçarias", "Encanadores", "Empresas de eventos",
  "Estúdios de tatuagem", "Lavanderias", "Estacionamentos", "Despachantes",
  "Consultorias", "Contabilidade", "Logística", "Comércio atacadista", "Comércio varejista"
];

const labelStyle = { display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 };
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
const companyCardStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  padding: 14,
  border: "1px solid var(--border)",
  borderRadius: 10,
  background: "rgba(255,255,255,.015)",
};
const linkStyle = { display: "inline-flex", alignItems: "center", gap: 5, color: "#b8adff", fontSize: 11, textDecoration: "none" };
const signalPill = { border: "1px solid rgba(139,124,255,.25)", background: "rgba(139,124,255,.08)", color: "#c9c1ff", borderRadius: 20, padding: "4px 7px" };
const signalWarning = { border: "1px solid rgba(233,189,114,.3)", background: "rgba(233,189,114,.08)", color: "#e9bd72", borderRadius: 20, padding: "4px 7px" };
