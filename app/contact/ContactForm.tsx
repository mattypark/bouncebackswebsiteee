"use client";

import { useEffect, useState, type FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "w-full border border-bb-ink/15 bg-white px-4 py-3.5 text-base text-bb-ink outline-none transition-colors placeholder:text-bb-ink/30 focus:border-bb-mid";
const labelClass = "mb-2 block text-xs font-semibold tracking-[0.15em] uppercase text-bb-ink/60";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // the spam trap: hidden from people
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // The backend sleeps on Render's free tier; wake it while they type.
  useEffect(() => {
    fetch("/api/warm", { cache: "no-store" }).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email.trim()) || !message.trim()) {
      setStatus("error");
      setError("Please add your name, a valid email and a message.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't send that just now. Please try again.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "We couldn't send that just now. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="py-10 text-center" role="status">
        <p className="sport-kicker text-bb-mid">Message sent</p>
        <p className="sport-display mt-4 text-3xl md:text-4xl">Thanks, {name.trim().split(" ")[0]}.</p>
        <p className="mt-4 text-bb-ink/60">We&apos;ll reply to {email.trim()} soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="How can we help?"
          required
        />
      </div>

      {/* spam trap: off-screen and skipped by keyboards and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 bg-bb-ink py-4 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors hover:bg-bb-volt hover:text-bb-ink disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
