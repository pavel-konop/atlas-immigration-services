export type ContactFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  consent: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactPayload(input: Partial<ContactPayload>): ContactFormState & { data?: ContactPayload } {
  const errors: Record<string, string> = {};
  const name = input.name?.trim() || "";
  const email = input.email?.trim() || "";
  const phone = input.phone?.trim();
  const service = input.service?.trim() || "";
  const message = input.message?.trim() || "";
  const consent = Boolean(input.consent);

  if (name.length < 2) errors.name = "Enter your name.";
  if (!emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (!service) errors.service = "Choose the area you want help with.";
  if (message.length < 12) errors.message = "Share a short note so Atlas can prepare.";
  if (!consent) errors.consent = "Confirm that Atlas may contact you about this enquiry.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }

  return {
    ok: true,
    message: "Thanks. Atlas has received your enquiry details.",
    data: { name, email, phone, service, message, consent }
  };
}
