"use client";
import { motion } from "framer-motion";

const GPU_LAYER = { willChange: "transform, opacity", transform: "translateZ(0)" };

export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
          x: [0, 15, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={GPU_LAYER}
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tr from-violet-600/25 to-indigo-600/25 blur-[65px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.06, 0.12, 0.06],
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={GPU_LAYER}
        className="absolute top-[25%] -right-[15%] w-[45vw] h-[45vw] max-w-[450px] max-h-[450px] rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 blur-[60px]"
      />
    </div>
  );
}
