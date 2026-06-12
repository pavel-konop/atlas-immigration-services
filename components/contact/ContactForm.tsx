"use client";

import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { services } from "@/content/services";
import type { ContactFormState } from "@/lib/forms/contact";

const initialState: ContactFormState = { ok: false, message: "" };

export function ContactForm() {
  const [state, setState] = useState<ContactFormState>(initialState);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        service: formData.get("service"),
        message: formData.get("message"),
        consent: formData.get("consent") === "on"
      })
    });

    const result = (await response.json()) as ContactFormState;
    setState(result);
    setPending(false);
    if (result.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-atlas-line bg-white p-6 shadow-soft" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" name="name" error={state.errors?.name} required />
        <Field label="Email" name="email" type="email" error={state.errors?.email} required />
        <Field label="Phone or WhatsApp" name="phone" error={state.errors?.phone} />
        <label className="grid gap-2 text-sm font-semibold text-atlas-navy">
          Area of support
          <select
            name="service"
            required
            aria-invalid={Boolean(state.errors?.service)}
            className="min-h-12 rounded-md border border-atlas-line bg-white px-3 text-base text-atlas-ink"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Not sure yet">Not sure yet</option>
          </select>
          {state.errors?.service ? <span className="text-sm text-red-700">{state.errors.service}</span> : null}
        </label>
      </div>
      <label className="mt-5 grid gap-2 text-sm font-semibold text-atlas-navy">
        How can Atlas help?
        <textarea
          name="message"
          required
          rows={6}
          aria-invalid={Boolean(state.errors?.message)}
          className="rounded-md border border-atlas-line px-3 py-3 text-base font-normal leading-7 text-atlas-ink"
        />
        {state.errors?.message ? <span className="text-sm text-red-700">{state.errors.message}</span> : null}
      </label>
      <label className="mt-5 flex gap-3 text-sm leading-6 text-slate-600">
        <input name="consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-atlas-line text-atlas-gold" />
        <span>Atlas may contact me about this enquiry using the details I provided.</span>
      </label>
      {state.errors?.consent ? <p className="mt-2 text-sm text-red-700">{state.errors.consent}</p> : null}
      {state.message ? (
        <p className={state.ok ? "mt-5 text-sm font-semibold text-green-700" : "mt-5 text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-atlas-gold px-6 py-3 text-sm font-semibold text-atlas-navy transition hover:bg-atlas-amber disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Send aria-hidden="true" className="h-4 w-4" />
        {pending ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  error
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-atlas-navy">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        className="min-h-12 rounded-md border border-atlas-line px-3 text-base font-normal text-atlas-ink"
      />
      {error ? <span className="text-sm text-red-700">{error}</span> : null}
    </label>
  );
}
