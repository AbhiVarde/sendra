import React from "react";
import { motion } from "framer-motion";

const PulsatingRing = () => (
  <motion.div
    style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: `3px solid currentColor`,
    }}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      borderRadius: ["50%", "30%", "50%"],
    }}
    transition={{
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }}
  />
);

export default PulsatingRing;
