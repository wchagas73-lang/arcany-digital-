"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Instagram, MapPin, MessageCircle, Star } from "lucide-react";

type PageContent = {
  company?: string; tagline?: string; description?: string; city?: string; whatsapp?: string;
  instagram?: string; googleUrl?: string; ctaLabel?: string; primaryColor?: string;
  servicesText?: string; heroImage?: string; gallery?: string[];
};
type Publication = { slug: string; content: PageContent; published: boolean };

export default function PublicLandingPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      const db = getSupabaseBrowserClient();
      if (!db) { setLoading(false); return; }
      const { data, error } = await db.from("project_publications").select("slug,content,published").eq("slug", params.slug).eq("published", true).maybeSingle();
      if (active && !error && data) setPage(data as Publication);
      if (active) setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [params.slug]);

  if (loading) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial,sans-serif" }}>Carregando página...</main>;
  if (!page) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial,sans-serif" }}><div><h1>Página não encontrada</h1><p>Este endereço não existe ou ainda não foi publicado.</p></div></main>;

  const c = page.content || {};
  const color = c.primaryColor || "#6655d9";
  const digits = (c.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = digits ? "https://wa.me/" + (digits.startsWith("55") ? digits : "55" + digits) + "?text=" + encodeURIComponent("Olá! Encontrei a página de " + (c.company || "sua empresa") + " e gostaria de mais informações.") : "";
  const services = (c.servicesText || "").split("\n").map(item => item.trim()).filter(Boolean);
  const gallery = [...new Set([c.heroImage || "", ...(c.gallery || [])].filter(Boolean))];

  return <main style={{ minHeight: "100vh", background: "#f7f8fc", color: "#172033", fontFamily: "Arial,sans-serif" }}>
    <header style={{ background: color, color: "white", padding: "clamp(38px,8vw,88px) 22px" }}>
      <div style={{ maxWidth: 1080, margin: "auto" }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", opacity: .85 }}>{c.company || "Empresa"}</div>
        <h1 style={{ fontSize: "clamp(34px,7vw,64px)", lineHeight: 1.04, maxWidth: 800, margin: "18px 0" }}>{c.tagline || c.company || "Bem-vindo"}</h1>
        <p style={{ fontSize: "clamp(14px,2vw,18px)", lineHeight: 1.7, maxWidth: 700, opacity: .92 }}>{c.description || "Entre em contato para conhecer nossos produtos e serviços."}</p>
        {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", gap: 9, alignItems: "center", background: "white", color, textDecoration: "none", padding: "14px 19px", borderRadius: 9, fontWeight: 700, fontSize: 13, marginTop: 14 }}><MessageCircle size={17}/>{c.ctaLabel || "Fale conosco pelo WhatsApp"}</a>}
      </div>
    </header>
    <div style={{ maxWidth: 1080, margin: "auto", padding: "32px 20px 70px" }}>
      {gallery.length > 0 && <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 12, marginBottom: 34 }}>{gallery.map((src, index) => <img key={src} src={src} alt={(c.company || "Empresa") + " imagem " + (index + 1)} style={{ width: "100%", height: 250, objectFit: "cover", borderRadius: 14, background: "#e7eaf2" }}/>)}</section>}
      {services.length > 0 && <section style={{ marginBottom: 34 }}><div style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>O que oferecemos</div><h2 style={{ fontSize: 28, margin: "8px 0 18px" }}>Conheça nossos serviços</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 12 }}>{services.map((service, index) => <article key={index} style={{ background: "white", border: "1px solid #e8eaf0", borderRadius: 12, padding: 18 }}><div style={{ color, marginBottom: 12 }}><Star size={18}/></div><h3 style={{ fontSize: 15, margin: 0 }}>{service}</h3></article>)}</div></section>}
      <section style={{ background: "white", border: "1px solid #e8eaf0", borderRadius: 14, padding: 22, display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", alignItems: "center" }}>
        <div><h2 style={{ fontSize: 21, margin: "0 0 8px" }}>Vamos conversar?</h2><p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Entre em contato para tirar dúvidas e solicitar atendimento.</p>{c.city && <p style={{ color: "#64748b", fontSize: 12, display: "flex", gap: 7, alignItems: "center" }}><MapPin size={14}/>{c.city}</p>}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ background: color, color: "white", padding: "12px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 12 }}>WhatsApp</a>}
          {c.instagram && <a href={c.instagram.startsWith("http") ? c.instagram : "https://instagram.com/" + c.instagram.replace(/^@/, "")} target="_blank" rel="noreferrer" style={{ border: "1px solid #d9deea", color: "#273449", padding: "12px 16px", borderRadius: 8, textDecoration: "none", fontSize: 12, display: "inline-flex", gap: 7, alignItems: "center" }}><Instagram size={14}/> Instagram</a>}
          {c.googleUrl && <a href={c.googleUrl} target="_blank" rel="noreferrer" style={{ border: "1px solid #d9deea", color: "#273449", padding: "12px 16px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>Como chegar / Google</a>}
        </div>
      </section>
    </div>
    <footer style={{ textAlign: "center", color: "#8b95a7", padding: 20, fontSize: 10 }}>Página desenvolvida com Arcany Digital</footer>
  </main>;
}
