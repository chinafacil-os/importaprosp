import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, XCircle, Loader2, Calendar, MapPin, ArrowRight,
  TrendingUp, Shield, Plus, Minus, Star, Package,
  AlertTriangle, Building2, Globe, BarChart3, MessageCircle,
  Play, ChevronLeft, ChevronRight, Image,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { z } from "zod";

/* ─── Placeholders — substitua pelos valores reais ─── */
const GOOGLE_SHEETS_URL = "";
const WHATSAPP_NUMBER   = "5511999999999";
const CURSO_FALLBACK_URL = "https://wp.chinafacil.com/curso-importa-facil/";
const PIXEL_EVENT_NAME  = "Importa PRO Experience 2026";
/* ─────────────────────────────────────────────────── */

declare global {
  interface Window { fbq: (...args: unknown[]) => void; }
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const contactSchema = z.object({
  nome:     z.string().trim().min(2,  "Preencha seu nome completo"),
  email:    z.string().trim().email(  "Digite um e-mail válido"),
  telefone: z.string().trim().min(14, "Digite um telefone válido com DDD"),
});

const multiStepQuestions: {
  id: string;
  label: string;
  options: string[];
  disqualify: string[];
  type: "radio" | "text";
}[] = [
  {
    id: "situacaoImportacao",
    label: "Qual sua situação atual com importação?",
    options: [
      "Já importo e quero escalar",
      "Compro de fornecedores no BR e quero importar",
      "Estou começando do zero",
    ],
    disqualify: [],
    type: "radio",
  },
  {
    id: "disponibilidade",
    label: "A imersão será presencial em SP. Você tem disponibilidade?",
    options: [
      "Sim, sou de SP / Posso viajar",
      "Preciso entender a logística",
      "Não tenho disponibilidade",
    ],
    disqualify: ["Não tenho disponibilidade"],
    type: "radio",
  },
  {
    id: "faturamento",
    label: "Qual o faturamento da sua empresa por mês?",
    options: [
      "Acima de R$ 500.000",
      "De R$ 70.000 a R$ 500.000",
      "De R$ 30.000 a R$ 70.000",
      "Até R$ 30.000",
    ],
    disqualify: ["Até R$ 30.000"],
    type: "radio",
  },
  {
    id: "capitalImportacao",
    label: "Você possui no mínimo R$ 50.000 disponível para importar?",
    options: ["Sim", "Não"],
    disqualify: ["Não"],
    type: "radio",
  },
  {
    id: "produto",
    label: "Qual produto você tem interesse em importar?",
    options: [],
    disqualify: [],
    type: "text",
  },
];

const modules = [
  { number: "01", title: "Como aumentar margem comprando direto da China", subtitle: "Estratégia de Compra", desc: "Elimine intermediários e compre na origem. Empresários estão multiplicando margens de 200% a 400% com produtos que você já conhece.", icon: TrendingUp, bullets: ["Canais diretos com fábricas", "Negociação em yuan e dólar", "Timing ideal de compra"] },
  { number: "02", title: "Como reduzir custos sem depender de intermediários", subtitle: "Otimização de Custos", desc: "Mapeie onde o dinheiro está escorrendo na sua cadeia atual e elimine cada camada desnecessária de custo.", icon: BarChart3, bullets: ["Diagnóstico da cadeia atual", "Terceirização inteligente", "Custo real vs. preço percebido"] },
  { number: "03", title: "Como validar fornecedores chineses com segurança", subtitle: "Due Diligence", desc: "O método para separar confiáveis de golpistas — sem precisar viajar à China. Checklists, certificações e red flags que todo importador deve conhecer.", icon: Shield, bullets: ["Verificação em plataformas oficiais", "Análise de amostras e certificados", "Contratos e proteção jurídica"] },
  { number: "04", title: "Como evitar os erros que travam o lucro e o crescimento", subtitle: "Gestão de Riscos", desc: "Os 7 erros mais comuns que fazem empresários perderem dinheiro na importação — e como evitar cada um antes de fechar o primeiro pedido.", icon: AlertTriangle, bullets: ["Erros de classificação fiscal", "Problemas alfandegários", "Gestão de frete e seguro"] },
  { number: "05", title: "Como estruturar uma operação profissional de importação", subtitle: "Operação & Processos", desc: "Da negociação ao desembarque: construa um processo repetível, previsível e escalável — como quem opera R$ 6 bilhões por ano.", icon: Building2, bullets: ["Fluxo de pedidos e pagamentos", "Logística internacional", "Compliance e documentação"] },
  { number: "06", title: "Como identificar produtos com alto potencial de mercado", subtitle: "Inteligência de Produto", desc: "Metodologia para garimpar produtos com demanda real, baixa concorrência e margem alta — antes que o mercado perceba a oportunidade.", icon: Package, bullets: ["Análise de tendências globais", "Validação de demanda local", "Posicionamento de marca própria"] },
];

const speakerCredentials = [
  { label: "+20 anos", desc: "de experiência em importação" },
  { label: "R$ 6bi+",  desc: "movimentados por ano" },
  { label: "+200 mil", desc: "operações realizadas" },
  { label: "China",    desc: "escritório e operação ativa" },
];

const eventStats = [
  { icon: Star,     value: "+20",     label: "ANOS",        desc: "de experiência real" },
  { icon: TrendingUp, value: "R$6bi+", label: "MOVIMENTADOS", desc: "por ano nas operações" },
  { icon: Globe,    value: "+200k",   label: "OPERAÇÕES",   desc: "realizadas com sucesso" },
  { icon: MapPin,   value: "26 JUN",  label: "SÃO PAULO",   desc: "imersão presencial" },
];

const EVENT_DATE = new Date("2026-06-26T09:00:00");

const faqs = [
  { q: "O evento é presencial ou online?", a: "O Importa PRO Experience é 100% presencial, em São Paulo. A experiência ao vivo, o networking com outros empresários e a imersão prática são o diferencial central do evento." },
  { q: "Quem pode participar?", a: "Empresários que faturam acima de R$ 100 mil/mês ou compram acima de R$ 50 mil/mês em produtos — e que possuem ao menos R$ 50 mil disponíveis para iniciar ou escalar a operação de importação." },
  { q: "O que aprendo aqui que não encontro no YouTube?", a: "Você aprende diretamente com quem opera na China hoje. Thiago Martins compartilha sua própria operação real: fornecedores ativos, processos internos, erros cometidos. Isso não está disponível em nenhum conteúdo gratuito." },
  { q: "Como funciona o credenciamento?", a: "Após a confirmação da inscrição, você receberá um e-mail com todas as informações: local exato, horário de credenciamento e o que esperar do dia. Nossa equipe também entrará em contato via WhatsApp." },
  { q: "Qual o horário do evento?", a: "Das 9h às 18h, com intervalos para networking e alimentação. Recomendamos chegar 30 minutos antes para o credenciamento." },
  { q: "Terá certificado de participação?", a: "Sim. Todos os participantes recebem certificado digital de participação no Importa PRO Experience 2026." },
];

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

const useCountdown = () => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = EVENT_DATE.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) };
    };
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */

const fadeUp  = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } } };

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

const SectionLabel = ({ text }: { text: string }) => (
  <p className="flex items-center justify-center gap-2 text-primary font-body text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
    {text}
  </p>
);

const SectionHeading = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`font-display text-[clamp(1.2rem,2.2vw,1.6rem)] leading-[1.3] text-center ${className}`}>
    {children}
  </h2>
);

const CtaButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2.5 bg-gradient-to-r from-[#8B0A0A] via-[#BB1717] to-[#D44444] text-white font-body font-bold text-[13px] uppercase tracking-[0.12em] px-7 py-3.5 rounded hover:brightness-110 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 glow-blue ${className}`}
  >
    {children}
    <ArrowRight className="w-4 h-4 flex-shrink-0" />
  </button>
);

const CountdownBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-card border border-border rounded-md px-3 py-2 min-w-[46px] sm:min-w-[52px] text-center">
      <span className="font-display text-xl sm:text-2xl text-white leading-none">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="font-body text-[9px] text-white/35 uppercase tracking-widest mt-1">{label}</span>
  </div>
);

const LOGOS = [
  { src: "/logos/redbull.webp",     alt: "Red Bull" },
  { src: "/logos/lacoste.webp",     alt: "Lacoste" },
  { src: "/logos/continental.webp", alt: "Continental" },
  { src: "/logos/cea.webp",         alt: "C&A" },
  { src: "/logos/puket.webp",       alt: "Puket" },
  { src: "/logos/honda.webp",       alt: "Honda" },
];

const LogoMarquee = () => (
  <section className="py-8 sm:py-10 border-b border-white/5 overflow-hidden">
    <p className="text-center font-body text-[10px] sm:text-[11px] text-white/25 uppercase tracking-[0.22em] mb-6 px-4">
      Marcas que já importam diretamente da China
    </p>
    <div className="relative overflow-hidden">
      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{ background: "linear-gradient(to right, hsl(0 20% 4%), transparent)" }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{ background: "linear-gradient(to left, hsl(0 20% 4%), transparent)" }} />

      <div className="flex animate-marquee gap-0 whitespace-nowrap">
        {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
          <div key={i} className="flex-shrink-0 flex items-center justify-center h-14 mx-10">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-9 sm:h-11 w-auto object-contain"
              loading="lazy"
              style={{ opacity: 0.85 }}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const MarqueeBand = ({ reverse = false, variant = "brand" }: { reverse?: boolean; variant?: "brand" | "cta" }) => (
  <div className="relative overflow-hidden py-2.5 border-y border-primary/10 bg-primary/[0.02]">
    <div className={`flex ${reverse ? "animate-marquee-reverse" : "animate-marquee"} whitespace-nowrap`}>
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="mx-5 font-display text-xs sm:text-sm tracking-[0.1em] uppercase">
          {variant === "cta" ? (
            <>
              <span className="text-primary">▼</span>
              <span className="text-white ml-2.5">GARANTA SUA VAGA</span>
              <span className="text-white/25 mx-2.5">·</span>
              <span className="text-white/60">3 PERGUNTAS</span>
              <span className="text-white/25 mx-2.5">·</span>
              <span className="text-primary">2 MINUTOS</span>
              <span className="inline-block mx-4 text-primary/50">▼</span>
            </>
          ) : (
            <>
              <span className="text-white/85">IMPORTA PRO</span>
              <span className="text-primary ml-1.5">EXPERIENCE</span>
              <span className="text-white/25 ml-1.5">2026</span>
              <span className="inline-block mx-4 text-primary/45">◆</span>
            </>
          )}
        </span>
      ))}
    </div>
  </div>
);

const FaqItem = ({ item, isOpen, toggle }: { item: typeof faqs[0]; isOpen: boolean; toggle: () => void }) => (
  <motion.div variants={fadeUp} className={`border rounded-lg transition-all duration-300 ${isOpen ? "border-primary/35 bg-white/[0.02]" : "border-white/8 hover:border-white/15"}`}>
    <button onClick={toggle} className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4">
      <span className={`font-body font-semibold text-sm transition-colors ${isOpen ? "text-primary" : "text-white/80"}`}>{item.q}</span>
      <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all ${isOpen ? "bg-primary text-white" : "bg-white/8 text-white/40"}`}>
        {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      </span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
          <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-[13px] text-white/50 font-body leading-relaxed">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ═══════════════════════════════════════════
   TESTIMONIALS IMAGE CAROUSEL
   ═══════════════════════════════════════════ */

/* Adicione as imagens em public/depoimentos/ e substitua os src abaixo */
const testimonialsImages = [
  { src: "", alt: "Depoimento 1" },
  { src: "", alt: "Depoimento 2" },
  { src: "", alt: "Depoimento 3" },
  { src: "", alt: "Depoimento 4" },
  { src: "", alt: "Depoimento 5" },
  { src: "", alt: "Depoimento 6" },
  { src: "", alt: "Depoimento 7" },
  { src: "", alt: "Depoimento 8" },
];

const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: true });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-16 sm:py-20 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Cabeçalho */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
          variants={stagger} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2">
            <motion.p variants={fadeUp} className="font-body text-[11px] text-primary font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Prints &amp; registros
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.3rem,2.8vw,2rem)] text-white leading-tight">
              O que estão falando{" "}
              <span className="text-gradient">sobre o evento</span>
            </motion.h2>
          </div>

          {/* Botões de navegação */}
          <motion.div variants={fadeUp} className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => emblaApi?.scrollPrev()}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200
                ${canPrev ? "border-primary/40 text-primary hover:bg-primary/10" : "border-white/10 text-white/20 cursor-not-allowed"}`}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => emblaApi?.scrollNext()}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200
                ${canNext ? "border-primary/40 text-primary hover:bg-primary/10" : "border-white/10 text-white/20 cursor-not-allowed"}`}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Carrossel — full-width para overflow visual */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex gap-4 pl-4 sm:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
          {testimonialsImages.map((img, i) => (
            <div key={i}
              className="flex-shrink-0 w-[200px] sm:w-[240px] aspect-[9/16] rounded-xl overflow-hidden border border-white/8 bg-card relative group">
              {img.src ? (
                <img src={img.src} alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                /* Placeholder */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  style={{ background: "linear-gradient(160deg, hsl(0 20% 8%), hsl(0 15% 5%))" }}>
                  <Image className="w-7 h-7 text-white/10" />
                  <span className="font-body text-[9px] text-white/15 uppercase tracking-widest text-center px-4">
                    Adicionar imagem<br />{i + 1}
                  </span>
                </div>
              )}
            </div>
          ))}
          {/* Spacer final */}
          <div className="flex-shrink-0 w-4 sm:w-[max(1.5rem,calc((100vw-72rem)/2))]" />
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-6 px-4">
        {testimonialsImages.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1 rounded-full transition-all duration-300
              ${i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-white/15 hover:bg-white/30"}`} />
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   STICKY HEADER
   ═══════════════════════════════════════════ */

const StickyHeader = ({ onCtaClick }: { onCtaClick: () => void }) => {
  const countdown = useCountdown();

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 sm:h-13 flex items-center justify-between gap-3">

        {/* Marca — desktop */}
        <span className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-[11px] text-white/55 uppercase tracking-[0.18em] whitespace-nowrap">
            Importa PRO Experience
          </span>
        </span>

        {/* Data — mobile */}
        <span className="sm:hidden flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-body text-[10px] text-primary font-bold uppercase tracking-wider">26 Jun · SP</span>
        </span>

        {/* Cronômetro compacto */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { value: countdown.days,    label: "d" },
            { value: countdown.hours,   label: "h" },
            { value: countdown.minutes, label: "m" },
            { value: countdown.seconds, label: "s" },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center">
              {i > 0 && <span className="text-white/15 text-[11px] font-bold mx-0.5 sm:mx-1">:</span>}
              <div className="flex items-baseline gap-[2px]">
                <span className="font-display text-sm sm:text-[15px] text-white tabular-nums leading-none">
                  {String(value).padStart(2, "0")}
                </span>
                <span className="font-body text-[8px] sm:text-[9px] text-white/30 leading-none">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onCtaClick}
          className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#8B0A0A] to-[#BB1717] hover:brightness-110 text-white font-body font-bold text-[11px] sm:text-[12px] uppercase tracking-[0.1em] px-3 sm:px-4 py-2 rounded transition-all whitespace-nowrap glow-blue"
        >
          <span className="hidden xs:inline sm:inline">Garantir</span> Vaga
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.header>
  );
};

/* ═══════════════════════════════════════════
   MULTI-STEP FORM
   ═══════════════════════════════════════════ */

const MultiStepForm = () => {
  const [step, setStep]             = useState(0);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [textInput, setTextInput]   = useState("");
  const [textError, setTextError]   = useState("");
  const [contact, setContact]       = useState({ nome: "", email: "", telefone: "" });
  const [contactErrors, setCErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitErr] = useState("");
  const [isSubmitting, setSubmit]   = useState(false);
  const navigate = useNavigate();

  const TOTAL_Q = multiStepQuestions.length;
  const qIndex  = step - 1;
  const isQStep = step >= 1 && step <= TOTAL_Q;

  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };

  const sendToSheets = async (cur: Record<string, string>, qualified: boolean) => {
    if (!GOOGLE_SHEETS_URL) return;
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Data:    new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        Nome:    contact.nome, "E-mail": contact.email, WhatsApp: contact.telefone,
        Status:  qualified ? "Qualificado" : "Desqualificado",
        "Situação com importação": cur.situacaoImportacao || "",
        "Disponibilidade SP":      cur.disponibilidade    || "",
        "Faturamento mensal":      cur.faturamento        || "",
        "Capital disponível":      cur.capitalImportacao  || "",
        "Produto de interesse":    cur.produto            || "",
      }),
    });
  };

  const trackLead = () => {
    if (typeof window.fbq === "function")
      window.fbq("track", "Lead", { content_name: PIXEL_EVENT_NAME, content_category: "Evento", value: 0, currency: "BRL" });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErr("");
    const r = contactSchema.safeParse(contact);
    if (!r.success) {
      const fe: Record<string,string> = {};
      r.error.errors.forEach(err => { if (err.path[0]) fe[err.path[0] as string] = err.message; });
      setCErrors(fe); return;
    }
    setStep(1);
  };

  const handleOption = (option: string) => {
    if (isSubmitting) return;
    const q = multiStepQuestions[qIndex];
    const next = { ...answers, [q.id]: option };
    setAnswers(next);
    if (q.disqualify.includes(option)) {
      setSubmit(true);
      sendToSheets(next, false).catch(() => {}).finally(() => {
        trackLead();
        setSubmit(false);
        navigate("/desqualificado");
      });
      return;
    }
    setStep(step + 1);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) { setTextError("Por favor, descreva o produto."); return; }
    setTextError("");
    const q = multiStepQuestions[qIndex];
    const next = { ...answers, [q.id]: textInput.trim() };
    setAnswers(next);
    setSubmit(true);
    try { await sendToSheets(next, true); trackLead(); navigate("/obrigado"); }
    catch { setSubmitErr("Erro ao enviar. Tente novamente."); setSubmit(false); }
  };

  const handleChange = (field: "nome"|"email"|"telefone", value: string) => {
    if (field === "telefone") value = maskPhone(value);
    setContact(p => ({ ...p, [field]: value }));
    if (contactErrors[field]) setCErrors(p => { const n={...p}; delete n[field]; return n; });
  };

  const pct = step === 0 ? 0 : isQStep ? Math.round((step / TOTAL_Q) * 95) : 100;


  return (
    <div className="bg-card border border-primary/30 rounded-xl p-5 sm:p-6 space-y-4 shadow-[0_0_45px_rgba(187,23,23,0.15)] ring-1 ring-primary/10">
      {/* Progress */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-white/40 font-body font-medium">
            {step === 0 ? "Etapa 1 de 6 — Seus dados" : isQStep ? `Etapa ${step + 1} de 6 — Pergunta ${step} de ${TOTAL_Q}` : "Concluído"}
          </span>
          <span className="text-[11px] text-primary font-body font-bold">{pct}%</span>
        </div>
        {/* Segmented step bar */}
        <div className="flex gap-1">
          {[0, ...multiStepQuestions.map((_, i) => i + 1)].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${step > s ? "bg-primary" : step === s ? "bg-primary/60" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div key="contact" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }} className="space-y-4">
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="ms-nome" className="text-[11px] font-body font-medium text-white/70">Nome completo</Label>
                <Input id="ms-nome" placeholder="Seu nome completo" value={contact.nome} onChange={e => handleChange("nome", e.target.value)}
                  className={`h-10 text-sm bg-black/25 border-white/12 text-white placeholder:text-white/25 focus:border-primary/50 ${contactErrors.nome ? "border-yellow-500/60" : ""}`} />
                {contactErrors.nome && <p className="text-[10px] text-yellow-400">{contactErrors.nome}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ms-email" className="text-[11px] font-body font-medium text-white/70">E-mail</Label>
                  <Input id="ms-email" type="email" placeholder="seu@email.com" value={contact.email} onChange={e => handleChange("email", e.target.value)}
                    className={`h-10 text-sm bg-black/25 border-white/12 text-white placeholder:text-white/25 focus:border-primary/50 ${contactErrors.email ? "border-yellow-500/60" : ""}`} />
                  {contactErrors.email && <p className="text-[10px] text-yellow-400">{contactErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ms-tel" className="text-[11px] font-body font-medium text-white/70">WhatsApp</Label>
                  <Input id="ms-tel" type="text" inputMode="numeric" placeholder="(11) 99999-9999" value={contact.telefone} onChange={e => handleChange("telefone", e.target.value)}
                    className={`h-10 text-sm bg-black/25 border-white/12 text-white placeholder:text-white/25 focus:border-primary/50 ${contactErrors.telefone ? "border-yellow-500/60" : ""}`} />
                  {contactErrors.telefone && <p className="text-[10px] text-yellow-400">{contactErrors.telefone}</p>}
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-[#8B0A0A] via-[#BB1717] to-[#D44444] text-white font-body font-bold text-[13px] uppercase tracking-wider py-3 rounded hover:brightness-110 transition-all flex items-center justify-center gap-2 glow-blue">
                Continuar <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-center inline-flex items-center justify-center gap-1.5 w-full text-[10px] text-white/25 font-body">
                <Shield className="w-2.5 h-2.5" /> Seus dados estão protegidos
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }} className="space-y-3">
            <p className="font-body font-semibold text-white text-[14px] leading-snug">{multiStepQuestions[qIndex]?.label}</p>

            {multiStepQuestions[qIndex]?.type === "text" ? (
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Input
                    placeholder="Ex: eletrônicos, roupas, utilidades domésticas..."
                    value={textInput}
                    onChange={e => { setTextInput(e.target.value); if (textError) setTextError(""); }}
                    disabled={isSubmitting}
                    className="h-10 text-sm bg-black/25 border-white/12 text-white placeholder:text-white/25 focus:border-primary/50"
                  />
                  {textError && <p className="text-[10px] text-yellow-400">{textError}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#8B0A0A] via-[#BB1717] to-[#D44444] text-white font-body font-bold text-[13px] uppercase tracking-wider py-3 rounded hover:brightness-110 transition-all flex items-center justify-center gap-2 glow-blue disabled:opacity-50 disabled:cursor-wait">
                  {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</> : <>Finalizar <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </form>
            ) : (
              <div className="space-y-1.5">
                {multiStepQuestions[qIndex]?.options.map(option => (
                  <button key={option} type="button" disabled={isSubmitting} onClick={() => handleOption(option)}
                    className="w-full text-left px-3.5 py-3 rounded-lg border border-white/8 bg-white/[0.015] hover:border-primary/35 hover:bg-primary/5 transition-all duration-150 font-body text-white/60 hover:text-white text-[13px] flex items-center justify-between gap-3 group disabled:opacity-50 disabled:cursor-wait">
                    <span>{option}</span>
                    <ArrowRight className="w-3 h-3 text-white/15 group-hover:text-primary flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {submitError  && <p className="text-xs text-yellow-400 text-center font-body">{submitError}</p>}
            {isSubmitting && multiStepQuestions[qIndex]?.type !== "text" && (
              <div className="flex items-center justify-center gap-2 text-white/50 text-xs font-body"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function Index() {
  const countdown  = useCountdown();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef    = useRef<HTMLDivElement>(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Sticky header with live countdown */}
      <StickyHeader onCtaClick={scrollToForm} />

      {/* ══════════════════════════════════════
          HERO — split: copy | form
          ══════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex items-center px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 bg-grid-fade">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, hsl(214 78% 50%) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl w-full mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-14 xl:gap-20">

            {/* ── LEFT: Copy ── */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="flex-1 min-w-0 space-y-5 lg:pt-4">

              {/* Badge */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 font-body text-primary text-[11px] font-bold uppercase tracking-[0.15em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Imersão Presencial · 26 de Junho · São Paulo
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp} className="space-y-0.5">
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.1] text-white">
                  Enquanto muitos empresários{" "}
                  <span className="text-white/35">reclamam da margem…</span>
                </h1>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.1]">
                  <span className="text-gradient glow-text">outros compram direto da China</span>
                  <span className="text-white"> e dominam o mercado.</span>
                </h1>
              </motion.div>

              {/* Subheadline */}
              <motion.p variants={fadeUp} className="font-body text-white/50 text-[15px] leading-relaxed max-w-lg">
                Uma imersão presencial e exclusiva para empresários que querem importar com estratégia,{" "}
                <span className="text-white/75 font-semibold">reduzir custos e multiplicar margem</span>{" "}
                através de uma operação profissional.
              </motion.p>

              {/* Event chips */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                {[
                  { icon: Calendar, text: "26 de Junho de 2026" },
                  { icon: MapPin,   text: "São Paulo, SP" },
                  { icon: Star,     text: "Vagas limitadas" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4A843]/8 border border-[#D4A843]/30 font-body text-[#D4A843] text-[12px] font-medium shadow-[0_0_12px_rgba(212,168,67,0.08)]">
                    <Icon className="w-3 h-3 text-[#D4A843]" /> {text}
                  </span>
                ))}
              </motion.div>

              {/* Mobile-only CTA */}
              <motion.div variants={fadeUp} className="lg:hidden pt-1">
                <CtaButton onClick={scrollToForm}>QUERO GARANTIR MINHA VAGA</CtaButton>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Form ── */}
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full lg:w-[400px] xl:w-[420px] lg:flex-shrink-0 space-y-3"
            >
              {/* Form header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <p className="font-body text-[10px] text-primary font-bold uppercase tracking-widest">Vagas limitadas</p>
                </div>
                <h3 className="font-display text-[1.2rem] text-white leading-snug">Garanta sua vaga no Importa PRO</h3>
                <p className="font-body text-[12px] text-white/40">Preencha o formulário — nossa equipe entra em contato</p>
              </div>
              <MultiStepForm />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARQUEE — BRAND
          ══════════════════════════════════════ */}
      <MarqueeBand />

      {/* ══════════════════════════════════════
          STATS
          ══════════════════════════════════════ */}
      <section className="py-10 px-4 sm:px-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
            {eventStats.map(s => (
              <motion.div key={s.label} variants={fadeUp} className="text-center space-y-0.5">
                <p className="font-display text-xl sm:text-2xl text-primary leading-none">{s.value}</p>
                <p className="font-body text-[9px] text-primary font-bold uppercase tracking-widest">{s.label}</p>
                <p className="font-body text-white/35 text-[11px] leading-snug">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex justify-center">
            <CtaButton onClick={scrollToForm}>QUERO GARANTIR MINHA VAGA</CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROBLEMA / CONTRASTE
          ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 section-elevated">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="space-y-10">
            <div className="text-center space-y-3">
              <motion.div variants={fadeUp}>
                <SectionLabel text="A realidade do mercado" />
                <SectionHeading>
                  Dois grupos de empresários.{" "}
                  <span className="text-gradient">Resultados completamente opostos.</span>
                </SectionHeading>
              </motion.div>
              <motion.p variants={fadeUp} className="font-body text-white/45 text-[13px] max-w-sm mx-auto">
                A diferença não é trabalhar mais. É de onde compram.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid md:grid-cols-2 gap-5">
              {/* Grupo A */}
              <motion.div variants={scaleIn} className="relative rounded-xl border border-white/8 bg-card p-6 space-y-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/8" />
                <div>
                  <p className="font-body text-[10px] text-white/25 uppercase tracking-widest font-bold mb-1">Grupo A</p>
                  <h3 className="font-display text-[1rem] text-white/60 leading-snug">O empresário que depende de intermediários</h3>
                </div>
                <ul className="space-y-2.5">
                  {["Paga caro para fornecedores nacionais com 2 a 4 margens embutidas","Trabalha com margem apertada e não consegue crescer","Reféns de rupturas de estoque e atrasos","Concorre em preço porque não tem diferenciação","Não escala — quanto mais vende, mais trabalha"].map(item => (
                    <li key={item} className="flex items-start gap-2.5 font-body text-[13px] text-white/40">
                      <XCircle className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Grupo B */}
              <motion.div variants={scaleIn} className="relative rounded-xl border border-primary/20 bg-primary/[0.04] p-6 space-y-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div>
                  <p className="font-body text-[10px] text-primary uppercase tracking-widest font-bold mb-1">Grupo B</p>
                  <h3 className="font-display text-[1rem] text-white leading-snug">O empresário que importa direto</h3>
                </div>
                <ul className="space-y-2.5">
                  {["Compra na origem, sem intermediários, com margem real de 200% a 400%","Tem previsibilidade de custos e escala sem travar","Controla o estoque e o ritmo da operação","Cria sua própria marca com produto exclusivo","Trabalha menos por cada real que lucra"].map(item => (
                    <li key={item} className="flex items-start gap-2.5 font-body text-[13px] text-white/75">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={scrollToForm} className="text-primary font-body text-[13px] font-bold inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
                  Quero ser do Grupo B <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MÓDULOS
          ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center space-y-3">
            <motion.div variants={fadeUp}>
              <SectionLabel text="Conteúdo da imersão" />
              <SectionHeading>
                O que você vai{" "}
                <span className="text-gradient">descobrir no Importa PRO</span>
              </SectionHeading>
            </motion.div>
            <motion.p variants={fadeUp} className="font-body text-white/40 text-[13px] max-w-md mx-auto">
              Não é teoria de internet. É a operação real de quem movimenta R$ 6 bilhões por ano.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(mod => {
              const Icon = mod.icon;
              return (
                <motion.div key={mod.number} variants={scaleIn}
                  className="group relative bg-card border border-white/8 rounded-xl p-5 space-y-3 hover:border-primary/25 transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/35 transition-all duration-500" />
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
                    </div>
                    <span className="font-display text-2xl text-white/5">{mod.number}</span>
                  </div>
                  <div>
                    <p className="font-body text-[9px] text-primary font-bold uppercase tracking-widest mb-1">{mod.subtitle}</p>
                    <h3 className="font-display text-[13px] text-white leading-snug">{mod.title}</h3>
                  </div>
                  <p className="font-body text-white/40 text-[12px] leading-relaxed">{mod.desc}</p>
                  <ul className="space-y-1">
                    {mod.bullets.map(b => (
                      <li key={b} className="flex items-center gap-1.5 font-body text-[11px] text-white/40">
                        <span className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex justify-center pt-2">
            <CtaButton onClick={scrollToForm}>QUERO APRENDER ISSO NA PRÁTICA</CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SPEAKER — THIAGO MARTINS
          ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 section-elevated">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center space-y-3">
            <motion.div variants={fadeUp}>
              <SectionLabel text="Quem vai te ensinar" />
              <SectionHeading>
                Aprenda com quem{" "}
                <span className="text-gradient">está dentro do jogo real</span>
              </SectionHeading>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={scaleIn}
            className="group relative rounded-2xl overflow-hidden bg-card border border-white/8 hover:border-primary/20 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-20" />
            <div className="flex flex-col md:flex-row">
              {/* Foto — substitua pelo <img> quando tiver o arquivo */}
              <div className="relative md:w-[280px] lg:w-[300px] md:flex-shrink-0 h-56 md:h-auto overflow-hidden bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                <span className="font-display text-7xl text-primary/8">TM</span>
                {/*
                  Para adicionar foto: descomente abaixo e adicione /public/thiago-speaker.webp
                  <img src="/thiago-speaker.webp" alt="Thiago Martins"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card" />
              </div>

              {/* Bio */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <span className="font-body text-primary text-[10px] font-bold uppercase tracking-widest">Palestrante Principal</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl text-white leading-none">Thiago Martins</h3>
                  <p className="text-primary font-body font-semibold text-[13px] mt-1.5">Fundador da China Fácil e Martins Logística</p>
                </div>
                <p className="font-body text-white/55 text-[14px] leading-relaxed">
                  Empresário com mais de 20 anos de experiência em importação internacional. Responsável por mais de R$ 6 bilhões movimentados por ano e 200 mil operações realizadas. Com escritório e operação ativa na China, Thiago não é um guru de internet — é um empresário que está dentro do jogo real todos os dias.
                </p>
                <blockquote className="font-body text-white/35 text-[13px] leading-relaxed italic border-l-2 border-primary/30 pl-3">
                  "Você vai aprender diretamente com quem opera, negocia e importa hoje — não com quem assistiu um curso sobre isso."
                </blockquote>
                <div className="grid grid-cols-2 gap-2.5">
                  {speakerCredentials.map(c => (
                    <div key={c.label} className="bg-white/[0.025] border border-white/6 rounded-lg px-3.5 py-2.5">
                      <p className="font-display text-primary text-base leading-none">{c.label}</p>
                      <p className="font-body text-white/35 text-[11px] mt-0.5 leading-snug">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex justify-center">
            <CtaButton onClick={scrollToForm}>GARANTIR MINHA VAGA COM THIAGO</CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LOGO MARQUEE — social proof
          ══════════════════════════════════════ */}
      <LogoMarquee />

      {/* ══════════════════════════════════════
          PARA QUEM É / NÃO É
          ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center space-y-3">
            <motion.div variants={fadeUp}>
              <SectionLabel text="Critérios de participação" />
              <SectionHeading>
                O Importa PRO{" "}
                <span className="text-gradient">não é para todo mundo</span>
              </SectionHeading>
            </motion.div>
            <motion.p variants={fadeUp} className="font-body text-white/40 text-[13px] max-w-sm mx-auto">
              Exclusivo para empresários com perfil e capacidade para aplicar o que vão aprender.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            className="grid md:grid-cols-2 gap-5">
            <motion.div variants={fadeUp} className="bg-card border border-primary/15 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <p className="font-display text-[0.95rem] text-white">Este evento É para você se…</p>
              </div>
              <ul className="space-y-2.5">
                {["Fatura acima de R$ 100 mil/mês com seu negócio","Compra acima de R$ 50 mil/mês em produtos","Tem ao menos R$ 50 mil disponíveis para investir em importação","Está disposto a partir para a operação real, não só teoria","Quer reduzir custos e aumentar margem com fornecedores diretos","Busca criar uma operação previsível e escalável"].map(item => (
                  <li key={item} className="flex items-start gap-2 font-body text-[13px] text-white/65">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0 mt-1.5" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-card border border-white/8 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-white/25" />
                <p className="font-display text-[0.95rem] text-white/55">NÃO é para você se…</p>
              </div>
              <ul className="space-y-2.5">
                {["Está buscando renda extra ou uma solução rápida sem esforço","Não tem capital para investir em uma operação real","Quer conteúdo superficial ou teoria sem aplicação prática","Não está disposto a sair da zona de conforto","Ainda não tem empresa ou negócio estruturado"].map(item => (
                  <li key={item} className="flex items-start gap-2 font-body text-[13px] text-white/30">
                    <span className="w-1 h-1 rounded-full bg-white/15 flex-shrink-0 mt-1.5" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} className="text-center pt-2">
            <CtaButton onClick={scrollToForm}>GARANTIR MINHA ANÁLISE DE PARTICIPAÇÃO</CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DEPOIMENTOS — VÍDEOS
          ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="text-center mb-10 sm:mb-12 space-y-3">
            <motion.p variants={fadeUp} className="font-body text-[11px] text-primary font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Depoimentos em vídeo
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.3rem,2.8vw,2rem)] text-white leading-tight">
              Veja quem já passou pelo{" "}
              <span className="text-gradient">Importa PRO</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="font-body text-white/40 text-[14px] max-w-md mx-auto">
              Resultados reais, na voz de quem viveu a transformação.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "Rafael Mendonça", role: "Loja de utilidades · SP", youtubeId: "" },
              { name: "Camila Furtado",  role: "Moda · PR",              youtubeId: "" },
              { name: "Eduardo Tavares", role: "Atacado eletrônicos · GO", youtubeId: "" },
            ].map((v, i) => (
              <motion.div key={i} variants={fadeUp} className="group flex flex-col gap-3">
                {/* Thumbnail / embed */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-card border border-white/8 group-hover:border-primary/30 transition-colors duration-300">
                  {v.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${v.youtubeId}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    /* Placeholder enquanto os vídeos não são adicionados */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      style={{ background: "linear-gradient(135deg, hsl(0 20% 8%), hsl(0 15% 6%))" }}>
                      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                      </div>
                      <span className="font-body text-[10px] text-white/20 uppercase tracking-widest">Vídeo em breve</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div>
                  <p className="font-body font-semibold text-[13px] text-white">{v.name}</p>
                  <p className="font-body text-[11px] text-white/35">{v.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex justify-center pt-4">
            <CtaButton onClick={scrollToForm}>QUERO RESULTADOS ASSIM</CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DEPOIMENTOS — CARROSSEL DE IMAGENS
          ══════════════════════════════════════ */}
      {/* ══════════════════════════════════════
          MARQUEE — CTA
          ══════════════════════════════════════ */}
      <MarqueeBand variant="cta" reverse />

      {/* ══════════════════════════════════════
          DEPOIMENTOS — CARROSSEL DE IMAGENS
          ══════════════════════════════════════ */}
      <TestimonialsCarousel />

      {/* ══════════════════════════════════════
          FAQ
          ══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 section-elevated">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center space-y-3">
            <motion.div variants={fadeUp}>
              <SectionLabel text="Dúvidas frequentes" />
              <SectionHeading>
                Perguntas <span className="text-gradient">frequentes</span>
              </SectionHeading>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="space-y-2">
            {faqs.map((faq, i) => (
              <FaqItem key={i} item={faq} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} className="flex justify-center pt-2">
            <CtaButton onClick={scrollToForm}>GARANTIR MINHA VAGA</CtaButton>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BOTTOM CTA — sem formulário duplicado
          ══════════════════════════════════════ */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-grid">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <SectionLabel text="Sua vaga" />
              <SectionHeading className="max-w-md mx-auto">
                Ainda está em dúvida?{" "}
                <span className="text-gradient">Fale com nossa equipe.</span>
              </SectionHeading>
            </motion.div>
            <motion.p variants={fadeUp} className="font-body text-white/40 text-[13px] mt-3 mb-5">
              Nossa equipe pode responder todas as suas perguntas antes de você garantir sua vaga.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <CtaButton onClick={scrollToForm}>GARANTIR MINHA VAGA</CtaButton>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Quero%20saber%20mais%20sobre%20o%20Importa%20PRO%20Experience`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded border border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all font-body text-white/60 hover:text-white text-[13px] font-semibold"
              >
                <MessageCircle className="w-4 h-4" /> Falar pelo WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="font-display text-white text-sm">Importa PRO Experience 2026</p>
            <p className="font-body text-white/25 text-[11px]">China Fácil · Martins Logística</p>
          </div>
          <div className="flex items-center gap-5">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="font-body text-white/30 hover:text-white text-[12px] transition-colors">WhatsApp</a>
            <span className="font-body text-white/25 text-[11px]">© 2026 · Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
