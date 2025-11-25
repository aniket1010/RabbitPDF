export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");
    
    // Use NEXT_PUBLIC_APP_URL for redirects (not internal Docker hostname)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    if (!email || !token) {
      return NextResponse.redirect(new URL("/sign-in", appUrl));
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1) Try PendingUser token first (initial signup flow)
    const pendingUser = await (prisma as any).pendingUser.findFirst({
      where: { email: normalizedEmail, token, expiresAt: { gt: new Date() } },
    });

    let userId: string | null = null;

    if (pendingUser) {
      // If user already exists, mark verified; else create new user + account
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        await prisma.user.update({ where: { id: existingUser.id }, data: { emailVerified: true } });
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: pendingUser.email,
            name: pendingUser.name,
            image: pendingUser.image,
            emailVerified: true,
          },
        });
        await prisma.account.create({
          data: {
            userId: newUser.id,
            accountId: newUser.email,
            providerId: "credential",
            password: pendingUser.password, // already hashed
          },
        });
        userId = newUser.id;
      }

      // Cleanup pending user
      await (prisma as any).pendingUser.delete({ where: { id: pendingUser.id } }).catch(() => {});
    } else {
      // 2) Fallback to Verification table (existing unverified users)
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
          return NextResponse.redirect(new URL(`/sign-in?verified=1&email=${encodeURIComponent(normalizedEmail)}`, appUrl));
        }
        await prisma.user.update({ where: { id: existingUser.id }, data: { emailVerified: true } });
        await prisma.verification.delete({ where: { id: verification.id } }).catch(() => {});
        userId = existingUser.id;
      } else {
        return NextResponse.redirect(new URL(`/sign-in?email=${encodeURIComponent(normalizedEmail)}&verify_error=1`, appUrl));
      }
    }

    // If for some reason userId is still null, redirect to sign-in
    if (!userId) {
      return NextResponse.redirect(new URL(`/sign-in?email=${encodeURIComponent(normalizedEmail)}`, appUrl));
    }

    // 3) Create a session and redirect home
    // Use better-auth server API if available, otherwise fall back to sign-in page
    try {
      const api: any = (auth as any).api;
      if (api && typeof api.createSession === "function") {
        const sessionResponse: Response = await api.createSession({ userId }, { headers: request.headers });
        const redirect = NextResponse.redirect(new URL("/", appUrl));
        const setCookie = sessionResponse.headers.get("set-cookie");
        if (setCookie) {
          redirect.headers.append("set-cookie", setCookie);
        }
        return redirect;
      }
    } catch (e) {
      // Ignore and fall through to sign-in redirect
    }

    // Fallback: redirect to sign-in with verified flag
    return NextResponse.redirect(new URL(`/sign-in?verified=1&email=${encodeURIComponent(normalizedEmail)}`, appUrl));
  } catch (e) {
    // On error, send user to sign-in
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    return NextResponse.redirect(new URL(`/sign-in`, appUrl));
  }
}


