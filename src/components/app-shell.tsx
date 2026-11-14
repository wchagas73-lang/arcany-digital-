"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Activity, Building2, LayoutDashboard, Search, Settings2, Globe,
  Sparkles, Target, Workflow, ClipboardCheck, Wrench, MessageSquareText, LogOut, Package, Wallet, ClipboardList
} from "lucide-react";

const navigation = [
  { label: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Prospecção", href: "/prospeccao", icon: Search },
  { label: "Central de vendas", href: "/vendas", icon: MessageSquareText },
  { label: "Diagnóstico", href: "/diagnostico", icon: ClipboardCheck },
  { label: "Central de soluções", href: "/solucoes", icon: Wrench },
  { label: "Biblioteca de modelos", href: "/modelos", icon: Sparkles },
  { label: "Criar projetos", href: "/projetos", icon: Globe },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "CRM", href: "/crm", icon: Workflow },
  { label: "Estoque", href: "/estoque", icon: Package },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { label: "Demonstrações", href: "/demonstracoes", icon: Sparkles },
  { label: "Configurações", href: "/configuracoes", icon: Settings2 }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch {
      setSigningOut(false);
      return;
    }
    router.replace("/acesso");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <div className="brand-mark">A</div>
          <div><div className="brand-name">ARCANY DIGITAL</div><div className="brand-sub">Inteligência comercial</div></div>
        </Link>
        <div>
          <div className="nav-label">PLATAFORMA</div>
          <nav className="nav-list">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
              return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
                <Icon size={16} strokeWidth={1.8} /><span>{item.label}</span>
              </Link>;
            })}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700 }}><Activity size={14} color="#a99fff" /> Central de evolução</div>
            <p>Plataforma em construção: integrações e módulos são liberados após validação.</p>
          </div>
          <div style={{ color: "#667286", fontSize: 10, padding: "16px 10px 0" }}>ARCANY DIGITAL · VERSÃO 0.2</div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="crumb">Workspace <span style={{ color: "#566176" }}>/</span> <span style={{ color: "#d8deea" }}>Arcany Digital</span></div>
          <div className="top-actions">
            <button type="button" className="nav-link" onClick={signOut} disabled={signingOut} aria-label="Sair da conta" title="Encerrar sessão">
              <LogOut size={14} />{signingOut ? "Saindo..." : "Sair"}
            </button>
            <div className="avatar">AD</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
