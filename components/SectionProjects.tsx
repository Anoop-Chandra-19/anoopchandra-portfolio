export default function SectionProjects({id} : { id: string }) {
  return (
    <section id={id} className="min-h-screen flex items-center justify-center bg-[var(--color-navy)] snap-start">
      <h1 className="text-5xl font-bold text-[var(--color-electric)]">Projects Section</h1>
    </section>
  );
}
