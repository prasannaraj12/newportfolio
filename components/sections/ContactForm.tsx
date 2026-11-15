"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/content";

/**
 * Backend-free contact form: composes an email in the visitor's own mail
 * client (mailto). Nothing is stored or sent to any server.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = topic.trim() || "Hello from your portfolio";
    const body = `${message.trim()}\n\n— ${name.trim()}`;
    window.location.href = `mailto:${profile.links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  const field =
    "w-full border-0 border-b border-titanium-500/50 bg-transparent px-0 py-3 text-[1.05rem] text-titanium-50 placeholder:text-titanium-500 focus:border-terracotta focus:outline-none focus:ring-0";

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} autoComplete="name" />
        </label>
        <label className="block">
          <span className="sr-only">Subject</span>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is it about?" className={field} />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">Message</span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about the idea."
          className={`${field} resize-none`}
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.78rem] text-titanium-500" aria-live="polite">
          {opened ? "Your mail app should now be open with the message ready." : "Opens your mail app — nothing is stored."}
        </p>
        <button
          type="submit"
          className="group inline-flex items-center gap-2 bg-ivory px-6 py-3 text-[0.95rem] font-medium text-burgundy transition-colors hover:bg-rose"
        >
          Write the email
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}
