import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

/**
 * GoTripo motion design tokens.
 * Use these everywhere instead of ad-hoc transitions to keep motion consistent.
 */
export const ease = [0.22, 1, 0.36, 1] as const; // smooth easeOut
export const easeInOut = [0.65, 0, 0.35, 1] as const;

export const dur = {
  xs: 0.18,
  sm: 0.28,
  md: 0.45,
  lg: 0.7,
} as const;

/* ---------- Variants ---------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: dur.md, ease } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.md, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: dur.md, ease } },
};

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

/* ---------- Components ---------- */

type FadeUpProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  /** Trigger only when scrolled into view */
  inView?: boolean;
};

export const FadeUp = forwardRef<HTMLDivElement, FadeUpProps>(function FadeUp(
  { children, delay = 0, inView = true, ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: dur.md, ease, delay } },
      };

  const viewportProps = inView
    ? { initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, amount: 0.2 } }
    : { initial: "hidden" as const, animate: "show" as const };

  return (
    <motion.div ref={ref} variants={variants} {...viewportProps} {...rest}>
      {children}
    </motion.div>
  );
});

type StaggerGroupProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  gap?: number;
  delay?: number;
  inView?: boolean;
};

export function StaggerGroup({
  children,
  gap = 0.08,
  delay = 0,
  inView = true,
  ...rest
}: StaggerGroupProps) {
  const reduce = useReducedMotion();
  const variants = reduce ? fadeIn : stagger(gap, delay);
  const viewportProps = inView
    ? { initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, amount: 0.15 } }
    : { initial: "hidden" as const, animate: "show" as const };

  return (
    <motion.div variants={variants} {...viewportProps} {...rest}>
      {children}
    </motion.div>
  );
}

/** A child of StaggerGroup that fades + lifts in. */
export function StaggerItem({ children, ...rest }: HTMLMotionProps<"div"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { opacity: 0, y: 16, scale: 0.985 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: dur.md, ease } },
      };
  return (
    <motion.div variants={variants} {...rest}>
      {children}
    </motion.div>
  );
}

/** Soft hover lift used for cards. Wraps children in a div. */
export function HoverLift({
  children,
  className,
  as: As = "div",
  ...rest
}: HTMLMotionProps<"div"> & { children: ReactNode; as?: "div" | "article" | "section" }) {
  const reduce = useReducedMotion();
  const Comp = motion[As] as typeof motion.div;
  return (
    <Comp
      className={className}
      whileHover={reduce ? undefined : { y: -6, scale: 1.015 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={{ duration: dur.sm, ease }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Page-level transition wrapper. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: dur.md, ease }}
    >
      {children}
    </motion.div>
  );
}
