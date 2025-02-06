"use client";

import type { MouseEventHandler, PropsWithChildren } from "react";
import { createContext, memo, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export const DELAY = 200;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms)); // Optimized sleep function
const noop = () => {
  //
};

interface TransitionContext {
  pending: boolean;
  navigate: (url: string) => void;
}
const Context = createContext<TransitionContext>({
  pending: false,
  navigate: noop,
});
export const usePageTransition = () => use(Context);
export const usePageTransitionHandler = () => {
  const { navigate } = usePageTransition();
  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href) navigate(href);
  };

  return onClick;
};

type Props = PropsWithChildren<{
  className?: string;
}>;

export const Transitions = memo(({ children, className }: Props) => {
  // Wrapped in memo for performance
  const [pending, start] = useTransition();
  const router = useRouter();
  const navigate = (href: string) => {
    start(async () => {
      router.push(href);
      await sleep(DELAY);
    });
  };

  const onClick: MouseEventHandler<HTMLDivElement> = (e) => {
    const a = (e.target as Element).closest("a");
    if (a) {
      e.preventDefault();
      const href = a.getAttribute("href");
      if (href) navigate(href);
    }
  };

  return (
    <Context.Provider value={{ pending, navigate }}>
      <div onClickCapture={onClick} className={className}>
        {children}
      </div>
    </Context.Provider>
  );
});

export const Animate = memo(({ children, className }: Props) => {
  const { pending } = usePageTransition();

  return (
    <AnimatePresence>
      {!pending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
