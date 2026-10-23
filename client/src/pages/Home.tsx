import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleDot, Instagram, Mail, Menu, MessageCircle, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const HERO = "/manus-storage/async-images/7w6Qk7vYuuiZ1x6RKVDxLn/image-1.webp";
const MOLDING = "/manus-storage/async-images/7w6Qk7vYuuiZ1x6RKVDxLn/image-2.webp";
const HISTORY = "/manus-storage/async-images/7w6Qk7vYuuiZ1x6RKVDxLn/image-3.webp";
const primaryPhone = "5519982663443";
const secondaryPhone = "5519981214643";

const fallbackData = {
  settings: { companyName: "LimerGesso", responsible: "Junior Felizatti", phonePrimary: "(19) 98266-3443", phoneSecondary: "(19) 98121-4643", email: "limergesso@email.com", instagram: "https://www.instagram.com/limergesso/", address: "", mapUrl: "", heroImageUrl: HERO, historyImageUrl: HISTORY },
  content: {
    heroTitle: "Há mais de 40 anos transformando ambientes através do gesso.",
    heroBody: "Experiência, qualidade e precisão em cada detalhe. Criamos soluções em gesso que valorizam ambientes residenciais e comerciais, unindo tradição, sofisticação e acabamento de excelência.",
    aboutTitle: "Mais de 40 anos transformando ambientes",
    aboutBody: "Há mais de 40 anos, construímos nossa história no mercado de gesso, unindo experiência, qualidade e dedicação em cada projeto realizado.\n\nAo longo dessas décadas, acompanhamos a evolução do setor e aprimoramos nossas técnicas para oferecer soluções modernas, funcionais e com acabamento impecável.\n\nNosso compromisso vai além de executar um serviço: buscamos entender a necessidade de cada cliente e transformar suas ideias em ambientes sofisticados e bem executados.\n\nTrabalhamos com responsabilidade, atenção aos detalhes e respeito aos prazos, sempre buscando entregar um resultado que supere as expectativas.\n\nMais de 40 anos de experiência.\nMilhares de projetos realizados.\nUm compromisso que permanece: fazer bem feito.",
    historyTitle: "40 anos de história, milhares de ambientes transformados.",
    historyBody: "Uma trajetória construída com conhecimento técnico, atenção aos detalhes e a confiança de quem escolhe fazer bem feito.",
    classicTitle: "Molduras clássicas, assinatura de tradição",
    classicBody: "A tradição das molduras clássicas, um diferencial da LimerGesso na região.",
  },
  services: [], projects: [], photos: [],
};

function BrandLockup({ dark = false }: { dark?: boolean }) {
  return <Link href="/" className={`brand-lockup ${dark ? "brand-lockup-dark" : ""}`} aria-label="LimerGesso — página inicial"><span className="brand-mark" aria-hidden="true">⚜</span><span><strong>Limer</strong><em>Gesso</em><small>Acabamentos que permanecem</small></span></Link>;
}

function WhatsAppButton({ phone = primaryPhone, label = "Fale conosco pelo WhatsApp", compact = false }: { phone?: string; label?: string; compact?: boolean }) {
  return <a className={`button button-red ${compact ? "button-compact" : ""}`} href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer"><MessageCircle size={17} />{label}</a>;
}

function SectionKicker({ children }: { children: React.ReactNode }) { return <div className="section-kicker"><span />{children}</div>; }

function QuoteForm() {
  const [form, setForm] = useState({ fullName: "", whatsapp: "", city: "", service: "", message: "" });
  const [files, setFiles] = useState<{ fileName: string; contentType: "image/jpeg" | "image/png" | "image/webp"; base64: string }[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const quote = trpc.publicSite.submitQuote.useMutation();
  const content = trpc.publicSite.getContent.useQuery().data ?? fallbackData;
  const services = content.services.length ? content.services : ["Forros de gesso", "Sancas", "Iluminação embutida", "Divisórias em drywall", "Molduras clássicas", "Projetos residenciais", "Projetos comerciais", "Reformas e acabamentos"].map((name, id) => ({ id, name }));

  const readFiles = async (list: FileList | null) => {
    if (!list) return;
    const selected = Array.from(list).slice(0, 3);
    const next = await Promise.all(selected.map(file => new Promise<{ fileName: string; contentType: "image/jpeg" | "image/png" | "image/webp"; base64: string } | null>(resolve => {
      if (!("image/jpeg" === file.type || "image/png" === file.type || "image/webp" === file.type) || file.size > 8 * 1024 * 1024) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({ fileName: file.name, contentType: file.type as "image/jpeg" | "image/png" | "image/webp", base64: String(reader.result) });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    })));
    setFiles(next.filter(Boolean) as typeof files);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const result = await quote.mutateAsync({ ...form, idempotencyKey: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, attachments: files });
      setSubmittedId(result.publicId);
      setForm({ fullName: "", whatsapp: "", city: "", service: "", message: "" });
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar agora. Tente novamente.");
    }
  };

  if (submittedId) return <div className="quote-success"><div className="success-icon"><Check /></div><SectionKicker>Solicitação recebida</SectionKicker><h3>Obrigado por contar sobre o seu projeto.</h3><p>Seu identificador é <strong>{submittedId}</strong>. Nossa equipe poderá usar esse código para localizar o pedido. Em breve, entraremos em contato.</p><button className="button button-outline" onClick={() => setSubmittedId(null)}>Enviar outra solicitação</button></div>;

  return <form className="quote-form" onSubmit={submit}>
    <div className="form-grid"><label>Nome completo<input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Como podemos chamar você?" /></label><label>WhatsApp<input required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="(00) 00000-0000" /></label></div>
    <div className="form-grid"><label>Cidade<input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Onde será o projeto?" /></label><label>Tipo de serviço<select required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}><option value="">Selecione uma opção</option>{services.map(service => <option key={service.id} value={service.name}>{service.name}</option>)}</select></label></div>
    <label>Conte sobre o seu projeto<textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="O que você deseja transformar?" /></label>
    <label className="file-field">Fotos do ambiente <span>(opcional)</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => void readFiles(e.target.files)} /><small>{files.length ? `${files.length} foto(s) pronta(s) para envio.` : "Até 3 imagens, 8 MB cada."}</small></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-footer"><p><ShieldCheck size={17} /> Seus dados serão usados apenas para responder à solicitação, conforme a LGPD.</p><button className="button button-red" disabled={quote.isPending}>{quote.isPending ? "Enviando…" : "Enviar solicitação"}<ArrowRight size={17} /></button></div>
  </form>;
}

export default function Home() {
  const { data } = trpc.publicSite.getContent.useQuery();
  const site = data ?? fallbackData;
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const photos = site.photos.length ? site.photos : [
    { id: 1, title: "Luz desenhada no teto", description: "Imagem ilustrativa conceitual — não representa obra realizada pela LimerGesso.", altText: "Sala com iluminação embutida", imageUrl: HERO, category: "Sancas e iluminação" },
    { id: 2, title: "Detalhe clássico", description: "Imagem ilustrativa conceitual — não representa obra realizada pela LimerGesso.", altText: "Moldura clássica em gesso", imageUrl: MOLDING, category: "Molduras clássicas" },
    { id: 3, title: "Planos e volumes", description: "Imagem ilustrativa conceitual — não representa obra realizada pela LimerGesso.", altText: "Ambiente com teto de gesso", imageUrl: HISTORY, category: "Ambientes residenciais" },
  ];
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(photos.map(photo => photo.category)))], [photos]);
  const filteredPhotos = filter === "Todos" ? photos : photos.filter(photo => photo.category === filter);

  return <div className="site-shell">
    <header className="site-header"><div className="container header-inner"><BrandLockup /><nav className={menuOpen ? "mobile-open" : ""} aria-label="Navegação principal"><a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</a><a href="#projetos" onClick={() => setMenuOpen(false)}>Projetos</a><a href="#quem-somos" onClick={() => setMenuOpen(false)}>Quem somos</a><a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a><a className="nav-cta" href="#orcamento" onClick={() => setMenuOpen(false)}>Solicite seu orçamento <ArrowDownRight size={15} /></a></nav><button className="menu-trigger" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></header>

    <main>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(25,22,20,.82) 0%, rgba(25,22,20,.49) 43%, rgba(25,22,20,.06) 100%), url(${site.settings.heroImageUrl || HERO})` }}><div className="container hero-content"><SectionKicker>Desde 1984 · acabamento com história</SectionKicker><h1>{site.content.heroTitle}</h1><p>{site.content.heroBody}</p><div className="hero-actions"><a className="button button-red" href="#orcamento">Solicite seu orçamento <ArrowRight size={17} /></a><WhatsAppButton label="Fale pelo WhatsApp" /></div><div className="hero-caption"><span className="caption-line" />Imagem conceitual de arquitetura e interiores</div></div><div className="hero-stamp"><span>40</span><small>anos de<br />experiência</small></div></section>

      <section className="quick-links"><div className="container quick-grid"><a href="#servicos"><span>01</span><strong>Serviços</strong><ArrowDownRight /></a><a href="#projetos"><span>02</span><strong>Fotos</strong><ArrowDownRight /></a><a href="#quem-somos"><span>03</span><strong>Quem somos</strong><ArrowDownRight /></a><a href="#orcamento"><span>04</span><strong>Entre em contato</strong><ArrowDownRight /></a></div></section>

      <section className="intro section-pad"><div className="container split-intro"><div><SectionKicker>O detalhe muda tudo</SectionKicker><h2>Gesso com intenção. <em>Ambientes com presença.</em></h2></div><div className="intro-copy"><p>Da primeira conversa ao último acabamento, cada escolha é guiada por proporção, técnica e cuidado. A LimerGesso transforma ideias em espaços que fazem sentido — hoje e por muitos anos.</p><a href="#servicos" className="text-link">Conheça nossas soluções <ArrowRight size={16} /></a></div></div></section>

      <section id="servicos" className="services-section section-pad"><div className="container"><div className="section-head"><div><SectionKicker>O que fazemos</SectionKicker><h2>Soluções para cada <em>possibilidade.</em></h2></div><p>Serviços pensados para valorizar arquitetura, iluminação e a experiência de estar.</p></div><div className="service-grid">{site.services.slice(0, 6).map((service, index) => <motion.article key={service.id} className={`service-card ${index === 0 ? "service-card-featured" : ""}`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * .04 }}><div className="service-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(24,21,18,.78)), url(${service.imageUrl || HERO})` }}><span>0{index + 1}</span><small>{service.category}</small></div><div className="service-body"><h3>{service.name}</h3><p>{service.description}</p><a href="#orcamento" aria-label={`Solicitar orçamento para ${service.name}`}>Solicitar orçamento <ArrowRight size={15} /></a></div></motion.article>)}</div><div className="center-cta"><a href="#orcamento" className="button button-outline">Falar sobre um projeto <ArrowRight size={17} /></a></div></div></section>

      <section className="classic-section section-pad"><div className="container classic-grid"><div className="classic-image"><img src={MOLDING} alt="Detalhe conceitual de moldura clássica em gesso" /><div className="image-note">Referência visual conceitual<br />não representa obra realizada</div></div><div className="classic-copy"><SectionKicker>Um diferencial de tradição</SectionKicker><h2>{site.content.classicTitle}</h2><p>{site.content.classicBody}</p><p className="muted-copy">Do desenho dos relevos à instalação, o cuidado está em respeitar a linguagem clássica sem perder a precisão contemporânea.</p><a href="#orcamento" className="button button-dark">Conversar sobre molduras <ArrowRight size={17} /></a></div></div></section>

      <section id="projetos" className="projects-section section-pad"><div className="container"><div className="section-head"><div><SectionKicker>Referências e projetos</SectionKicker><h2>O acabamento como <em>assinatura.</em></h2></div><p>Uma seleção visual para inspirar conversas. As imagens conceituais serão substituídas pelas fotos reais autorizadas da empresa no painel.</p></div><div className="filter-row" role="tablist" aria-label="Filtrar galeria">{categories.map(category => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div><div className="gallery-grid">{filteredPhotos.map((photo, index) => <button className={`gallery-card gallery-${index + 1}`} key={photo.id} onClick={() => setLightbox(index)} aria-label={`Abrir ${photo.title}`}><img src={photo.imageUrl} alt={photo.altText} loading="lazy" /><span className="gallery-overlay"><small>{photo.category}</small><strong>{photo.title}</strong><ArrowUpRightIcon /></span></button>)}</div></div></section>

      <section id="quem-somos" className="about-section section-pad"><div className="container about-grid"><div className="about-number"><span>40</span><small>anos criando<br />com precisão</small></div><div className="about-copy"><SectionKicker>Quem somos</SectionKicker><h2>{site.content.aboutTitle}</h2>{site.content.aboutBody.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="pillars"><div><strong>40+</strong><span>anos</span></div><div><strong>—</strong><span>experiência</span></div><div><strong>∞</strong><span>cuidado</span></div></div></div></div></section>

      <section className="pillars-section"><div className="container pillar-row"><div><CircleDot size={19} /><strong>40+ ANOS</strong><span>Experiência e tradição no mercado.</span></div><div><Sparkles size={19} /><strong>QUALIDADE</strong><span>Materiais e acabamento de alto padrão.</span></div><div><ArrowDownRight size={19} /><strong>PRECISÃO</strong><span>Atenção aos detalhes em cada projeto.</span></div><div><ShieldCheck size={19} /><strong>CONFIANÇA</strong><span>Compromisso com nossos clientes.</span></div></div></section>

      <section className="history-section section-pad" style={{ backgroundImage: `linear-gradient(90deg, rgba(26,23,21,.82), rgba(26,23,21,.26)), url(${site.settings.historyImageUrl || HISTORY})` }}><div className="container history-content"><SectionKicker>Uma história que continua</SectionKicker><h2>{site.content.historyTitle}</h2><p>{site.content.historyBody}</p><a href="#projetos" className="button button-light">Conheça nossos projetos <ArrowRight size={17} /></a></div></section>

      <section id="orcamento" className="quote-section section-pad"><div className="container quote-grid"><div className="quote-intro"><SectionKicker>Vamos conversar</SectionKicker><h2>Conte-nos sobre<br /><em>o seu projeto.</em></h2><p>Descreva o que você deseja realizar e entre em contato com nossa equipe para conversar sobre as possibilidades do seu ambiente.</p><div className="quote-contact"><span>Atendimento direto</span><a href={`https://wa.me/${primaryPhone}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> (19) 98266-3443</a><a href={`https://wa.me/${secondaryPhone}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> (19) 98121-4643</a></div></div><QuoteForm /></div></section>
    </main>

    <footer id="contato" className="site-footer"><div className="container footer-top"><div><BrandLockup dark /><p>Acabamentos que transformam a maneira de viver os espaços.</p></div><div className="footer-col"><span>Fale conosco</span><a href={`https://wa.me/${primaryPhone}`} target="_blank" rel="noreferrer"><Phone size={15} /> (19) 98266-3443</a><a href={`https://wa.me/${secondaryPhone}`} target="_blank" rel="noreferrer"><Phone size={15} /> (19) 98121-4643</a><a href="mailto:limergesso@email.com"><Mail size={15} /> limergesso@email.com</a></div><div className="footer-col"><span>Presença</span><p>Entre em contato e acompanhe a LimerGesso.</p>{site.settings.instagram ? <a href={site.settings.instagram} target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram oficial</a> : <span className="muted-footer">Instagram ainda não informado</span>}<Link className="admin-footer-link" href="/admin/login">Área do Administrador</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} LimerGesso. Todos os direitos reservados.</span><span>Responsável: {site.settings.responsible}</span></div></footer>
    <a className="floating-whatsapp" href={`https://wa.me/${primaryPhone}`} target="_blank" rel="noreferrer" aria-label="Falar com a LimerGesso pelo WhatsApp"><MessageCircle /></a>
    {lightbox !== null && filteredPhotos[lightbox] && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visualização ampliada" onClick={() => setLightbox(null)}><button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Fechar"><X /></button><button className="lightbox-nav prev" onClick={event => { event.stopPropagation(); setLightbox((lightbox - 1 + filteredPhotos.length) % filteredPhotos.length); }} aria-label="Imagem anterior"><ChevronLeft /></button><img src={filteredPhotos[lightbox].imageUrl} alt={filteredPhotos[lightbox].altText} onClick={event => event.stopPropagation()} /><button className="lightbox-nav next" onClick={event => { event.stopPropagation(); setLightbox((lightbox + 1) % filteredPhotos.length); }} aria-label="Próxima imagem"><ChevronRight /></button></div>}
  </div>;
}

function ArrowUpRightIcon() { return <ArrowUpRight />; }
