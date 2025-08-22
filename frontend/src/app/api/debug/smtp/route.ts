export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const passSet = Boolean(process.env.SMTP_PASS);
  const from = process.env.MAIL_FROM || user;

  try {
    // @ts-ignore optional dep
    const nodemailer: any = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: process.env.SMTP_PASS },
      tls: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    });

    const verifyResult = await transporter.verify().then(() => ({ ok: true })).catch((e: any) => ({ ok: false, error: String(e?.response || e?.message || e) }));

    return NextResponse.json({
      env: {
        SMTP_HOST: host,
        SMTP_PORT: port,
        SMTP_USER: user,
        SMTP_PASS: passSet ? `SET(${String(process.env.SMTP_PASS).length} chars)` : "NOT SET",
        MAIL_FROM: from,
        NODE_ENV: process.env.NODE_ENV,
      },
      verify: verifyResult,
      hints: [
        "Enable 2-Step Verification on the Gmail account",
        "Use a 16-char Gmail App Password with no spaces for SMTP_PASS",
        "SMTP_USER must match the Gmail account that created the app password",
        "Approve any new sign-in from Google Account > Security > Recent security activity",
      ],
    });
  } catch (e: any) {
    return NextResponse.json({
      error: "Failed to create transporter",
      detail: String(e?.message || e),
    }, { status: 500 });
  }
}
