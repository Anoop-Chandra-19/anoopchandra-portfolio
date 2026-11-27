"use client";
import { usePathname } from "next/navigation";

/** The current route without its leading slash, e.g. `lab/doodle`. A loader
    gets no params, but the URL has already changed when it shows. */
export default function CurrentPath() {
  return usePathname().replace(/^\//, "");
}
