"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { getAccountScopedStorageKey } from "@/lib/supabase/account-storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LocalBackupButton } from "@/components/local-backup-button";
import { Plus, Search, Building2, MessageCircle, Globe, Pencil, Trash2, Target, CloudUpload } from "lucide-react";

type Company = { id: string; name: string; segment: string; city: string; phone: string; website: string; google: string; notes: string };
type Lead = { id: string; company: string; contact: string; phone: string; segment: string; interest: string; stage: "novo"; followUp: string; notes: string };
const COMPANY_KEY = "arcany-companies-v1";
const LEAD_KEY = "arcany-leads-v1";
const blank = { name: "", segment: "", city: "", phone: "", website: "", google: "a_investigar", notes: "" };

function normalizeCompanyKey(name: string, phone: string) {
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  const normalizedPhone = phone.replace(/\D/g, "");
  return normalizedName + "|" + normalizedPhone;
}

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ready, setReady] = useState(false);
  const [companyStorageKey, setCompanyStorageKey] = useState<string | null>(null);
  const [leadStorageKey, setLeadStorageKey] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [leadNames, setLeadNames] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAccountData() {
      const [companyKey, leadKey] = await Promise.all([
        getAccountScopedStorageKey(COMPANY_KEY),
        getAccountScopedStorageKey(LEAD_KEY),
      ]);
      if (!active) return;
      setCompanyStorageKey(companyKey);
      setLeadStorageKey(leadKey);
      try {
        if (companyKey) {
          const raw = localStorage.getItem(companyKey);
          if (raw) setCompanies(JSON.parse(raw) as Company[]);
        }
        if (leadKey) {
          const savedLeads = JSON.parse(localStorage.getItem(leadKey) || "[]") as Lead[];
          setLeadNames(savedLeads.map((lead) => lead.company.toLowerCase()));
        }
      } catch {
        // Mantém a tela utilizável se houver dados locais inválidos.
      }
      setReady(true);
    }
    void loadAccountData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (ready && companyStorageKey) {
      localStorage.setItem(companyStorageKey, JSON.stringify(companies));
    }
  }, [companies, ready, companyStorageKey]);

  const visible = useMemo(
    () => companies.filter((company) =>
      [company.name, company.segment, company.city, company.phone]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    ),
    [companies, query]
  );

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      setCompanies((all) => all.map((company) =>
        company.id === editing ? { ...company, ...form, name: form.name.trim() } : company
      ));
    } else {
      setCompanies((all) => [{
        ...form,
        name: form.name.trim(),
        id: String(Date.now()),
      }, ...all]);
    }
    setForm(blank);
    setEditing(null);
    setShow(false);
  }

  function edit(company: Company) {
    setForm({
      name: company.name,
      segment: company.segment,
      city: company.city,
      phone: company.phone,
      website: company.website,
      google: company.google,
      notes: company.notes,
    });
    setEditing(company.id);
    setShow(true);
  }

  function createLead(company: Company) {
    if (!leadStorageKey) {
      alert("Entre na sua conta para registrar este lead.");
      return;
    }
    let current: Lead[] = [];
    try {
      const raw = localStorage.getItem(leadStorageKey);
      if (raw) current = JSON.parse(raw) as Lead[];
    } catch {
      // Inicia carteira vazia quando o conteúdo local estiver inválido.
    }
    if (current.some((lead) => lead.company.toLowerCase() === company.name.toLowerCase())) {
      alert("Essa empresa já está cadastrada na carteira de leads.");
      return;
    }
    current.unshift({
      id: "lead-" + Date.now(),
      company: company.name,
      contact: "",
      phone: company.phone,
      segment: company.segment,
      interest: "A definir após diagnóstico",
      stage: "novo",
      followUp: "",
      notes: "Empresa adicionada a partir da base Arcany.",
    });
    localStorage.setItem(leadStorageKey, JSON.stringify(current));
    setLeadNames(current.map((lead) => lead.company.toLowerCase()));
    alert("Empresa adicionada à carteira de leads.");
  }

  async function syncCompanies() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSyncMessage("Configure as variáveis públicas do Supabase na Vercel para sincronizar.");
      return;
    }
    if (!companyStorageKey || !companies.length) {
      setSyncMessage("Não há empresas desta conta neste aparelho para sincronizar.");
      return;
    }

    setSyncing(true);
    setSyncMessage("");
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Entre na sua conta antes de sincronizar.");

      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (membershipError) throw membershipError;
      if (!membership) throw new Error("Organização não encontrada para esta conta.");

      const { data: existing, error: existingError } = await supabase
        .from("companies")
        .select("name,phone")
        .eq("organization_id", membership.organization_id);
      if (existingError) throw existingError;

      const known = new Set(
        (existing || []).map((company: { name: string; phone: string | null }) =>
          normalizeCompanyKey(company.name, company.phone || "")
        )
      );
      const pending = companies.filter((company) => {
        const key = normalizeCompanyKey(company.name, company.phone);
        if (known.has(key)) return false;
        known.add(key);
        return true;
      });

      if (!pending.length) {
        setSyncMessage("Todas as empresas desta conta já estão na nuvem. Nenhum registro local foi alterado.");
        return;
      }

      const payload = pending.map((company) => ({
        organization_id: membership.organization_id,
        name: company.name.trim(),
        segment: company.segment.trim() || null,
        city: company.city.trim() || null,
        phone: company.phone.trim() || null,
        website: company.website.trim() || null,
        google_status: company.google || "a_investigar",
        notes: company.notes.trim() || null,
        source: "base_local_arcany",
      }));

      const { error: insertError } = await supabase.from("companies").insert(payload);
      if (insertError) throw insertError;

      setSyncMessage(
        pending.length + " empresa(s) sincronizada(s). Os registros originais continuam salvos neste aparelho."
      );
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Não foi possível sincronizar as empresas.");
    } finally {
      setSyncing(false);
    }
  }

  const field = {
    width: "100%",
    minHeight: 40,
    border: "1px solid var(--border)",
    borderRadius: 9,
    background: "#0c121d",
    color: "#f3f6fb",
    padding: "0 11px",
    fontSize: 11,
  };
  const label = { display: "grid", gap: 6, color: "#aeb9ca", fontSize: 11 };

  return <AppShell><div className="content">
    <div className="eyebrow">Base de negócios</div>
    <h1 className="page-title">Empresas</h1>
    <p className="page-description">Organize os negócios encontrados na prospecção, registre informações verificadas e transforme empresas em oportunidades comerciais.</p>
    <div className="stat-grid" style={{ marginTop: 22 }}>
      {[
        { label: "Empresas cadastradas", value: companies.length },
        { label: "Com telefone", value: companies.filter((company) => company.phone.trim()).length },
        { label: "Com site informado", value: companies.filter((company) => company.website.trim()).length },
        { label: "Na carteira de leads", value: companies.filter((company) => leadNames.includes(company.name.toLowerCase())).length },
      ].map((stat) => <div className="panel stat-card" key={stat.label}>
        <div className="stat-label">{stat.label}</div>
        <div className="stat-value">{stat.value}</div>
      </div>)}
    </div>

    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-heading" style={{ flexWrap: "wrap" }}>
        <div>
          <div className="panel-title">Base de empresas</div>
          <div className="panel-subtitle">{ready ? companies.length + " registro(s) da conta neste aparelho" : "Carregando..."}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <LocalBackupButton />
          <button type="button" className="secondary-button" onClick={() => void syncCompanies()} disabled={!ready || syncing || !companies.length}>
            <CloudUpload size={13} /> {syncing ? "Sincronizando..." : "Sincronizar nuvem"}
          </button>
          <button type="button" className="action-button" onClick={() => { setForm(blank); setEditing(null); setShow((value) => !value); }}>
            <Plus size={14} /> Nova empresa
          </button>
        </div>
      </div>
      {syncMessage && <p role="status" aria-live="polite" style={{ padding: "0 16px 12px", color: "#e9c77b", fontSize: 11 }}>{syncMessage}</p>}

      {show && <form onSubmit={save} style={{ margin: 16, padding: 15, border: "1px solid rgba(139,124,255,.28)", borderRadius: 12, display: "grid", gap: 11 }}>
        <strong style={{ fontSize: 13 }}>{editing ? "Editar empresa" : "Cadastrar empresa"}</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          <label style={label}>Nome da empresa *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} style={field} placeholder="Nome comercial" /></label>
          <label style={label}>Segmento<input value={form.segment} onChange={(event) => setForm({ ...form, segment: event.target.value })} style={field} placeholder="Ex.: Academia, loja, clínica" /></label>
          <label style={label}>Cidade / UF<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} style={field} placeholder="Juiz de Fora - MG" /></label>
          <label style={label}>Telefone / WhatsApp<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} style={field} placeholder="(32) 99999-9999" /></label>
          <label style={label}>Site<input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} style={field} placeholder="https://..." /></label>
          <label style={label}>Presença no Google<select value={form.google} onChange={(event) => setForm({ ...form, google: event.target.value })} style={field}>
            <option value="a_investigar">A investigar</option>
            <option value="encontrada">Perfil encontrado</option>
            <option value="nao_localizada">Não localizada na pesquisa</option>
          </select></label>
        </div>
        <label style={label}>Observações<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} style={{ ...field, padding: 10 }} placeholder="Informações confirmadas, oportunidade percebida e próximos passos" /></label>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="action-button" type="submit">Salvar empresa</button>
          <button className="secondary-button" type="button" onClick={() => { setShow(false); setEditing(null); }}>Cancelar</button>
        </div>
      </form>}

      <div style={{ padding: "0 16px 14px" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--border)", borderRadius: 9, padding: "0 11px", maxWidth: 450, minHeight: 40, color: "var(--muted)" }}>
          <Search size={14} />
          <input aria-label="Buscar empresas" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, segmento ou cidade..." style={{ background: "transparent", border: 0, outline: 0, color: "white", width: "100%", fontSize: 11 }} />
        </label>
      </div>

      {visible.length ? <div style={{ display: "grid", gap: 9, padding: "0 16px 16px" }}>
        {visible.map((company) => <article key={company.id} style={{ border: "1px solid var(--border)", borderRadius: 11, padding: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 13 }}>{company.name}</strong>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "var(--muted)", fontSize: 10, marginTop: 7 }}>
                {company.segment && <span>{company.segment}</span>}
                {company.city && <span>{company.city}</span>}
                {company.phone && <span>{company.phone}</span>}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 7 }}>
                Google: {company.google === "encontrada" ? "Perfil encontrado" : company.google === "nao_localizada" ? "Não localizada na pesquisa" : "A investigar"}
              </div>
              {company.notes && <p style={{ fontSize: 11, color: "#aeb9ca", margin: "8px 0 0" }}>{company.notes}</p>}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap" }}>
              {company.phone && <a className="secondary-button" href={"https://wa.me/55" + company.phone.replace(/\D/g, "").replace(/^55/, "")} target="_blank" rel="noreferrer"><MessageCircle size={12} /> WhatsApp</a>}
              {company.website && <a className="secondary-button" href={/^https?:\/\//i.test(company.website) ? company.website : "https://" + company.website} target="_blank" rel="noreferrer"><Globe size={12} /> Site</a>}
              <button className="secondary-button" type="button" onClick={() => createLead(company)}><Target size={12} /> Virar lead</button>
              <button className="secondary-button" type="button" onClick={() => edit(company)} aria-label="Editar empresa"><Pencil size={12} /></button>
              <button className="secondary-button" type="button" onClick={() => {
                if (confirm("Excluir esta empresa da base local?")) {
                  setCompanies((all) => all.filter((item) => item.id !== company.id));
                }
              }} aria-label="Excluir empresa"><Trash2 size={12} /></button>
            </div>
          </div>
        </article>)}
      </div> : <div className="empty-state">
        <div className="empty-icon"><Building2 size={19} /></div>
        <div className="empty-title">{companies.length ? "Nenhuma empresa encontrada" : "Sua base de empresas está pronta para começar"}</div>
        <p className="empty-copy">{companies.length ? "Altere a busca para localizar um registro." : "Cadastre empresas manualmente ou salve oportunidades encontradas na prospecção."}</p>
      </div>}
    </section>
    <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, marginTop: 12 }}>
      Os registros permanecem salvos neste aparelho. A sincronização envia somente empresas ainda não encontradas na organização da conta, não substitui nem apaga registros locais e pode ser repetida com segurança.
    </p>
  </div></AppShell>;
}
