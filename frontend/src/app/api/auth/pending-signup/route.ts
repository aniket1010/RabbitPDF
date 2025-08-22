export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name, image } = await req.json();
    
    if (!email || !password || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    });
    
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Check if there's already a pending signup for this email
  // Note: Some TS servers may not pick the latest Prisma types across multi-root workspaces.
  // Cast prisma to any to avoid a false TS error about `pendingUser` not existing.
  const existingPending = await (prisma as any).pendingUser.findUnique({
      where: { email: normalizedEmail }
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    if (existingPending) {
      // Update existing pending user
  await (prisma as any).pendingUser.update({
        where: { email: normalizedEmail },
        data: {
          name,
          password: hashedPassword,
          image: image || null,
          token,
          expiresAt,
        },
      });
    } else {
      // Create new pending user
  await (prisma as any).pendingUser.create({
        data: {
          email: normalizedEmail,
          name,
          password: hashedPassword,
          image: image || null,
          token,
          expiresAt,
        },
      });
    }

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const verifyUrl = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    const subject = "Verify your ChatPDF account";
    const html = `
      <p>Hi ${name || "there"},</p>
      <p>Thanks for signing up to ChatPDF. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>Or copy and paste this link: ${verifyUrl}</p>
      <p>This link expires in 30 minutes. If you did not sign up, please ignore this email.</p>
    `;
    const text = `Verify your ChatPDF account: ${verifyUrl}`;

    console.log(`[Signup] Sending verification email to: ${normalizedEmail}`);
    console.log(`[Signup] Verify URL: ${verifyUrl}`);
    
    await sendEmail({ to: normalizedEmail, subject, html, text });

    return NextResponse.json({ 
      success: true, 
      message: "Verification email sent. Please check your inbox." 
    });
    
  } catch (error) {
    console.error("[Signup] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
