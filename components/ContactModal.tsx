"use client";
import { useState } from "react";

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // Replace below with your backend/email API call
    try {
      // await sendEmail(form);
      setStatus("sent");
      setTimeout(onClose, 1200);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-navy)] border-2 border-[var(--color-electric)] rounded-2xl p-8 w-full max-w-xl relative shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl text-white/80 hover:text-[var(--color-coral)]"
          aria-label="Close"
        >
          ×
        </button>
        {/* Icon */}
        <div className="mb-2 mt-2">
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
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Contact Me
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <label className="text-white text-sm font-semibold" htmlFor="name">
            Your Name
          </label>
          <input
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
            {status === "sending"
              ? "Sending..."
              : status === "sent"
              ? "Sent!"
              : (
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
      </div>
    </div>
  );
}
