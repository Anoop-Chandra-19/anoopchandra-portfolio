// The phone's stand-in for the desktop right margin. remark-gfm points every
// [^N] ref at the footnote list past the end of the entry; following that link
// costs the reader their place, so below the phone breakpoint the tap lifts that
// same list item into a bottom sheet and leaves the scroll position alone. Above
// it the ref stays an ordinary anchor into the list.
//
// The body is cloned out of the rendered list rather than passed in as data:
// footnotes are MDX and can carry emphasis, code and links, and cloning keeps
// all of it without a second render path for the same content.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import { PHONE_QUERY } from "@/lib/breakpoints";

type Open = { id: string; label: string; marker: Element; opener: HTMLAnchorElement };

export default function FootnoteSheet() {
  const [open, setOpen] = useState<Open | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(null), []);

  // Delegated, because the refs are server-rendered MDX output — there is no
  // React element for them to carry an onClick.
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const onClick = (e: MouseEvent) => {
      if (!mq.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
      // The pill's tap target is a ::after on the <sup>, not on the anchor, so
      // a thumb landing in the padding resolves through the sup.
      const ref = (e.target as Element | null)?.closest?.(".je-fnref");
      const a = ref?.querySelector<HTMLAnchorElement>("a[data-footnote-ref]");
      const id = a?.getAttribute("href")?.slice(1);
      if (!ref || !a || !id || !document.getElementById(id)) return;
      e.preventDefault();
      setOpen({ id, label: (a.textContent ?? "").trim(), marker: ref, opener: a });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Fill the sheet from the list item, and mark the ref it belongs to.
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    const src = document.getElementById(open.id);
    if (el && src) {
      const clone = src.cloneNode(true) as HTMLElement;
      // The ↩ backref exists to walk you back up the page; in the sheet the
      // journey never happened.
      clone.querySelectorAll("[data-footnote-backref]").forEach((a) => a.remove());
      const num = document.createElement("span");
      num.className = "n";
      num.textContent = `${open.label.padStart(2, "0")}.`;
      // The number belongs to the first line of the note, not a line of its own.
      (clone.firstElementChild ?? clone).prepend(num);
      el.replaceChildren(...clone.childNodes);
    }
    open.marker.classList.add("is-on");
    return () => open.marker.classList.remove("is-on");
  }, [open]);

  return (
    <BottomSheet
      open={open !== null}
      classPrefix="je-fnsheet"
      label="footnote"
      ariaLabel={open ? `footnote ${open.label}` : "footnote"}
      opener={open?.opener}
      onCloseAction={close}
      dismissQuery={PHONE_QUERY}
    >
      <div ref={bodyRef} />
    </BottomSheet>
  );
}
