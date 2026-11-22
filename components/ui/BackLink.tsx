"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

const KIND = {
  /** Journal pages. */
  pill: "py-1.5 px-3.5 rounded-full border-[1.5px] border-ink bg-paper font-mono text-control text-ink no-underline hover:bg-ink hover:text-paper",
  /** Lab pages: a box that lifts on hover. */
  box: "inline-flex items-center py-[7px] px-3.5 bg-paper border-[1.5px] border-ink rounded-[3px] cursor-pointer font-mono text-[13px] tracking-[0.5px] text-ink no-underline [transition:transform_0.12s] hover:[transform:translate(-2px,-1px)] hover:shadow-[2px_2px_0_color-mix(in_oklab,var(--color-ink)_14%,transparent)]",
} as const;

type BackLinkProps = {
  href: string;
  kind?: keyof typeof KIND;
  /** Leave through the ink transition's page peel. Modified clicks still open
      a plain link. */
  peel?: boolean;
  children: ReactNode;
};

export default function BackLink({ href, kind = "pill", peel = false, children }: BackLinkProps) {
  const { navigate } = useInkTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!peel || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    navigate(href, { effect: "peel" });
  }

  return (
    <Link href={href} className={KIND[kind]} onClick={handleClick}>
      {children}
    </Link>
  );
}
