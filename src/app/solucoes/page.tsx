"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Globe, ShoppingCart, Package, Users, Wallet, BarChart3, MessageCircle, FileText, Copy, Sparkles, MapPin, Instagram, Plus, Minus, Trash2 } from "lucide-react";

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

type StoreProduct = { id: number; name: string; description: string; price: number; image: string };

const initialProducts: StoreProduct[] = [
  { id: 1, name: "Produto em destaque", description: "Adicione uma descrição curta e atrativa.", price: 39.90, image: "" },
  { id: 2, name: "Mais vendido", description: "Mostre aqui o que seus clientes mais procuram.", price: 24.90, image: "" },
  { id: 3, name: "Novidade da loja", description: "Destaque lançamentos e ofertas especiais.", price: 19.90, image: "" },
];

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function SolucoesPage() {
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("");
  const [selected, setSelected] = useState("ecommerce");
  const [objective, setObjective] = useState("");
  const [extra, setExtra] = useState("");
  const [tagline, setTagline] = useState("Qualidade, confiança e atendimento de verdade.");
  const [whatsapp, setWhatsapp] = useState("");
  const [primary, setPrimary] = useState("#6d5dfc");
  const [copied, setCopied] = useState(false);
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyName = params.get("empresa");
    const companySegment = params.get("segmento");
    const focus = params.get("foco");
    if (companyName) setCompany(companyName);
    if (companySegment) setSegment(companySegment);
    if (focus) {
      const solutionByFocus: Record<string, string> = {
        site: "site",
        cardapio: "catalogo",
        ecommerce: "ecommerce",
        estoque: "estoque",
        crm: "crm",
        financeiro: "financeiro",
        google: "site",
      };
      if (solutionByFocus[focus]) setSelected(solutionByFocus[focus]);
      setObjective("Projeto sugerido a partir da prospecção da Arcany. Validar as necessidades diretamente com o responsável pela empresa.");
    }
  }, []);

  const solution = solutions.find((item) => item.id === selected) ?? solutions[0];
  const canPreview = ["site", "ecommerce", "catalogo"].includes(selected);
  const brief = useMemo(() => [
    "BRIEFING DE PROJETO — ARCANY DIGITAL",
    "Empresa: " + (company.trim() || "A definir"),
    "Segmento: " + (segment.trim() || "A definir"),
    "Solução: " + solution.title,
    "Slogan: " + (tagline.trim() || "A definir"),
    "WhatsApp: " + (whatsapp.trim() || "A definir"),
    "Objetivo: " + (objective.trim() || "A definir em conversa com o cliente"),
    "Funcionalidades desejadas:",
    ...solution.includes.map((item) => "- " + item),
    "Observações: " + (extra.trim() || "Nenhuma observação informada"),
    "",
    "A prévia visual é um modelo inicial. Antes de publicar, validar conteúdo, identidade visual, produtos, regras, integrações, hospedagem e acessos com o cliente."
  ].join("\n"), [company, segment, solution, tagline, whatsapp, objective, extra]);

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const whatsappDigits = whatsapp.replace(/\D/g, "");
  const whatsappUrl = whatsappDigits ? "https://wa.me/" + (whatsappDigits.startsWith("55") ? whatsappDigits : "55" + whatsappDigits) : "";
  const cartItems = products.filter((product) => (cart[product.id] || 0) > 0);
  const cartTotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  function addProduct() {
    const price = Number(newProductPrice.replace(",", "."));
    if (!newProductName.trim() || !Number.isFinite(price) || price <= 0) return;
    setProducts((items) => [...items, { id: Date.now(), name: newProductName.trim(), description: newProductDescription.trim(), price, image: newProductImage.trim() }]);
    setNewProductName("");
    setNewProductDescription("");
    setNewProductPrice("");
    setNewProductImage("");
  }

  function changeQuantity(id: number, change: number) {
    setCart((current) => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + change) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  const orderMessage = [
    "Olá! Gostaria de fazer um pedido para " + (company.trim() || "a loja") + ":",
    ...cartItems.map((product) => (cart[product.id] + "x " + product.name + " — " + money(product.price * cart[product.id]))),
    "Total: " + money(cartTotal),
  ].join("\\n");
  const orderUrl = whatsappUrl ? whatsappUrl + "?text=" + encodeURIComponent(orderMessage) : "";

  return (
    <AppShell>
      <div className="content">
        <div className="eyebrow">Produção digital</div>
        <h1 className="page-title">Central de soluções</h1>
        <p className="page-description">Prepare o projeto e veja uma prévia visual personalizada enquanto preenche os dados do cliente.</p>

        <section className="panel" style={{ marginTop: 22, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div className="empty-icon" style={{ margin: 0 }}><Sparkles size={17} /></div>
            <div><h2 style={{ fontSize: 14, margin: 0 }}>Escolha a solução</h2><p style={{ color: "var(--muted)", fontSize: 11, margin: "4px 0 0" }}>Você pode preparar soluções para qualquer segmento.</p></div>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 14, marginTop: 14, alignItems: "start" }}>
          <section className="panel" style={{ padding: 18 }}>
            <div className="panel-title">Dados do cliente</div>
            <div className="panel-subtitle" style={{ marginTop: 5 }}>As informações alteram a prévia ao lado.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 16 }}>
              <label style={labelStyle}>Nome da empresa<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex.: Panda Hortifruti" style={fieldStyle} /></label>
              <label style={labelStyle}>Segmento<input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex.: hortifruti, clínica, oficina..." style={fieldStyle} /></label>
              <label style={labelStyle}>Slogan ou frase principal<input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Uma frase que represente a empresa" style={fieldStyle} /></label>
              <label style={labelStyle}>WhatsApp com DDD<input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex.: 32999999999" style={fieldStyle} /></label>
              <label style={labelStyle}>Cor principal<div style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} style={{ width: 48, height: 38, padding: 3, border: "1px solid var(--border)", borderRadius: 8, background: "#0c121d" }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>{primary.toUpperCase()}</span></div></label>
              <label style={labelStyle}>Objetivo do cliente<textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex.: receber pedidos online, apresentar serviços..." rows={3} style={areaStyle} /></label>
              <label style={labelStyle}>Detalhes e necessidades específicas<textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Produtos, serviços, endereço, diferenciais e integrações..." rows={3} style={areaStyle} /></label>
            </div>
            {selected === "ecommerce" || selected === "catalogo" ? (
              <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Cadastro de produtos</div>
                <div style={{ display: "grid", gap: 9 }}>
                  <label style={labelStyle}>Nome do produto<input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Ex.: Cesta de frutas" style={fieldStyle} /></label>
                  <label style={labelStyle}>Descrição<input value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} placeholder="Detalhes do produto" style={fieldStyle} /></label>
                  <label style={labelStyle}>Preço (R$)<input value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} inputMode="decimal" placeholder="29,90" style={fieldStyle} /></label>
                  <label style={labelStyle}>Link da foto do produto (opcional)<input value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} placeholder="https://..." style={fieldStyle} /></label>
                  <button type="button" className="action-button" onClick={addProduct}><Plus size={14} /> Adicionar produto</button>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5, margin: "9px 0 0" }}>Nesta primeira versão, a foto é adicionada por um link público. O envio de arquivos de imagem será uma melhoria posterior.</p>
              </div>
            ) : null}
            <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "rgba(255,255,255,.02)" }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{solution.title} — escopo inicial</div>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#b8c3d3", fontSize: 11, lineHeight: 1.9 }}>{solution.includes.map((item) => <li key={item}>{item}</li>)}</ul>
              <button className="action-button" onClick={copyBrief} style={{ marginTop: 14 }}><Copy size={14} /> {copied ? "Briefing copiado" : "Copiar briefing do projeto"}</button>
            </div>
          </section>

          <section className="panel" style={{ padding: 14, position: "sticky", top: 82 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "3px 3px 12px" }}>
              <div><div className="panel-title">Prévia do projeto</div><div className="panel-subtitle" style={{ marginTop: 4 }}>Atualiza automaticamente</div></div>
              <span style={{ fontSize: 9, color: "#c9c1ff", background: "rgba(149,134,255,.12)", border: "1px solid rgba(149,134,255,.25)", padding: "5px 8px", borderRadius: 20 }}>MODELO</span>
            </div>
            {canPreview ? (
              <div style={{ borderRadius: 12, overflow: "hidden", background: "#f7f8fa", color: "#172033", border: "1px solid #dce1e8" }}>
                <div style={{ padding: "11px 14px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e9edf2" }}>
                  <strong style={{ fontSize: 13, color: primary }}>{company.trim() || "NOME DA EMPRESA"}</strong>
                  <span style={{ fontSize: 9, color: "#667085" }}>Início　 Produtos　 Contato</span>
                </div>
                <div style={{ padding: "26px 18px", background: "linear-gradient(135deg, #eef0ff, #ffffff)" }}>
                  <div style={{ display: "inline-block", padding: "4px 8px", borderRadius: 20, background: primary + "18", color: primary, fontSize: 9, fontWeight: 700, marginBottom: 10 }}>{segment.trim() || "SEU SEGMENTO"}</div>
                  <h3 style={{ fontSize: 23, lineHeight: 1.15, margin: "0 0 9px", color: "#172033" }}>{company.trim() || "Sua empresa em destaque"}</h3>
                  <p style={{ fontSize: 11, lineHeight: 1.6, color: "#586174", margin: "0 0 15px" }}>{tagline || "Uma frase que apresenta o negócio e convida o cliente."}</p>
                  {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: primary, color: "#fff", borderRadius: 7, padding: "9px 12px", textDecoration: "none", fontSize: 10, fontWeight: 700 }}><MessageCircle size={13} /> Fale pelo WhatsApp</a> : <span style={{ display: "inline-block", background: primary, color: "#fff", borderRadius: 7, padding: "9px 12px", fontSize: 10, fontWeight: 700 }}>Conheça nossos produtos</span>}
                </div>
                <div style={{ padding: "16px 14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><strong style={{ fontSize: 13 }}>{selected === "site" ? "Conheça a empresa" : "Destaques da loja"}</strong><span style={{ fontSize: 9, color: "#7a8495" }}>Prévia ilustrativa</span></div>
                  {selected === "site" ? <div style={{ background: "#fff", padding: 14, borderRadius: 9, border: "1px solid #e7eaf0" }}><p style={{ fontSize: 11, color: "#586174", lineHeight: 1.7, margin: 0 }}>{objective || "Aqui entra uma apresentação clara da empresa, seus serviços, diferenciais e formas de atendimento."}</p><div style={{ display: "flex", gap: 12, marginTop: 13, color: "#667085", fontSize: 9 }}><span><MapPin size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Localização</span><span><Instagram size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Redes sociais</span></div></div> :
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 9 }}>{products.map((product) => <div key={product.id} style={{ background: "#fff", border: "1px solid #e7eaf0", borderRadius: 9, padding: 10 }}><div style={{ height: 76, display: "grid", placeItems: "center", overflow: "hidden", background: "#f0f2f7", borderRadius: 6, color: primary, fontSize: 24 }}>{product.image ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "✦"}</div><strong style={{ display: "block", fontSize: 10, marginTop: 8 }}>{product.name}</strong><p style={{ fontSize: 9, color: "#778195", lineHeight: 1.4, minHeight: 25, margin: "4px 0" }}>{product.description || "Consulte mais informações."}</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}><strong style={{ fontSize: 11 }}>{money(product.price)}</strong><button type="button" onClick={() => changeQuantity(product.id, 1)} style={{ background: primary, color: "#fff", border: 0, borderRadius: 5, padding: "5px 7px", fontSize: 9, cursor: "pointer" }}>Adicionar</button></div></div>)}</div>}
                </div>
                <div style={{ padding: 11, textAlign: "center", background: "#fff", color: "#929aaa", fontSize: 8, borderTop: "1px solid #e9edf2" }}>Prévia de apresentação · Conteúdo demonstrativo</div>
              </div>
            ) : (
              <div style={{ padding: 22, borderRadius: 10, background: "#101827", border: "1px solid var(--border)", textAlign: "center" }}>
                <div className="empty-icon" style={{ margin: "0 auto 12px" }}><solution.icon size={19} /></div>
                <strong style={{ fontSize: 13 }}>{solution.title}</strong>
                <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>{solution.description}</p>
                <p style={{ color: "#b8c3d3", fontSize: 10 }}>O próximo passo será criar uma tela funcional para esta solução.</p>
              </div>
            )}
            {(selected === "ecommerce" || selected === "catalogo") ? (
              <div style={{ marginTop: 12, padding: 13, border: "1px solid var(--border)", borderRadius: 10, background: "#101827" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong style={{ fontSize: 12 }}>Carrinho de demonstração</strong><span style={{ fontSize: 10, color: "var(--muted)" }}>{cartItems.reduce((n, p) => n + cart[p.id], 0)} item(ns)</span></div>
                {cartItems.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 10, margin: "9px 0 0" }}>Adicione produtos na prévia para montar um pedido de teste.</p> : <div style={{ display: "grid", gap: 8, marginTop: 10 }}>{cartItems.map((product) => <div key={product.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 10 }}><span style={{ flex: 1 }}>{product.name}<br /><span style={{ color: "var(--muted)" }}>{money(product.price * cart[product.id])}</span></span><div style={{ display: "flex", alignItems: "center", gap: 7 }}><button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label="Diminuir quantidade" style={qtyButton}><Minus size={12} /></button><strong>{cart[product.id]}</strong><button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label="Aumentar quantidade" style={qtyButton}><Plus size={12} /></button></div></div>)}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 10, fontSize: 12 }}><strong>Total</strong><strong>{money(cartTotal)}</strong></div>
                {orderUrl ? <a href={orderUrl} target="_blank" rel="noreferrer" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 10, background: "#16834a", color: "#fff", borderRadius: 8, padding: 10, textDecoration: "none", fontSize: 10, fontWeight: 700, pointerEvents: cartItems.length ? "auto" : "none", opacity: cartItems.length ? 1 : .45 }}><MessageCircle size={13} /> Enviar pedido de teste pelo WhatsApp</a> : <p style={{ color: "var(--muted)", fontSize: 9, margin: "9px 0 0" }}>Informe o WhatsApp do cliente para habilitar o envio do pedido de teste.</p>}
              </div>
            ) : null}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 12, color: "var(--muted)", fontSize: 10, lineHeight: 1.6 }}><Sparkles size={13} color="#a99fff" style={{ flex: "0 0 auto" }} /> Esta é uma prévia visual com dados de exemplo. Ela ainda não cria uma loja publicada, não salva clientes em banco de dados e não processa pagamentos.</div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

const labelStyle = { display: "grid", gap: 7, color: "#aeb9ca", fontSize: 11 };
const fieldStyle = { width: "100%", minHeight: 40, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 11px", outline: "none", fontSize: 11 };
const areaStyle = { ...fieldStyle, padding: "10px 11px", resize: "vertical" as const, lineHeight: 1.5 };
const qtyButton = { width: 25, height: 25, display: "grid", placeItems: "center", border: "1px solid var(--border)", borderRadius: 6, background: "#202b3d", color: "#fff", cursor: "pointer" as const };
