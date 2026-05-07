export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "var(--paper)" }}
    >
      <div
        className="hand"
        style={{
          fontSize: 96,
          color: "var(--electric)",
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        AP
      </div>
      <div
        className="mono faint"
        style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginTop: 18 }}
      >
        loading…
      </div>
    </div>
  );
}
