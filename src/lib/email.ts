import { Resend } from 'resend';

type SendFeedbackEmailInput = {
  subject: string;
  html: string;
  text: string;
};

export async function sendFeedbackEmail({ subject, html, text }: SendFeedbackEmailInput): Promise<boolean> {
  const { RESEND_API_KEY, RESEND_FROM, FEEDBACK_EMAIL_TO } = process.env;

  if (!RESEND_API_KEY || !RESEND_FROM || !FEEDBACK_EMAIL_TO) {
    console.warn('Feedback email skipped: RESEND_API_KEY, RESEND_FROM, or FEEDBACK_EMAIL_TO is missing.');
    return false;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: FEEDBACK_EMAIL_TO,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend feedback email failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Feedback email failed:', error);
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
