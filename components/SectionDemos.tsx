import DemoCard from './demos/DemoCard';

export default function SectionDemos({ id }: { id: string }) {
  return (
    <section
      id={id}
      className="
        snap-start min-h-screen 
        flex flex-col items-center justify-start md:justify-center 
        bg-gradient-to-tr from-black to-[var(--color-navy)]
        transition-colors duration-300
        pt-8 md:pt-0
        pb-20 
      "
      style={{ minHeight: '100dvh' }}
    >
      <h2 className="
        text-4xl md:text-5xl font-bold mb-10 
        text-[var(--color-electric)] drop-shadow-lg
        transition-colors duration-300
      ">
        AI Demos: Try Machine Learning Live!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-md md:max-w-5xl">
        <DemoCard demo="doodle" />
        <DemoCard demo="sentiment" />
        <DemoCard demo="playground" />
      </div>
    </section>
  );
}
