import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  onComplete: () => void;
};

export function PortalIntroLoader({ onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const [fontReady, setFontReady] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      const t = window.setTimeout(onComplete, 50);
      return () => window.clearTimeout(t);
    }
    let alive = true;
    document.fonts
      .load('64px "Tan Paradiso"')
      .then(() => alive && setFontReady(true))
      .catch(() => alive && setFontReady(true));
    return () => {
      alive = false;
    };
  }, [onComplete, reduceMotion]);

  if (reduceMotion) {
    return (
      <div
        data-testid="portal-intro-loader"
        className="fixed inset-0 z-[100] bg-[#0A0A0A]"
        aria-hidden
      />
    );
  }

  return (
    <motion.div
      data-testid="portal-intro-loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.4, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]"
    >
      {fontReady && (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 45 }}
          transition={{ duration: 1.0, delay: 2.0, ease: [0.64, 0, 0.78, 0] }}
          className="w-[280px] sm:w-[360px]"
        >
          <svg viewBox="0 0 360 120" className="w-full" aria-label="Shyara">
            <motion.text
              x="180"
              y="60"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Tan Paradiso', serif"
              fontSize="58"
              strokeWidth="1"
              initial={{ strokeDashoffset: 1200, fillOpacity: 0 }}
              animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
              transition={{
                strokeDashoffset: { duration: 1.5, ease: "easeInOut" },
                fillOpacity: { duration: 0.5, delay: 1.2 },
              }}
              style={{ strokeDasharray: 1200 }}
            >
              <tspan fill="#FFFFFF" stroke="#FFFFFF">
                SHYARA
              </tspan>
              <tspan fill="#FF3333" stroke="#FF3333">
                .
              </tspan>
            </motion.text>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
