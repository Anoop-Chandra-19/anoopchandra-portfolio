import Label from "@/components/ui/Label";
import RouteLoader from "./RouteLoader";

/* For routes without a loader of their own (home, the journal index). It
   can't know the page's shape, so it stays a mark: the AP monogram with the
   highlighter sweeping under it. */
export default function MonogramLoader() {
  return (
    <RouteLoader
      label="Loading page"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-paper"
    >
      <div
        className="relative isolate accent text-[96px] leading-none tracking-[0.02em] text-electric"
        aria-hidden="true"
      >
        AP
        <span className="absolute -inset-x-2.5 bottom-3 h-6 -z-10 rounded-[3px_10px_4px_12px] bg-[color-mix(in_oklab,var(--color-electric)_22%,transparent)] -skew-x-10 origin-left animate-marker-sweep motion-reduce:animate-none" />
      </div>
      <Label kind="eyebrow" className="mt-[18px]" aria-hidden="true">
        loading…
      </Label>
    </RouteLoader>
  );
}
