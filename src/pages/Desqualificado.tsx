import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";

const CURSO_FALLBACK_URL = "https://wp.chinafacil.com/curso-importa-facil/";

const Desqualificado = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center px-4 py-16"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-8"
        >
          <XCircle className="w-10 h-10 text-white/30" />
        </motion.div>

        <h2 className="font-display text-[1.6rem] sm:text-[2rem] text-white mb-3">
          Agradecemos seu interesse!
        </h2>

        <p className="text-white/50 font-body text-[15px] leading-relaxed mb-4 max-w-sm mx-auto">
          Pelos dados enviados, ainda não é o momento de importar via container,
          nem mesmo no compartilhado. Mas isso não te impede de começar.
        </p>

        <p className="text-white/70 font-body text-[15px] leading-relaxed mb-8 max-w-sm mx-auto">
          Recomendamos a{" "}
          <span className="text-white font-semibold">importação simplificada</span>,
          ideal para quem está iniciando. Você pode começar a partir de{" "}
          <span className="text-primary font-semibold">R$ 1.000</span>.
        </p>

        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-8" />

        <a
          href={CURSO_FALLBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-[#8B0A0A] via-[#BB1717] to-[#D44444] text-white font-body font-bold text-sm uppercase tracking-[0.1em] px-8 py-4 rounded hover:brightness-110 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 glow-blue"
        >
          Clique aqui e veja o passo a passo
          <ArrowRight className="w-5 h-5" />
        </a>

        <p className="text-white/25 font-body text-xs mt-4">
          Curso de importação simplificada — comece hoje
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Desqualificado;
