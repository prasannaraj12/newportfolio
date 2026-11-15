"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
};

const styles = {
  primary:
    "bg-titanium-50 text-void hover:bg-white shadow-[0_0_0_1px_rgb(255_255_255/0.4),0_10px_40px_-10px_rgb(47_123_255/0.55)]",
  ghost:
    "text-titanium-100 border border-hairline-strong hover:border-volt/60 hover:text-white bg-white/[0.02] backdrop-blur-sm",
};

/** Pill link that leans toward the cursor (Motion springs). */
export function MagneticLink({ href, children, variant = "ghost", external, className = "" }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const lenis = useLenis();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const onClick = (e: React.MouseEvent) => {
    if (!external && href.startsWith("#") && lenis) {
      e.preventDefault();
      lenis.scrollTo(href, { offset: 0, duration: 1.6 });
    }
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium tracking-tight transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt ${styles[variant]} ${className}`}
    >
      {children}
    </motion.a>
  );
}
