import { AppShell } from "@/components/app-shell";
import { ArrowRight, Construction } from "lucide-react";

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  purpose: string;
  nextStep: string;
};

export function ModulePage({ eyebrow, title, description, purpose, nextStep }: ModulePageProps) {
  return <AppShell><div className="content">
    <div className="eyebrow">{eyebrow}</div>
    <h1 className="page-title">{title}</h1>
    <p className="page-description">{description}</p>
    <section className="panel page-card">
      <div className="empty-icon" style={{ margin: "0 0 16px" }}><Construction size={19} /></div>
      <h2>Módulo em construção</h2>
      <p>{purpose}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 19, color: "#b9b0ff", fontSize: 12 }}>
        <ArrowRight size={15} /> Próxima etapa: {nextStep}
      </div>
    </section>
  </div></AppShell>;
}
