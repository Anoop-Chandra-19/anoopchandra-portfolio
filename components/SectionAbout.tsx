"use client";
import { motion } from "framer-motion";
import Image from "next/image";

// Replace with your real data!
const skills = [
  "Python", "TypeScript", "React", "Next.js", "FastAPI",
  "PyTorch", "LLM", "AWS", "MongoDB", "Docker", "Redis"
];

const education = [
  {
    degree: "BE, Electronics and Communications",
    school: "NMAM Institute of Technology, Nitte, Karnataka",
    date: "Nov 2022",
    gpa: "",
    color: "teal"
  },
  {
    degree: "MS, Applied Machine Intelligence",
    school: "Northeastern University, Boston, MA",
    date: "July 2025",
    gpa: "GPA: 3.86/4.0",
    color: "electric"
  }
];

export default function SectionAbout({ id }: { id: string }) {
  return (
    <section
      id={id}
      className="min-h-screen snap-start flex flex-col items-center justify-center bg-white dark:bg-[var(--color-navy)] relative px-4"
    >
      {/* Background accent */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[600px] h-[340px] bg-[radial-gradient(ellipse_at_center,_var(--color-coral)_18%,_transparent_70%)] blur-3xl opacity-15 pointer-events-none" />

      {/* Photo + Bio */}
      <motion.div
        className="flex flex-col md:flex-row items-center gap-10 max-w-4xl mx-auto z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        transition={{ staggerChildren: 0.12 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } }
        }}
      >
        {/* Headshot */}
        <motion.div
          className="rounded-full overflow-hidden border-4 border-[var(--color-electric)] shadow-lg w-36 h-36 md:w-44 md:h-44 shrink-0 bg-white dark:bg-navy"
          initial={{ opacity: 0, y: 40, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.08 }}
        >
          <Image
            src="/anoopchandra.jpg"
            alt="Anoop Chandra Parampalli"
            width={176}
            height={176}
            className="object-cover w-full h-full"
            priority
          />
        </motion.div>
        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.16 }}
        >
          <h2 className="text-4xl font-bold text-[var(--color-electric)] mb-3">About Me</h2>
          <p className="text-lg text-navy dark:text-white/90 max-w-xl">
            Hi, This is Anoop. <br />
            I build AI, custom PCs, and anything that can be torn down and rebuilt - always for the person, not just the specs.<br /><br />
            Whether it's designing a scalable LLM backend, tuning a transformer for music, or tracking down a loose screw in a PC build, I love creating tech that solves real problems and brings ideas to life.
          </p>
        </motion.div>
      </motion.div>

      {/* Skills */}
      <motion.div
        className="mt-10 flex flex-wrap gap-3 justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07 } }
        }}
      >
        {skills.map((skill, idx) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.24 + idx * 0.05 }}
            whileHover={{
              backgroundColor: "var(--color-coral)",
              color: "#fff",
              scale: 1.11,
              borderColor: "var(--color-coral)",
            }}
            className="bg-[var(--color-teal)]/30 text-xs px-3 py-1 rounded-full text-navy dark:text-white/90 border border-transparent hover:border-[var(--color-coral)] transition font-medium shadow-sm"
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>

      {/* Horizontal Timeline */}
      <motion.div
        className="w-full flex flex-col items-center mt-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } }
        }}
      >
        {/* Dots + line */}
        <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto" style={{ minHeight: 32 }}>
          {/* The horizontal line */}
          <div 
            className="absolute top-1/2 h-0.5 z-0"
            style={{
              left: 'calc(1rem + 0.5rem)',
              right: 'calc(1rem + 0.5rem)',
              background: 'linear-gradient(90deg, var(--color-teal) 0%, var(--color-electric) 100%)',
              opacity: 0.35,
              borderRadius: 9999,
              position: 'absolute',
              transform: 'translateY(-50%)',
            }} 
          />
          {/* Dots */}
          {education.map((ed, idx) => (
            <div key={ed.degree} className="flex-1 flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 + idx * 0.11 }}
                className={`w-4 h-4 rounded-full shadow-lg border-2 ${
                  ed.color === "electric"
                    ? "bg-[var(--color-electric)] border-[var(--color-electric)]"
                    : "bg-[var(--color-teal)] border-[var(--color-teal)]"
                }`}
              />
            </div>
          ))}
        </div>
        {/* Labels below the timeline */}
        <div className="flex w-full max-w-2xl mx-auto mt-4 gap-4 justify-between">
          {education.map((ed, idx) => (
            <div key={ed.degree} className="flex-1 flex flex-col items-center min-w-[120px]">
              <div className={`font-bold text-base mb-1 ${ed.color === "electric" ? "text-[var(--color-electric)]" : "text-[var(--color-teal)]"}`}>
                {ed.degree}
              </div>
              <div className="text-[15px] font-medium text-navy dark:text-white/90 text-center">{ed.school}</div>
              <div className="text-xs text-navy/80 dark:text-white/60 text-center">
                {ed.date}{ed.gpa && <span> - {ed.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Fun Fact / Builder Story */}
      <motion.div
        className="mt-12 max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.42 }}
      >
        <h3 className="text-xl font-bold text-[var(--color-coral)] mb-2">My AM5 Memory Fix Story</h3>
        <p className="text-md text-navy dark:text-white/80">
          So this is funny and (in hindsight) pretty interesting. I was building my new PC with a Ryzen 7 7800X3D - an amazing processor, but like most new tech, a little quirky.<br /><br />
          After hours of assembling everything, my rig refused to boot—just memory errors, no matter what I tried. Swapping RAM slots, one stick at a time, endless reboots... nothing worked. I even went to sleep disappointed, thinking I'd have to start all over.<br /><br />
          The next day, while doom-scrolling forums, I found a random post: <span className="italic">"Overtightening the CPU cooler can cause memory controller issues with AM5. Try loosening the screws."</span> At that point, why not? I loosened the cooler screws a little, powered on... and my PC started memory training!<br /><br />
          Twenty minutes later, Windows was installed and I was gaming. Lesson learned: sometimes the weirdest hardware bugs have the simplest (and least expected) fixes!
        </p>
      </motion.div>
    </section>
  );
}
