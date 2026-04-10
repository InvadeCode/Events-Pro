import { Resend } from 'resend';

// Vercel automatically loads environment variables from your project settings
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Events And Pro <emails.liaisonit.com>', // Keep onboarding@resend.dev unless you verify a domain
      to,
      subject,
      html
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message || 'An error occurred while sending the email' });
  }
}
