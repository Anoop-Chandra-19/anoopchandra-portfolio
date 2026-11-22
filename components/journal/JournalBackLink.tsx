"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

type JournalBackLinkProps = {
  href: string;
  children: ReactNode;
  peel?: boolean;
};

export default function JournalBackLink({ href, children, peel = false }: JournalBackLinkProps) {
  const { navigate } = useInkTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      !peel ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(href, { effect: "peel" });
  }

  return (
    <Link href={href} className="py-1.5 px-3.5 rounded-full border-[1.5px] border-ink bg-paper font-mono text-control text-ink no-underline hover:bg-ink hover:text-paper" onClick={handleClick}>
      {children}
    </Link>
  );
}
