// Simple SMTP mailer using Nodemailer (Brevo, SendGrid, SES SMTP, etc.)
// Make sure frontend/.env.local has SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function sendWithSMTP(args: SendArgs) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  console.log(`[Mailer] SMTP Config - Host: ${host}, Port: ${port}, User: ${user ? 'SET' : 'NOT SET'}, Pass: ${pass ? 'SET' : 'NOT SET'}`);
  
  if (!host || !port || !user || !pass) {
    console.error(`[Mailer] Missing SMTP config - Host: ${!!host}, Port: ${!!port}, User: ${!!user}, Pass: ${!!pass}`);
    return false;
  }
  
  try {
    // @ts-ignore - optional dep
    const nodemailer: any = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Gmail uses STARTTLS on 587
      auth: { user, pass },
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    });
    
    const from = process.env.MAIL_FROM || user;
    console.log(`[Mailer] Sending email from ${from} to ${args.to} with subject: ${args.subject}`);
    
    const result = await transporter.sendMail({ from, ...args });
    console.log(`[Mailer] Email sent successfully:`, result.messageId);
    return true;
  } catch (e: any) {
    console.error("[Mailer] SMTP failed:", e);
    if (e?.code === 'EAUTH' || String(e?.response || '').includes('535')) {
      console.error('[Mailer] Gmail auth failed. Tips:');
      console.error(' - Ensure 2-Step Verification is enabled for the account');
      console.error(' - Use a 16-char App Password (no spaces) for SMTP_PASS');
      console.error(' - SMTP_USER must be the same Gmail account the app password belongs to');
      console.error(' - Check Google Account > Security > Recent security activity (approve)');
    }
    return false;
  }
}

export async function sendEmail(args: SendArgs) {
  // Use SMTP only (Nodemailer). If not configured, log for dev.
  const ok = await sendWithSMTP(args);
  if (!ok) {
    console.log("=".repeat(60));
    console.log("📧 [DEV MODE] EMAIL WOULD BE SENT:");
    console.log(`To: ${args.to}`);
    console.log(`Subject: ${args.subject}`);
    console.log(`HTML: ${args.html}`);
    console.log("=".repeat(60));
    console.log("🔗 VERIFICATION LINK EXTRACTED:");
    
    // Extract verification link from HTML for easy testing
    const linkMatch = args.html.match(/href="([^"]*verify-email[^"]*)"/);
    if (linkMatch) {
      console.log(`✅ Copy this link to verify: ${linkMatch[1]}`);
    }
    console.log("=".repeat(60));
  }
}
