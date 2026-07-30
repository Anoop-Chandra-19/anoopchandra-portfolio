"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type Lenis from "lenis";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "summary",
  "[contenteditable]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const ROOT_LOCK_PROPERTIES = ["overflow", "overscroll-behavior"] as const;
const BODY_LOCK_PROPERTIES = [
  "overflow",
  "overscroll-behavior",
  "position",
  "top",
  "left",
  "width",
  "padding-right",
] as const;

type StyleSnapshot = Map<string, { value: string; priority: string }>;

type ScrollLockState = {
  count: number;
  scrollX: number;
  scrollY: number;
  root: HTMLElement;
  body: HTMLElement;
  rootStyles: StyleSnapshot;
  rootScrollBehavior: StyleSnapshot;
  bodyStyles: StyleSnapshot;
  lenis: Lenis | null;
  shouldRestartLenis: boolean;
};

type ModalEntry = { token: symbol; container: HTMLElement };

let scrollLock: ScrollLockState | null = null;
const modalStack: ModalEntry[] = [];
const inertSnapshots = new Map<HTMLElement, boolean>();
let bodyObserver: MutationObserver | null = null;

function captureStyles(element: HTMLElement, properties: readonly string[]): StyleSnapshot {
  return new Map(
    properties.map((property) => [
      property,
      {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      },
    ])
  );
}

function restoreStyles(element: HTMLElement, snapshot: StyleSnapshot): void {
  for (const [property, { value, priority }] of snapshot) {
    if (value) element.style.setProperty(property, value, priority);
    else element.style.removeProperty(property);
  }
}

function lockPageScroll(lenis: Lenis | null | undefined): () => void {
  if (scrollLock) {
    scrollLock.count += 1;
    return releasePageScroll;
  }

  const root = document.documentElement;
  const body = document.body;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const hasStableScrollbarGutter = getComputedStyle(root).scrollbarGutter.includes("stable");
  const scrollbarWidth = hasStableScrollbarGutter
    ? 0
    : Math.max(0, window.innerWidth - root.clientWidth);
  const bodyPaddingRight = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
  const shouldRestartLenis = Boolean(lenis && !lenis.isStopped);

  scrollLock = {
    count: 1,
    scrollX,
    scrollY,
    root,
    body,
    rootStyles: captureStyles(root, ROOT_LOCK_PROPERTIES),
    rootScrollBehavior: captureStyles(root, ["scroll-behavior"]),
    bodyStyles: captureStyles(body, BODY_LOCK_PROPERTIES),
    lenis: lenis ?? null,
    shouldRestartLenis,
  };

  if (shouldRestartLenis) lenis?.stop();

  root.style.setProperty("overflow", "hidden");
  root.style.setProperty("overscroll-behavior", "none");
  body.style.setProperty("overflow", "hidden");
  body.style.setProperty("overscroll-behavior", "none");
  body.style.setProperty("position", "fixed");
  body.style.setProperty("top", `${-scrollY}px`);
  body.style.setProperty("left", `${-scrollX}px`);
  body.style.setProperty("width", "100%");
  if (scrollbarWidth > 0) {
    body.style.setProperty("padding-right", `${bodyPaddingRight + scrollbarWidth}px`);
  }

  return releasePageScroll;
}

function releasePageScroll(): void {
  if (!scrollLock) return;

  scrollLock.count -= 1;
  if (scrollLock.count > 0) return;

  const state = scrollLock;
  scrollLock = null;

  state.root.style.setProperty("scroll-behavior", "auto");
  restoreStyles(state.body, state.bodyStyles);
  restoreStyles(state.root, state.rootStyles);
  window.scrollTo(state.scrollX, state.scrollY);
  restoreStyles(state.root, state.rootScrollBehavior);

  if (state.shouldRestartLenis) state.lenis?.start();
}

function refreshBackgroundInertness(): void {
  const topModal = modalStack.at(-1)?.container;
  if (!topModal) return;

  for (const child of document.body.children) {
    if (!(child instanceof HTMLElement)) continue;
    if (!inertSnapshots.has(child)) inertSnapshots.set(child, child.inert);
    child.inert = child.contains(topModal) ? (inertSnapshots.get(child) ?? false) : true;
  }
}

function registerModal(container: HTMLElement): symbol {
  const token = Symbol("modal");
  modalStack.push({ token, container });
  refreshBackgroundInertness();

  if (!bodyObserver) {
    bodyObserver = new MutationObserver(refreshBackgroundInertness);
    bodyObserver.observe(document.body, { childList: true });
  }

  return token;
}

function unregisterModal(token: symbol): void {
  const index = modalStack.findIndex((entry) => entry.token === token);
  if (index !== -1) modalStack.splice(index, 1);

  if (modalStack.length > 0) {
    refreshBackgroundInertness();
    return;
  }

  bodyObserver?.disconnect();
  bodyObserver = null;
  for (const [element, wasInert] of inertSnapshots) element.inert = wasInert;
  inertSnapshots.clear();
}

function isTopModal(token: symbol): boolean {
  return modalStack.at(-1)?.token === token;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest("[inert], [aria-hidden='true']") &&
      getComputedStyle(element).visibility !== "hidden" &&
      element.getClientRects().length > 0
  );
}

function focusWithoutScrolling(element: HTMLElement | null | undefined): void {
  element?.focus({ preventScroll: true });
}

type UseModalLifecycleOptions = {
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  onCloseAction: () => void;
  lenis: Lenis | null | undefined;
  opener?: HTMLElement | null;
};

/** Owns the complete lifecycle of a portalled modal: page isolation, focus,
 * keyboard dismissal, scroll freezing, and exact restoration on teardown. */
export function useModalLifecycle({
  isOpen,
  containerRef,
  initialFocusRef,
  onCloseAction,
  lenis,
  opener,
}: UseModalLifecycleOptions): void {
  const onCloseRef = useRef(onCloseAction);

  useEffect(() => {
    onCloseRef.current = onCloseAction;
  }, [onCloseAction]);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const activeElement = document.activeElement;
    const capturedOpener =
      opener ?? (activeElement instanceof HTMLElement && activeElement !== document.body ? activeElement : null);
    const token = registerModal(container);
    const unlockPageScroll = lockPageScroll(lenis);

    const focusInitial = () => {
      const initial = initialFocusRef.current;
      const focusable = getFocusableElements(container);
      focusWithoutScrolling(initial && container.contains(initial) ? initial : (focusable[0] ?? container));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal(token)) return;

      if (event.key === "Escape" && !event.isComposing) {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        focusWithoutScrolling(container);
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!container.contains(active)) {
        event.preventDefault();
        focusWithoutScrolling(event.shiftKey ? last : first);
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        focusWithoutScrolling(last);
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        focusWithoutScrolling(first);
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!isTopModal(token) || container.contains(event.target as Node)) return;
      focusInitial();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    focusInitial();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      unregisterModal(token);
      unlockPageScroll();

      if (
        capturedOpener?.isConnected &&
        !capturedOpener.inert &&
        !capturedOpener.closest("[inert]")
      ) {
        focusWithoutScrolling(capturedOpener);
      }
    };
  }, [containerRef, initialFocusRef, isOpen, lenis, opener]);
}
