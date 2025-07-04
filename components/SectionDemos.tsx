import TerminalDemoSection from "./demos/DemoCard";

export default function SectionDemos({ id }: { id: string }) {
  return (
    <section
      id={id}
      className="
        min-h-screen 
        flex flex-col items-center justify-start
        bg-gradient-to-tr from-black to-[var(--color-navy)]
        transition-colors duration-300
        pt-40 pb-20
      "
      style={{ minHeight: '100dvh' }}
    >
      <TerminalDemoSection />
    </section>
  );
}
