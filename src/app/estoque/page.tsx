"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PackagePlus, RefreshCw, Search, AlertTriangle } from "lucide-react";

type Product = { id: string; name: string; sku: string | null; category: string | null; unit: string; sale_price: number; min_stock: number };
type Movement = { product_id: string; movement_type: string; quantity: number };
type Row = Product & { balance: number };
const field: React.CSSProperties = { width: "100%", minHeight: 40, border: "1px solid var(--border)", borderRadius: 9, background: "#0c121d", color: "#f3f6fb", padding: "0 10px", fontSize: 12 };

export default function StockPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("un");
  const [price, setPrice] = useState("0");
  const [minimum, setMinimum] = useState("0");
  const [quantity, setQuantity] = useState("0");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [configured, setConfigured] = useState(true);

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setConfigured(false); return; }
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) { setMessage("Entre na sua conta para acessar o estoque."); return; }
    const { data: membership, error: memberError } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).limit(1).maybeSingle();
    if (memberError) { setMessage(memberError.message); return; }
    if (!membership) { setMessage("Sua conta ainda não está vinculada a uma organização. Acesse Conta para concluir o cadastro."); return; }
    const { data: products, error: productError } = await supabase.from("products").select("id,name,sku,category,unit,sale_price,min_stock").eq("organization_id", membership.organization_id).eq("active", true).order("name");
    if (productError) { setMessage(productError.message); return; }
    const { data: movements, error: movementError } = await supabase.from("stock_movements").select("product_id,movement_type,quantity").eq("organization_id", membership.organization_id);
    if (movementError) { setMessage(movementError.message); return; }
    const totals = new Map<string, number>();
    (movements as Movement[] || []).forEach(m => totals.set(m.product_id, (totals.get(m.product_id) || 0) + (["entrada","devolucao"].includes(m.movement_type) ? Number(m.quantity) : -Number(m.quantity))));
    setRows(((products || []) as Product[]).map(p => ({ ...p, balance: totals.get(p.id) || 0 })));
    setMessage("");
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addProduct(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Faça login antes de cadastrar produtos.");
      const { data: membership, error: memberError } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).limit(1).maybeSingle();
      if (memberError) throw memberError;
      if (!membership) throw new Error("Organização não encontrada. Entre novamente na plataforma.");
      const { data: product, error } = await supabase.from("products").insert({ organization_id: membership.organization_id, name: name.trim(), sku: sku.trim() || null, category: category.trim() || null, unit, sale_price: Number(price) || 0, min_stock: Number(minimum) || 0 }).select("id").single();
      if (error) throw error;
      const initial = Number(quantity);
      if (initial > 0) {
        const { error: movementError } = await supabase.from("stock_movements").insert({ organization_id: membership.organization_id, product_id: product.id, movement_type: "entrada", quantity: initial, notes: "Estoque inicial" });
        if (movementError) throw movementError;
      }
      setName(""); setSku(""); setCategory(""); setPrice("0"); setMinimum("0"); setQuantity("0");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao salvar produto."); }
    finally { setBusy(false); }
  }

  const visible = rows.filter(r => [r.name, r.sku || "", r.category || ""].join(" ").toLowerCase().includes(query.toLowerCase()));
  const low = rows.filter(r => r.balance <= Number(r.min_stock));
  return <AppShell><div className="content">
    <div className="eyebrow">Operação dos clientes</div><h1 className="page-title">Controle de estoque</h1>
    <p className="page-description">Cadastro de produtos e saldo calculado pelas movimentações gravadas no Supabase da organização.</p>
    {!configured && <div className="panel" style={{ padding: 16, marginTop: 16 }}>O Supabase ainda não está configurado. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel para ativar este módulo.</div>}
    <div className="stat-grid" style={{ marginTop: 18 }}>
      {[{ label: "Produtos cadastrados", value: rows.length }, { label: "Itens com estoque baixo", value: low.length }, { label: "Unidades em estoque", value: rows.reduce((sum, r) => sum + r.balance, 0).toLocaleString("pt-BR") }].map(x => <div className="panel stat-card" key={x.label}><div className="stat-label">{x.label}</div><div className="stat-value">{x.value}</div></div>)}
    </div>
    <section className="panel" style={{ marginTop: 16, padding: 16 }}>
      <div className="panel-heading"><div><div className="panel-title">Cadastrar produto</div><div className="panel-subtitle">O registro é salvo no banco da organização.</div></div></div>
      <form onSubmit={addProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10, marginTop: 14 }}>
        <input required placeholder="Nome do produto *" value={name} onChange={e => setName(e.target.value)} style={field}/>
        <input placeholder="Código / SKU" value={sku} onChange={e => setSku(e.target.value)} style={field}/>
        <input placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} style={field}/>
        <select value={unit} onChange={e => setUnit(e.target.value)} style={field}><option value="un">Unidade</option><option value="kg">Quilograma</option><option value="g">Grama</option><option value="l">Litro</option><option value="cx">Caixa</option><option value="pct">Pacote</option></select>
        <input type="number" min="0" step="0.01" placeholder="Preço de venda" value={price} onChange={e => setPrice(e.target.value)} style={field}/>
        <input type="number" min="0" step="0.001" placeholder="Estoque mínimo" value={minimum} onChange={e => setMinimum(e.target.value)} style={field}/>
        <input type="number" min="0" step="0.001" placeholder="Saldo inicial" value={quantity} onChange={e => setQuantity(e.target.value)} style={field}/>
        <button disabled={busy || !configured} className="action-button" style={{ justifyContent: "center" }}><PackagePlus size={15}/>{busy ? "Salvando..." : "Salvar produto"}</button>
      </form>
      {message && <p role="status" style={{ color: "#f1c879", fontSize: 12, marginTop: 12 }}>{message}</p>}
    </section>
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-heading" style={{ flexWrap: "wrap" }}><div><div className="panel-title">Produtos</div><div className="panel-subtitle">{visible.length} registro(s)</div></div><button type="button" className="action-button" onClick={() => void load()}><RefreshCw size={14}/> Atualizar</button></div>
      <div style={{ padding: "0 16px 14px" }}><label style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--border)", borderRadius: 9, padding: "0 10px", maxWidth: 380, minHeight: 38 }}><Search size={14}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar produto..." style={{ background: "transparent", border: 0, outline: 0, color: "white", width: "100%", fontSize: 12 }}/></label></div>
      {visible.length === 0 ? <div className="empty-state">Nenhum produto cadastrado ainda.</div> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}><thead><tr>{["Produto","SKU","Categoria","Saldo","Mínimo","Preço"].map(h => <th key={h} style={{ textAlign: "left", padding: 12, color: "#9aa8bc", borderTop: "1px solid var(--border)" }}>{h}</th>)}</tr></thead><tbody>{visible.map(p => <tr key={p.id}><td style={cell}>{p.name}</td><td style={cell}>{p.sku || "—"}</td><td style={cell}>{p.category || "—"}</td><td style={cell}><strong>{p.balance} {p.unit}</strong>{p.balance <= Number(p.min_stock) && <AlertTriangle size={13} color="#eab85c" style={{ marginLeft: 6, verticalAlign: "middle" }}/>}</td><td style={cell}>{p.min_stock}</td><td style={cell}>{Number(p.sale_price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td></tr>)}</tbody></table></div>}
    </section>
  </div></AppShell>;
}
const cell: React.CSSProperties = { padding: 12, borderTop: "1px solid var(--border)", color: "#dbe3ef", whiteSpace: "nowrap" };
