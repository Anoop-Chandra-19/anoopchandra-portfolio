"use client";
import { useEffect } from "react";

export default function HydrationTrigger() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.add("hydrated"));
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}
