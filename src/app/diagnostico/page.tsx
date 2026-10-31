"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AlertCircle, CheckCircle2, ClipboardList, RotateCcw, Search, ShieldQuestion } from "lucide-react";

type Status = "investigar" | "confirmado" | "nao-identificado" | "nao-se-aplica";
type Item = { id: string; name: string; detail: string; solution: string; status: Status; note: string };
type Group = { name: string; description: string; items: Omit<Item, "status" | "note">[] };

const groups: Group[] = [
  { name: "Vendas e presença digital", description: "Como a empresa apresenta e vende seus produtos pela internet.", items: [
    { id: "site", name: "Site institucional", detail: "Não foi localizado um site próprio da empresa.", solution: "Criação de site profissional" },
    { id: "catalogo", name: "Catálogo digital", detail: "Produtos e serviços não estão organizados em um catálogo online.", solution: "Catálogo digital com fotos, preços e categorias" },
    { id: "cardapio", name: "Cardápio digital", detail: "Restaurantes e negócios de alimentação podem não ter cardápio online.", solution: "Cardápio digital integrado ao WhatsApp" },
    { id: "carrinho", name: "Carrinho e pedidos online", detail: "O cliente pode não conseguir montar o pedido e finalizar a compra online.", solution: "Loja virtual com carrinho e painel de pedidos" },
    { id: "whatsapp-pedidos", name: "Pedidos organizados", detail: "Pedidos podem ficar dispersos em conversas e mensagens.", solution: "Central de pedidos e automação de atendimento" },
  ]},
  { name: "Estoque, compras e operação", description: "Como a empresa controla mercadorias, fornecedores e movimentações.", items: [
    { id: "estoque", name: "Controle de estoque", detail: "A empresa pode depender de caderno ou planilhas sem atualização integrada.", solution: "Sistema de estoque com entradas e saídas" },
    { id: "validade", name: "Lotes e validade", detail: "Pode não haver alertas de produtos próximos do vencimento ou vencidos.", solution: "Controle por lote, validade e alertas" },
    { id: "reposicao", name: "Reposição de mercadorias", detail: "Pode faltar aviso de estoque mínimo e necessidade de compra.", solution: "Alertas de estoque mínimo e sugestão de reposição" },
    { id: "nota-fiscal", name: "Entrada por nota fiscal", detail: "A entrada de compras pode ser digitada manualmente, item por item.", solution: "Importação de XML de NF-e com conferência antes de atualizar o estoque" },
    { id: "fornecedores", name: "Cadastro de fornecedores", detail: "Dados, compras e histórico de fornecedores podem ficar descentralizados.", solution: "Cadastro e histórico de fornecedores e compras" },
    { id: "perdas", name: "Perdas e ajustes", detail: "Quebras, perdas, devoluções e ajustes podem não ser registrados corretamente.", solution: "Registro de perdas, devoluções e inventário" },
  ]},
  { name: "Financeiro e gestão", description: "Como a empresa acompanha dinheiro, resultados e relacionamento com clientes.", items: [
    { id: "caixa", name: "Fluxo de caixa", detail: "Entradas e saídas podem não estar organizadas em um controle único.", solution: "Fluxo de caixa e conciliação de movimentações" },
    { id: "pagar-receber", name: "Contas a pagar e receber", detail: "Vencimentos e cobranças podem depender de anotações manuais.", solution: "Agenda financeira com alertas de vencimento" },
    { id: "pdv", name: "Vendas integradas ao estoque", detail: "As vendas podem não dar baixa automática nas mercadorias.", solution: "PDV integrado ao estoque e ao financeiro" },
    { id: "crm", name: "CRM e histórico de clientes", detail: "A empresa pode não acompanhar contatos, compras e oportunidades.", solution: "CRM com cadastro e histórico de clientes" },
    { id: "dashboard", name: "Indicadores e relatórios", detail: "O responsável pode não ter uma visão clara de vendas, custos e resultados.", solution: "Dashboard gerencial com indicadores e relatórios" },
    { id: "planilhas", name: "Processos em planilhas", detail: "Informações importantes podem estar espalhadas em vários arquivos Excel.", solution: "Sistema integrado para substituir controles manuais" },
  ]},
];

const statusLabels: Record<Status, string> = {
  investigar: "A investigar",
  confirmado: "Problema confirmado",
  "nao-identificado": "Não identificado",
  "nao-se-aplica": "Não se aplica",
};

const statusColors: Record<Status, string> = {
  investigar: "#d5b36d",
  confirmado: "#f19a86",
  "nao-identificado": "#8c9bb0",
  "nao-se-aplica": "#8c9bb0",
};

const initialItems: Item[] = groups.flatMap((group) => group.items.map((item) => ({ ...item, status: "investigar" as Status, note: "" })));

export default function DiagnosticoPage() {
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [filter, setFilter] = useState<"todos" | Status>("todos");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => ({
    total: items.length,
    confirmar: items.filter((item) => item.status === "confirmado").length,
    investigar: items.filter((item) => item.status === "investigar").length,
    naoIdentificado: items.filter((item) => item.status === "nao-identificado").length,
  }), [items]);

  function updateItem(id: string, changes: Partial<Pick<Item, "status" | "note">>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function reset() {
    setItems(initialItems);
    setCompany("");
    setSegment("");
    setFilter("todos");
    setQuery("");
  }

  return (
    <AppShell>
      <div className="content">
        <div className="eyebrow">Inteligência comercial</div>
        <h1 className="page-title">Diagnóstico de oportunidades</h1>
        <p className="page-description">Registre as necessidades de cada empresa e descubra quais soluções digitais fazem sentido oferecer. Nenhum problema é marcado como confirmado sem validação.</p>

        <section className="panel" style={{ marginTop: 24, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div className="empty-icon" style={{ margin: 0 }}><ClipboardList size={18} /></div>
            <div><h2 style={{ fontSize: 14, margin: 0 }}>Empresa em análise</h2><p style={{ color: "var(--muted)", fontSize: 11, margin: "4px 0 0" }}>Identifique a empresa antes de registrar o diagnóstico.</p></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
            <label style={labelStyle}>Nome da empresa<input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Hortifruti do bairro" style={fieldStyle} /></label>
            <label style={labelStyle}>Segmento<input value={segment} onChange={(event) => setSegment(event.target.value)} placeholder="Ex.: Hortifruti, padaria, pet shop" style={fieldStyle} /></label>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginTop: 14 }}>
          <Summary label="Pontos avaliados" value={counts.total} color="#dbe3ef" />
          <Summary label="Confirmados" value={counts.confirmar} color="#f19a86" />
          <Summary label="A investigar" value={counts.investigar} color="#d5b36d" />
          <Summary label="Não identificados" value={counts.naoIdentificado} color="#9aa8ba" />
        </div>

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-heading" style={{ flexWrap: "wrap" }}>
            <div><div className="panel-title">Mapa de necessidades</div><div className="panel-subtitle">Atualize a situação conforme conversar com o empresário ou verificar fontes confiáveis.</div></div>
            <button className="secondary-button" onClick={reset}><RotateCcw size={13} /> Limpar diagnóstico</button>
          </div>
          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
            <label style={labelStyle}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Search size={13} /> Buscar necessidade</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: estoque, CRM, validade..." style={fieldStyle} /></label>
            <label style={labelStyle}>Filtrar situação<select value={filter} onChange={(event) => setFilter(event.target.value as "todos" | Status)} style={fieldStyle}><option value="todos">Todas as situações</option><option value="investigar">A investigar</option><option value="confirmado">Problemas confirmados</option><option value="nao-identificado">Não identificados</option><option value="nao-se-aplica">Não se aplica</option></select></label>
          </div>

          {groups.map((group) => {
            const visible = items.filter((item) => group.items.some((source) => source.id === item.id) && (filter === "todos" || item.status === filter) && (item.name + item.detail + item.solution).toLowerCase().includes(query.toLowerCase()));
            if (!visible.length) return null;
            return <div key={group.name} style={{ padding: "8px 18px 18px" }}>
              <div style={{ margin: "8px 0 12px" }}><h3 style={{ fontSize: 13, margin: 0 }}>{group.name}</h3><p style={{ color: "var(--muted)", fontSize: 11, margin: "5px 0 0" }}>{group.description}</p></div>
              <div style={{ display: "grid", gap: 9 }}>
                {visible.map((item) => (
                  <article key={item.id} style={{ border: "1px solid var(--border)", borderRadius: 11, padding: 13, background: "rgba(255,255,255,.015)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}><strong style={{ fontSize: 12 }}>{item.name}</strong><span style={{ fontSize: 9, border: "1px solid var(--border)", borderRadius: 99, padding: "3px 7px", color: statusColors[item.status] }}>{statusLabels[item.status]}</span></div>
                        <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.55, margin: "6px 0" }}>{item.detail}</p>
                        <p style={{ color: "#b8adff", fontSize: 10, margin: 0 }}>Solução possível: {item.solution}</p>
                      </div>
                      <select aria-label={"Situação: " + item.name} value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value as Status })} style={{ ...fieldStyle, width: "min(100%, 205px)", minHeight: 36, fontSize: 10 }}>
                        <option value="investigar">A investigar</option><option value="confirmado">Problema confirmado</option><option value="nao-identificado">Não identificado</option><option value="nao-se-aplica">Não se aplica</option>
                      </select>
                    </div>
                    <input aria-label={"Observação: " + item.name} value={item.note} onChange={(event) => updateItem(item.id, { note: event.target.value })} placeholder="Observação ou evidência (opcional)" style={{ ...fieldStyle, marginTop: 10, minHeight: 36, fontSize: 10 }} />
                  </article>
                ))}
              </div>
            </div>;
          })}
          {items.filter((item) => (filter === "todos" || item.status === filter) && (item.name + item.detail + item.solution).toLowerCase().includes(query.toLowerCase())).length === 0 && <div className="empty-state"><AlertCircle size={22} /><div className="empty-title">Nenhum item encontrado</div><p className="empty-copy">Altere o filtro ou o termo pesquisado.</p></div>}
        </section>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, color: "var(--muted)", fontSize: 10, lineHeight: 1.6 }}>
          <ShieldQuestion size={15} style={{ flex: "0 0 auto" }} />
          Nesta primeira versão, as alterações ficam apenas nesta tela e não são salvas em banco de dados. A persistência será adicionada junto ao cadastro de empresas e leads. A falta de informação não significa que a empresa não tenha a solução.
        </div>
      </div>
    </AppShell>
  );
}

function Summary({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="panel" style={{ padding: 14 }}><div style={{ color: "var(--muted)", fontSize: 10 }}>{label}</div><div style={{ color, fontSize: 25, fontWeight: 750, marginTop: 8 }}>{value}</div></div>;
}

const labelStyle = { display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 };
const fieldStyle = { width: "100%", minHeight: 40, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", outline: "none", fontSize: 11 };
