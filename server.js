// --- INSTALLATION INSTRUCTIONS ---
// 1. Run this command in your terminal at the root of your project:
//    npm install express cors resend
// 2. Start the server:
//    node server.js

import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Allows your React app to communicate with this server
app.use(express.json()); // Parses incoming JSON requests

// Initialize Resend with your API Key
const resend = new Resend('re_AqxgtE9w_EsYFkyyBy9Np3CApFZBMZbKf'); 

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Events And Pro <onboarding@resend.dev>', // Keep onboarding@resend.dev unless you verify a custom domain in Resend
      to,
      subject,
      html
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message || 'An error occurred while sending the email' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Email Server is running on http://localhost:${PORT}`);
});
