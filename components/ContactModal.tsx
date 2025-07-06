"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "emailjs-com";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!; // From EmailJS "Email Services"
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!; // From EmailJS "Email Templates"
const USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID!; // From EmailJS "Account > API Keys"

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus trap and ESC close
  useEffect(() => {
    if (!open) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
    );
    function handleTab(e: KeyboardEvent) {
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.body.classList.add("overflow-hidden");
    document.addEventListener("keydown", handleTab);
    setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", handleTab);
    };
  }, [open, onClose]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    emailjs
      .send(
        SERVICE_ID,
        TEMPLATE_ID,
        form,
        USER_ID
      )
      .then(() => {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      })
      .catch(() => setStatus("error"));
  }

  function closeAndReset() {
    setStatus("idle");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-[var(--color-navy)] border-2 border-[var(--color-electric)] rounded-2xl p-8 w-full max-w-xl relative shadow-2xl flex flex-col items-center"
            initial={{ scale: 0.92, opacity: 0, y: 48 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 48 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
          >
            {/* Close button */}
            <button
              onClick={closeAndReset}
              className="absolute top-4 right-5 text-2xl text-white/80 hover:text-[var(--color-coral)] focus:outline-none"
              aria-label={status === "sent" ? "Close thank you modal" : "Close contact modal"}
              tabIndex={0}
              type="button"
            >
              ×
            </button>
            {/* Modal content: thank you or form */}
            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center min-h-[240px]">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1.04, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                >
                  {/* Envelope with check icon */}
                  <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
                    <rect x={6} y={13} width={44} height={30} rx={6} fill="#cc00e6" fillOpacity="0.16" />
                    <rect x={6} y={13} width={44} height={30} rx={6} stroke="#cc00e6" strokeWidth={2} />
                    <path d="M12 18l16 14 16-14" stroke="#cc00e6" strokeWidth={2.5} strokeLinecap="round" />
                    <circle cx={44} cy={18} r={8} fill="#1ea896" />
                    <path
                      d="M41.5 18.5l2.5 2.5 4.5-4.5"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <h2 className="text-2xl mt-6 mb-3 font-bold text-white text-center">
                  Thank You!
                </h2>
                <p className="text-base text-white/80 text-center mb-2 max-w-xs">
                  Your message has been sent. I’ll get back to you soon.
                </p>
                <button
                  onClick={closeAndReset}
                  className="mt-6 px-6 py-2.5 bg-[var(--color-electric)] rounded-lg text-white font-bold shadow-lg hover:bg-[var(--color-coral)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)]"
                  autoFocus
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Icon */}
                <div className="mb-2 mt-2" aria-hidden="true">
                  <svg
                    width={40}
                    height={40}
                    fill="none"
                    viewBox="0 0 40 40"
                    className="mx-auto"
                  >
                    <rect
                      x={4}
                      y={9}
                      width={32}
                      height={22}
                      rx={4}
                      fill="#cc00e6"
                      fillOpacity="0.12"
                    />
                    <rect
                      x={4}
                      y={9}
                      width={32}
                      height={22}
                      rx={4}
                      stroke="#cc00e6"
                      strokeWidth={2}
                    />
                    <path
                      d="M7.5 12.5L20 23L32.5 12.5"
                      stroke="#cc00e6"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h2
                  id="contact-modal-title"
                  className="text-3xl font-bold text-white mb-6 text-center"
                >
                  Contact Me
                </h2>
                <form
                  className="flex flex-col gap-5 w-full"
                  onSubmit={handleSubmit}
                >
                  <label className="text-white text-sm font-semibold" htmlFor="name">
                    Your Name
                  </label>
                  <input
                    ref={firstInputRef}
                    id="name"
                    name="name"
                    placeholder="Enter name"
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)] transition"
                    onChange={handleChange}
                    value={form.name}
                    required
                    autoComplete="name"
                  />
                  <label className="text-white text-sm font-semibold" htmlFor="email">
                    Your Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)] transition"
                    onChange={handleChange}
                    value={form.email}
                    required
                    autoComplete="email"
                  />
                  <label className="text-white text-sm font-semibold" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    placeholder="e.g. Collaboration, Feedback, Just Saying Hi"
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)] transition"
                    onChange={handleChange}
                    value={form.subject}
                    required
                    autoComplete="off"
                  />
                  <label className="text-white text-sm font-semibold" htmlFor="message">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Type your message"
                    rows={5}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)] transition resize-none"
                    onChange={handleChange}
                    value={form.message}
                    required
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex items-center justify-center gap-2 bg-[var(--color-electric)] text-white font-bold rounded-lg px-6 py-2.5 mt-2 hover:bg-[var(--color-coral)] transition-all text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-electric)]"
                  >
                    {status === "sending" ? "Sending..." : (
                      <>
                        Send Message
                        <svg width={20} height={20} fill="none" viewBox="0 0 20 20">
                          <path
                            d="M2 10h16M14 6l4 4-4 4"
                            stroke="white"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  {status === "error" && (
                    <p className="text-[var(--color-coral)] text-sm">
                      Could not send. Try again.
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
