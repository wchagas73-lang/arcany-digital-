import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ArrowUpRight, Building2, ContactRound, Search, Sparkles, Target, Workflow } from "lucide-react";

const stats = [
  { label: "Empresas encontradas", value: "0", note: "Aguardando conexão com fontes de dados", icon: Building2 },
  { label: "Leads cadastrados", value: "0", note: "Seus contatos ficarão organizados aqui", icon: Target },
  { label: "Oportunidades", value: "0", note: "Acompanhe suas negociações no CRM", icon: Workflow },
  { label: "Demonstrações criadas", value: "0", note: "Sites personalizados para apresentar", icon: Sparkles }
];

const modules = [
  { title: "Prospecção inteligente", detail: "Encontre negócios por cidade e segmento.", icon: Search, tag: "Próxima etapa" },
  { title: "Análise de presença digital", detail: "Identifique sites, avaliações e canais online.", icon: ActivityIcon, tag: "Planejado" },
  { title: "CRM comercial", detail: "Organize contatos, etapas e acompanhamentos.", icon: ContactRound, tag: "Estrutura inicial" }
];

function ActivityIcon({ size = 17 }: { size?: number }) {
  return <ArrowUpRight size={size} />;
}

export default function DashboardPage() {
  return <AppShell><div className="content">
    <div className="eyebrow">Seu centro de inteligência comercial</div>
    <h1 className="page-title">Visão geral</h1>
    <p className="page-description">Bem-vindo à Arcany Digital. Aqui será o ponto de partida para encontrar empresas, descobrir oportunidades e transformar prospecção em novos negócios.</p>
    <div className="stat-grid">
      {stats.map((stat) => { const Icon = stat.icon; return <div className="panel stat-card" key={stat.label}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span className="stat-label">{stat.label}</span><Icon size={17} color="#a99fff" /></div>
        <div className="stat-value">{stat.value}</div><div className="stat-note">{stat.note}</div>
      </div>; })}
    </div>
    <div className="section-grid">
      <section className="panel">
        <div className="panel-heading"><div><div className="panel-title">Comece por aqui</div><div className="panel-subtitle">Acesse os principais módulos da plataforma</div></div><span style={{ color: "#8e82f3", fontSize: 10 }}>ARCANY</span></div>
        <div className="feature-list">
          {modules.map((module) => { const Icon = module.icon; return <div className="feature-row" key={module.title}>
            <div className="feature-icon"><Icon size={16} /></div><div><div className="feature-name">{module.title}</div><div className="feature-detail">{module.detail}</div></div><span className="coming-tag">{module.tag}</span>
          </div>; })}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><div className="panel-title">Próximo passo</div><div className="panel-subtitle">Vamos preparar sua primeira prospecção</div></div><Sparkles size={17} color="#a99fff" /></div>
        <div className="empty-state">
          <div className="empty-icon"><Search size={19} /></div>
          <div className="empty-title">Sua operação começa aqui</div>
          <p className="empty-copy">Escolha uma cidade e um segmento para iniciar a busca quando conectarmos as fontes de dados.</p>
          <Link className="action-button" href="/prospeccao" style={{ marginTop: 17 }}>Conhecer prospecção <ArrowUpRight size={14} /></Link>
        </div>
      </section>
    </div>
    <div className="panel page-card" style={{ marginTop: 16 }}>
      <h2>Uma plataforma, várias oportunidades</h2>
      <p>A Arcany está sendo construída para atender diferentes nichos de mercado — do comércio local aos prestadores de serviços. Nesta versão inicial, a navegação e a identidade visual estão prontas; os dados reais entrarão com as integrações das próximas fases.</p>
    </div>
  </div></AppShell>;
}
