"use client";
import React from "react";
import { motion } from "framer-motion";

interface BaseProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

const FAST_EASE = [0.16, 1, 0.3, 1]; // Ultra-responsive cubic bezier
const GPU_STYLE = { willChange: "transform, opacity", transform: "translateZ(0)" };

/**
 * 1. Snappy GPU Fade In + Slide Up
 */
export function FadeIn({ children, className = "", delay = 0, duration = 0.35 }: BaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: FAST_EASE,
      }}
      style={GPU_STYLE}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 2. Snappy Directional Slide In
 */
interface SlideInProps extends BaseProps {
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
}

export function SlideIn({
  children,
  className = "",
  direction = "left",
  distance = 24,
  delay = 0,
  duration = 0.38,
}: SlideInProps) {
  const getInitial = () => {
    switch (direction) {
      case "left":
        return { opacity: 0, x: -distance };
      case "right":
        return { opacity: 0, x: distance };
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: FAST_EASE,
      }}
      style={GPU_STYLE}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3. Fast Stagger Container for Grids
 */
interface StaggerContainerProps extends BaseProps {
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      style={GPU_STYLE}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 4. Fast Stagger Item for Grid Cards
 */
interface StaggerItemProps extends BaseProps {
  direction?: "up" | "left" | "right";
  distance?: number;
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 18,
  duration = 0.35,
}: StaggerItemProps) {
  const getHidden = () => {
    switch (direction) {
      case "left":
        return { opacity: 0, x: -distance };
      case "right":
        return { opacity: 0, x: distance };
      case "up":
      default:
        return { opacity: 0, y: distance };
    }
  };

  return (
    <motion.div
      variants={{
        hidden: getHidden(),
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            ease: FAST_EASE,
          },
        },
      }}
      style={GPU_STYLE}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 5. Fast Scale & Fade In
 */
export function ScaleIn({ children, className = "", delay = 0, duration = 0.35 }: BaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: FAST_EASE,
      }}
      style={GPU_STYLE}
      className={className}
    >
      {children}
    </motion.div>
  );
}
