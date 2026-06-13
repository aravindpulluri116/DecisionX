import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
};

export function MagneticButton({ children, onClick, variant = "primary", className = "" }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const base =
    "group relative inline-flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-ink text-background hover:bg-signal"
      : "border border-ink/15 text-ink hover:border-ink";

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      className={`${base} ${styles} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </motion.button>
  );
}