/**
 * Outbound email.
 *
 * The shop talks to its customers on WhatsApp, so email is not the primary
 * channel and no provider is configured yet. Everything here is therefore
 * optional: with no RESEND_API_KEY the send reports that it did not happen,
 * and the caller falls back to the admin handing the link over by hand.
 *
 * Untested against the live API — nothing in this project has credentials for
 * it. Set the two variables and send one reset to yourself before relying on
 * it in front of customers.
 */
export type MailResult = { sent: boolean; error?: string };

export function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { sent: false, error: "mailer_not_configured" };

  const from = process.env.MAIL_FROM?.trim() || "Danial CN <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!res.ok) {
      return { sent: false, error: `resend_${res.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, error: "network" };
  }
}
