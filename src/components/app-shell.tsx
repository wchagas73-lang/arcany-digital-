"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Building2, ContactRound, LayoutDashboard, Search, Settings2,
  Sparkles, Target, Workflow
} from "lucide-react";

const navigation = [
  { label: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Prospecção", href: "/prospeccao", icon: Search },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "CRM", href: "/crm", icon: Workflow },
  { label: "Demonstrações", href: "/demonstracoes", icon: Sparkles },
  { label: "Configurações", href: "/configuracoes", icon: Settings2 }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
            <p>As integrações serão ativadas por etapas. A estrutura já está sendo preparada para crescer com seu negócio.</p>
          </div>
          <div style={{ color: "#667286", fontSize: 10, padding: "16px 10px 0" }}>ARCANY DIGITAL · VERSÃO 0.1</div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="crumb">Workspace <span style={{ color: "#566176" }}>/</span> <span style={{ color: "#d8deea" }}>Arcany Digital</span></div>
          <div className="top-actions"><div className="status-pill"><span className="status-dot" /> Ambiente inicial</div><div className="avatar">AD</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}
