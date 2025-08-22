export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();
    if (!email || !token) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    // Try PendingUser token first (initial signup flow)
    const pendingUser = await (prisma as any).pendingUser.findFirst({
      where: {
        email: normalizedEmail,
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (pendingUser) {
      // If user already exists (rare), just verify it and clean up pending
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        await prisma.user.update({ where: { id: existingUser.id }, data: { emailVerified: true } });
        await (prisma as any).pendingUser.delete({ where: { id: pendingUser.id } });
        return NextResponse.json({ ok: true });
      }

      // Create the actual user from pending data
      const newUser = await prisma.user.create({
        data: {
          email: pendingUser.email,
          name: pendingUser.name,
          image: pendingUser.image,
          emailVerified: true,
        },
      });

      // Create account with password for better-auth (password already hashed)
      await prisma.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.email,
          providerId: "credential",
          password: pendingUser.password,
        },
      });

      // Clean up pending user
      await (prisma as any).pendingUser.delete({ where: { id: pendingUser.id } });
      return NextResponse.json({ ok: true });
    }

    // If not found in PendingUser, try Verification table (resend for existing unverified users)
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: `email-verify:${normalizedEmail}`,
        value: token,
        expiresAt: { gt: new Date() },
      },
    });

    if (verification) {
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!existingUser) {
        return NextResponse.json({ error: "No user associated with this verification link." }, { status: 400 });
      }

      await prisma.user.update({ where: { id: existingUser.id }, data: { emailVerified: true } });
      // Optionally cleanup verification token
      await prisma.verification.delete({ where: { id: verification.id } }).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });

  } catch (e) {
    console.error("[Email Verify] Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
