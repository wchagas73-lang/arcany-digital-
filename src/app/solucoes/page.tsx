"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Globe, ShoppingCart, Package, Users, Wallet, BarChart3, MessageCircle, FileText, Copy, Check, Sparkles } from "lucide-react";

const solutions = [
  { id: "site", title: "Site profissional", description: "Apresentação da empresa, serviços, localização e contato.", icon: Globe, includes: ["Página inicial personalizada", "Sobre a empresa e serviços", "Galeria de fotos", "Localização e contato pelo WhatsApp"] },
  { id: "ecommerce", title: "E-commerce / loja virtual", description: "Venda online com catálogo, carrinho e acompanhamento de pedidos.", icon: ShoppingCart, includes: ["Vitrine de produtos e categorias", "Carrinho e finalização de pedido", "Integração de pagamento a definir", "Painel de pedidos e status"] },
  { id: "estoque", title: "Controle de estoque", description: "Acompanhe produtos, entradas, saídas e níveis mínimos.", icon: Package, includes: ["Cadastro de produtos e fornecedores", "Entradas, saídas e ajustes", "Alertas de estoque mínimo", "Relatórios de movimentação"] },
  { id: "crm", title: "CRM e cadastro de clientes", description: "Organize contatos, histórico, oportunidades e relacionamento.", icon: Users, includes: ["Cadastro de clientes", "Histórico de contatos e compras", "Etapas de atendimento e vendas", "Tarefas e lembretes"] },
  { id: "financeiro", title: "Gestão financeira", description: "Tenha visão de receitas, despesas, contas e fluxo de caixa.", icon: Wallet, includes: ["Lançamentos de receitas e despesas", "Contas a pagar e receber", "Fluxo de caixa", "Relatórios por período"] },
  { id: "dashboard", title: "Dashboard gerencial", description: "Indicadores para acompanhar resultados e tomar decisões.", icon: BarChart3, includes: ["Indicadores principais", "Gráficos de vendas e desempenho", "Filtros por período", "Relatórios gerenciais"] },
  { id: "whatsapp", title: "Automação de WhatsApp", description: "Organize atendimento, perguntas frequentes e encaminhamento de pedidos.", icon: MessageCircle, includes: ["Fluxos de atendimento", "Respostas para perguntas frequentes", "Coleta de dados do pedido", "Integração oficial a definir"] },
  { id: "catalogo", title: "Catálogo ou cardápio digital", description: "Mostre produtos e serviços com informações claras e contato rápido.", icon: FileText, includes: ["Categorias e itens", "Fotos, descrições e preços", "Link compartilhável", "Pedido ou contato pelo WhatsApp"] },
];

export default function SolucoesPage() {
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("");
  const [selected, setSelected] = useState("ecommerce");
  const [objective, setObjective] = useState("");
  const [extra, setExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const solution = solutions.find((item) => item.id === selected) ?? solutions[0];
  const brief = useMemo(() => [
    "BRIEFING DE PROJETO — ARCANY DIGITAL",
    "Empresa: " + (company.trim() || "A definir"),
    "Segmento: " + (segment.trim() || "A definir"),
    "Solução: " + solution.title,
    "Objetivo: " + (objective.trim() || "A definir em conversa com o cliente"),
    "Funcionalidades desejadas:",
    ...solution.includes.map((item) => "- " + item),
    "Observações: " + (extra.trim() || "Nenhuma observação informada"),
    "",
    "Antes de desenvolver: validar identidade visual, dados, regras do negócio, integrações, hospedagem e acessos com o cliente."
  ].join("\n"), [company, segment, solution, objective, extra]);

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <AppShell>
      <div className="content">
        <div className="eyebrow">Produção digital</div>
        <h1 className="page-title">Central de soluções</h1>
        <p className="page-description">Escolha o que deseja oferecer, prepare o escopo e organize o projeto de cada cliente em um só lugar.</p>

        <section className="panel" style={{ marginTop: 22, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div className="empty-icon" style={{ margin: 0 }}><Sparkles size={17} /></div>
            <div><h2 style={{ fontSize: 14, margin: 0 }}>O que você pode preparar</h2><p style={{ color: "var(--muted)", fontSize: 11, margin: "4px 0 0" }}>Modelos iniciais de soluções para diferentes segmentos.</p></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            {solutions.map((item) => {
              const Icon = item.icon;
              const active = selected === item.id;
              return <button key={item.id} type="button" onClick={() => setSelected(item.id)} style={{ textAlign: "left", cursor: "pointer", border: active ? "1px solid #9586ff" : "1px solid var(--border)", background: active ? "rgba(149,134,255,.10)" : "rgba(255,255,255,.015)", borderRadius: 11, padding: 13, color: "#f3f6fb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon size={16} color={active ? "#b8adff" : "#aeb9ca"} /><strong style={{ fontSize: 12 }}>{item.title}</strong></div>
                <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5, margin: "8px 0 0" }}>{item.description}</p>
              </button>;
            })}
          </div>
        </section>

        <section className="panel" style={{ marginTop: 14, padding: 18 }}>
          <div className="panel-title">Preparar projeto</div>
          <div className="panel-subtitle" style={{ marginTop: 5 }}>Preencha o básico para montar um briefing que poderá orientar o desenvolvimento.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginTop: 16 }}>
            <label style={labelStyle}>Nome da empresa<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nome do estabelecimento" style={fieldStyle} /></label>
            <label style={labelStyle}>Segmento<input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex.: loja de roupas, clínica..." style={fieldStyle} /></label>
          </div>
          <label style={{ ...labelStyle, marginTop: 12 }}>Objetivo do cliente<textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex.: vender pela internet todos os dias, organizar pedidos..." rows={3} style={areaStyle} /></label>
          <label style={{ ...labelStyle, marginTop: 12 }}>Detalhes e necessidades específicas<textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Identidade visual, integrações, regras, preferências e informações confirmadas..." rows={3} style={areaStyle} /></label>
          <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "rgba(255,255,255,.02)" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{solution.title} — escopo inicial</div>
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#b8c3d3", fontSize: 11, lineHeight: 1.9 }}>{solution.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            <button className="action-button" onClick={copyBrief} style={{ marginTop: 14 }}><Copy size={14} /> {copied ? "Briefing copiado" : "Copiar briefing do projeto"}</button>
          </div>
        </section>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 14, color: "var(--muted)", fontSize: 10, lineHeight: 1.6 }}>
          <Sparkles size={14} color="#a99fff" style={{ flex: "0 0 auto" }} />
          Esta é a primeira etapa da fábrica de soluções: ela organiza o escopo e gera um briefing. A criação automática dos sites, lojas virtuais e sistemas, além de banco de dados, pagamentos e publicação, ainda será implementada e testada.
        </div>
      </div>
    </AppShell>
  );
}

const labelStyle = { display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 };
const fieldStyle = { width: "100%", minHeight: 40, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", outline: "none", fontSize: 11 };
const areaStyle = { ...fieldStyle, padding: "10px 11px", resize: "vertical" as const, lineHeight: 1.5 };
