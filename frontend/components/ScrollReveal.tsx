"use client";
import React from "react";
import { motion } from "framer-motion";

interface BaseProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * 1. Smooth Fade In + Slide Up
 */
export function FadeIn({ children, className = "", delay = 0, duration = 0.6 }: BaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 2. Directional Slide In (Left, Right, Up, Down)
 */
interface SlideInProps extends BaseProps {
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
}

export function SlideIn({
  children,
  className = "",
  direction = "left",
  distance = 60,
  delay = 0,
  duration = 0.7,
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
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3. Stagger Container for Grids and Lists
 */
interface StaggerContainerProps extends BaseProps {
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.15,
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 4. Stagger Item for Grid Cards / List Items
 */
interface StaggerItemProps extends BaseProps {
  direction?: "up" | "left" | "right";
  distance?: number;
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 35,
  duration = 0.6,
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
            ease: [0.215, 0.61, 0.355, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 5. Scale & Fade In for Badges / Widgets
 */
export function ScaleIn({ children, className = "", delay = 0, duration = 0.6 }: BaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
