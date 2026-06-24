"use client";

import { motion } from "framer-motion";

const prisms = [
  { className: "three-d-prism prism-a", duration: 24, delay: 0 },
  { className: "three-d-prism prism-b", duration: 28, delay: 2 },
  { className: "three-d-prism prism-c", duration: 22, delay: 1 },
];

export default function ThreeDBackdrop() {
  return (
    <div className="three-d-layer" aria-hidden="true">
      {prisms.map((prism) => (
        <motion.div
          key={prism.className}
          className={prism.className}
          animate={{ rotateX: [8, 20, 8], rotateY: [0, 180, 360], rotateZ: [0, 14, 0] }}
          transition={{
            duration: prism.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: prism.delay,
          }}
        />
      ))}
    </div>
  );
}
