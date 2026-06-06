import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, MapPin, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "5511999999999"; // substitua pelo número real

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const Obrigado = () => {
  useEffect(() => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
      window.fbq("track", "Lead", {
        content_name: "Importa PRO Experience 2026",
        content_category: "Evento",
        value: 0,
        currency: "BRL",
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center px-4 py-16"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </motion.div>

        <h2 className="font-display text-[1.75rem] sm:text-[2rem] text-white mb-3">
          Análise recebida!
        </h2>

        <p className="text-primary font-body font-bold text-lg mb-4">
          Você acaba de dar um passo que a maioria dos empresários não dá.
        </p>

        <p className="text-white/50 font-body text-[15px] leading-relaxed mb-2">
          Enquanto outros continuam pagando caro para intermediários,{" "}
          <span className="text-white font-medium">
            você decidiu descobrir como comprar direto da China.
          </span>
        </p>

        <p className="text-white/50 font-body text-[15px] leading-relaxed mb-6">
          Nossa equipe vai analisar seu perfil e entrar em contato{" "}
          <span className="text-primary font-semibold">em breve</span>{" "}
          com as instruções de participação no Importa PRO Experience 2026.
        </p>

        {/* Event info */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-5 py-3 rounded-xl bg-[#D4A843]/6 border border-[#D4A843]/25 text-sm font-body font-semibold mb-8">
          <span className="flex items-center gap-2 text-[#D4A843]">
            <Calendar className="w-4 h-4" />26 de Junho de 2026
          </span>
          <span className="text-white/20 hidden sm:block">·</span>
          <span className="flex items-center gap-2 text-[#D4A843]">
            <MapPin className="w-4 h-4" />São Paulo, SP
          </span>
        </div>

        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-8" />

        <p className="text-white/40 font-body text-sm mb-6">
          Se quiser falar diretamente com nossa equipe, acesse agora:
        </p>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Acabei%20de%20preencher%20o%20formul%C3%A1rio%20do%20Importa%20PRO%20Experience%2C%20quero%20mais%20informa%C3%A7%C3%B5es`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-[#8B0A0A] via-[#BB1717] to-[#D44444] text-white font-body font-bold text-sm uppercase tracking-[0.1em] px-8 py-4 rounded hover:brightness-110 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 glow-blue"
        >
          Falar com a Equipe Agora
          <ArrowRight className="w-5 h-5" />
        </a>

        <p className="text-white/25 font-body text-xs mt-4">
          Atendimento rápido via WhatsApp
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Obrigado;
