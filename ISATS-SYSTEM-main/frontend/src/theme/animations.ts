import type { Variants, Transition } from 'framer-motion'

/**
 * Standard Transitions
 */
export const defaultTransition: Transition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1], // Cubic bezier smooth ease
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
}

/**
 * Page Transitions (Subtle opacity and slight vertical rise)
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
}

/**
 * Card Entrance Variants
 */
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
}

/**
 * Stagger Container for Grids and Lists
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
}

/**
 * Modal Entrance Variants
 */
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.15 },
  },
}

/**
 * Button Tap Micro-Interaction
 */
export const buttonTapMotion = {
  whileHover: { scale: 1.01 },
  whileTap:   { scale: 0.98 },
}
