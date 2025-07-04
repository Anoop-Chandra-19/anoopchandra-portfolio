"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  SiPython, SiTypescript, SiReact, SiNextdotjs, SiFastapi, SiPytorch,
  SiAmazonwebservices, SiMongodb, SiDocker, SiRedis, SiKubernetes, SiGit, SiTensorflow, SiPostgresql,
  SiHuggingface
} from "react-icons/si";
import { TbRobot } from "react-icons/tb";

const skills = [
  { name: "Python", icon: <SiPython color="#3677A9" size={28} /> },
  { name: "TypeScript", icon: <SiTypescript color="#3178C6" size={28} /> },
  { name: "React", icon: <SiReact color="#61DBFB" size={28} /> },
  { name: "Next.js", icon: <SiNextdotjs color="#fff" size={28} /> },
  { name: "LLM", icon: <TbRobot color="#cc00e6" size={28} /> },
  { name: "PyTorch", icon: <SiPytorch color="#EE4C2C" size={28} /> },
  { name: "TensorFlow", icon: <SiTensorflow color="#FF6F00" size={28} /> },
  { name: "Hugging Face", icon: <SiHuggingface color="#FFD21E" size={28} /> },
  { name: "FastAPI", icon: <SiFastapi color="#009688" size={28} /> },
  { name: "AWS", icon: <SiAmazonwebservices color="#FF9900" size={28} /> },
  { name: "Docker", icon: <SiDocker color="#2496ED" size={28} /> },
  { name: "Kubernetes", icon: <SiKubernetes color="#326ce5" size={28} /> },
  { name: "PostgreSQL", icon: <SiPostgresql color="#336791" size={28} /> },
  { name: "MongoDB", icon: <SiMongodb color="#4DB33D" size={28} /> },
  { name: "Redis", icon: <SiRedis color="#DC382D" size={28} /> },
  { name: "Git", icon: <SiGit color="#F1502F" size={28} /> },
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
      className="relative min-h-screen snap-start bg-gradient-to-br from-black to-[var(--color-navy)] px-4"
    >
      {/* Background accent */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[600px] h-[340px] bg-[radial-gradient(ellipse_at_center,_var(--color-coral)_18%,_transparent_70%)] blur-3xl opacity-15 pointer-events-none" />
      
      {/* Container */}
      <div className="max-w-5xl mx-auto flex flex-col gap-10 pt-24 md:px-0 px-2">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-[var(--color-electric)] mb-4 text-left"
        >
          <span role="img" aria-label="wave">👋</span> About Me
        </motion.h2>

        {/* Photo + Profile */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
          <motion.div
            className="rounded-full overflow-hidden border-4 border-[var(--color-electric)] shadow-lg w-36 h-36 md:w-44 md:h-44 shrink-0 bg-navy"
            initial={{ scale: 0.88, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.08, boxShadow: "0 8px 40px 0 #cc00e655" }}
            transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.16 }}
            viewport={{ once: true }}
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
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.22 }}
            viewport={{ once: true }}
            className="bg-[#23263A] rounded-xl shadow p-6 flex flex-col gap-2 w-full md:max-w-2xl"
          >
            <div className="text-lg font-bold text-white mb-1">Anoopchandra Parampalli</div>
            <div className="text-[var(--color-coral)] font-medium text-xs uppercase mb-1">AI/ML Engineer • Boston, MA</div>
            <div className="text-white/70 text-sm">
              <span className="font-medium">Email:</span> <a href="mailto:anoopchandraparampalli@email.com" className="hover:underline">anoopchandraparampalli@email.com</a>
            </div>
            <div className="text-white/70 text-sm">
              <span className="font-medium">Fun fact:</span> Can debug PC builds in under 10 minutes!
            </div>
          </motion.div>
        </div>

        {/* Bio + Story in unified container */}
        <div className="w-full">
          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.32 }}
            viewport={{ once: true }}
            className="text-lg text-white/90 mt-3 mb-5 text-left w-full"
          >
            I build AI, custom PCs, and anything else that can be torn down and rebuilt – always for the person, not just the specs.<br /><br />
            Whether it's designing a scalable LLM backend, tuning a transformer for music, or tracking down a loose screw in a PC build, I love creating tech that solves real problems and brings ideas to life.
          </motion.p>
        </div>

        {/* Skills Grid */}
        <motion.div
          className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 justify-start bg-transparent py-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } }
          }}
        >
          {skills.map((skill, idx) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 16, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 27, delay: 0.2 + idx * 0.03 }}
              whileHover={{
                backgroundColor: "var(--color-coral)",
                color: "#fff",
                scale: 1.07,
                borderColor: "var(--color-coral)",
              }}
              className="flex flex-col items-center justify-center bg-black/50 border border-teal-700 rounded-xl p-4 shadow hover:border-[var(--color-teal)] transition cursor-pointer min-h-[82px]"
            >
              <div className="mb-2">{skill.icon}</div>
              <div className="text-teal-200 text-base font-semibold tracking-wide">{skill.name}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
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
          <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto" style={{ minHeight: 32 }}>
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
          <div className="flex w-full max-w-2xl mx-auto mt-4 gap-4 justify-between">
            {education.map((ed, idx) => (
              <div key={ed.degree} className="flex-1 flex flex-col items-center min-w-[120px]">
                <div className={`font-bold text-base mb-1 ${ed.color === "electric" ? "text-[var(--color-electric)]" : "text-[var(--color-teal)]"}`}>
                  {ed.degree}
                </div>
                <div className="text-[15px] font-medium text-white/90 text-center">{ed.school}</div>
                <div className="text-xs text-white/60 text-center">
                  {ed.date}{ed.gpa && <span> - {ed.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fun Fact / Builder Story */}
        <motion.div
          className="w-full text-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.52 }}
        >
          <h3 className="text-xl font-bold text-[var(--color-coral)] mb-2">My AM5 Memory Fix Story</h3>
          <p className="text-md text-white/80">
            So this is funny and (in hindsight) pretty interesting. I was building my new PC with a Ryzen 7 7800X3D - an amazing processor, but like most new tech, a little quirky.<br /><br />
            After hours of assembling everything, my rig refused to boot—just memory errors, no matter what I tried. Swapping RAM slots, one stick at a time, endless reboots... nothing worked. I even went to sleep disappointed, thinking I'd have to start all over.<br /><br />
            The next day, while doom-scrolling forums, I found a random post: <span className="italic">"Overtightening the CPU cooler can cause memory controller issues with AM5. Try loosening the screws."</span> At that point, why not? I loosened the cooler screws a little, powered on... and my PC started memory training!<br /><br />
            Twenty minutes later, Windows was installed and I was gaming. Lesson learned: sometimes the weirdest hardware bugs have the simplest (and least expected) fixes!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
