export const panelSpring = { type: "spring" as const, stiffness: 380, damping: 32 };

export const intelligenceSlide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export const nodeStagger = (i: number) => ({
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
});
