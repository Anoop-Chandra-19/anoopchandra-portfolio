"use client";

import { useCurrentDate } from "@/hooks/useCurrentDate";

const MONTH_AND_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
});

export default function Postmark() {
  const currentDate = useCurrentDate();
  const monthAndDay = currentDate ? MONTH_AND_DAY.format(currentDate).toUpperCase() : "";
  const year = currentDate ? String(currentDate.getFullYear()) : "";

  return (
    <svg
      viewBox="0 0 130 130"
      width="110"
      height="110"
      aria-hidden="true"
      className="contact-postmark shrink-0 opacity-[0.78]"
      style={{ transform: "rotate(-9deg)" }}
    >
      <circle cx="65" cy="65" r="58" fill="none" stroke="var(--color-electric)" strokeWidth="1.6" />
      <circle cx="65" cy="65" r="48" fill="none" stroke="var(--color-electric)" strokeWidth="1.2" />
      <defs>
        <path id="pm-top" d="M 17 65 A 48 48 0 0 1 113 65" />
        <path id="pm-bot" d="M 17 65 A 48 48 0 0 0 113 65" />
      </defs>
      <text fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
        <textPath href="#pm-top" startOffset="50%" textAnchor="middle">
          CLEVELAND · OH
        </textPath>
      </text>
      <text fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
        <textPath href="#pm-bot" startOffset="50%" textAnchor="middle">
          VIA THE WEB
        </textPath>
      </text>
      <text x="65" y="62" textAnchor="middle" fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="500">
        {monthAndDay}
      </text>
      <text x="65" y="76" textAnchor="middle" fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="500">
        {year}
      </text>
      <line x1="113" y1="58" x2="170" y2="58" stroke="var(--color-electric)" strokeWidth="1.2" />
      <line x1="113" y1="65" x2="170" y2="65" stroke="var(--color-electric)" strokeWidth="1.2" />
      <line x1="113" y1="72" x2="170" y2="72" stroke="var(--color-electric)" strokeWidth="1.2" />
    </svg>
  );
}
