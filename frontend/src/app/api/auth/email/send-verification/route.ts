export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  // Try pending user flow first (brand-new signup that hasn't created a User yet)
  const pendingUser = await (prisma as any).pendingUser.findUnique({ where: { email: normalizedEmail } });

  // If neither pending nor user exists, return generic ok (privacy)
  if (!pendingUser && !user) {
    return NextResponse.json({ ok: true });
  }

  // If already verified, return ok
  if (user?.emailVerified) {
    return NextResponse.json({ ok: true });
  }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    if (pendingUser) {
      // Regenerate token on pending user and email it
      await (prisma as any).pendingUser.update({
        where: { email: normalizedEmail },
        data: { token, expiresAt },
      });
    } else if (user && !user.emailVerified) {
      // Store or upsert verification token for existing unverified user
      await prisma.verification
        .create({
          data: {
            identifier: `email-verify:${normalizedEmail}`,
            value: token,
            expiresAt,
          },
        })
        .catch(async () => {
          // If unique constraint collision, replace with new token
          const existing = await prisma.verification.findFirst({
            where: { identifier: `email-verify:${normalizedEmail}` },
          });
          if (existing) {
            await prisma.verification.update({
              where: { id: existing.id },
              data: { value: token, expiresAt },
            });
          }
        });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const verifyUrl = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    const subject = "Verify your RabbitPDF account";
    const html = `
      <p>Hi,</p>
      <p>Thanks for signing up to RabbitPDF. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link expires in 30 minutes. If you did not sign up, please ignore this email.</p>
    `;
    const text = `Verify your RabbitPDF account: ${verifyUrl}`;
  await sendEmail({ to: normalizedEmail, subject, html, text });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
