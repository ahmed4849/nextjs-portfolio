"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { Input } from "../ui/input";

const ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
  "ed671d6c-7f87-40f4-8f76-94b8f181465f";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setSent(false);
    setStatus("");

    try {
      const formData = new FormData(form);

      // Spam honeypot: if bot filled it, silently show success without sending
      if (formData.get("website")) {
        setSent(true);
        setStatus("Message received. Thank you for reaching out.");
        form.reset();
        return;
      }

      formData.append("access_key", ACCESS_KEY);
      formData.append(
        "subject",
        `New Portfolio Message from ${formData.get("name") || "Visitor"}`,
      );

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not send your message. Please try again.",
        );
      }

      setSent(true);
      setStatus("Message received. Thank you for reaching out.");
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to send. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label htmlFor="contact-name">Your name</label>
        <label htmlFor="contact-email">Email address</label>
        <Input
          id="contact-name"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          placeholder="Your name"
        />
        <Input
          id="contact-email"
          name="email"
          required
          type="email"
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      <label htmlFor="contact-message">Tell me about your idea</label>
      <textarea
        id="contact-message"
        name="message"
        required
        minLength={10}
        maxLength={4000}
        rows={4}
        placeholder="What would you like to build?"
      />
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button primary" disabled={busy} type="submit">
        {busy ? "Sending…" : sent ? "Send another message" : "Send message"}
        {busy ? (
          <LoaderCircle className="spinner" size={18} />
        ) : (
          <ArrowUpRight size={18} />
        )}
      </button>
      <p
        className={`form-status ${status && !sent ? "error" : ""}`}
        role="status"
      >
        {sent && <CheckCircle2 size={16} />} {status}
      </p>
    </form>
  );
}
