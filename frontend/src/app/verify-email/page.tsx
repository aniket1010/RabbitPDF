"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AmbientBackground from "@/components/AmbientBackground";

type Status = "idle" | "verifying" | "pending" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);

  const { token, email } = useMemo(() => {
    if (typeof window === "undefined") return { token: null as string | null, email: null as string | null };
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get("token"),
      email: params.get("email"),
    };
  }, []);

  const startVerify = useCallback(async () => {
    if (!token || !email) return;
    setStatus("verifying");
    setMessage("Verifying your email...");
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Verification failed");
      }
      setStatus("success");
      setMessage("Email verified! You can now sign in.");
    } catch (e: unknown) {
      const message = typeof e === "object" && e && "message" in e ? String((e as { message?: unknown }).message) : undefined;
      setStatus("error");
      setMessage(message || "Verification link is invalid or expired.");
    }
  }, [token, email]);

  const resend = useCallback(async () => {
    if (!email) return;
    setResending(true);
    try {
      await fetch("/api/auth/email/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage("We re-sent the verification link. Check your inbox (and spam). The link expires in 30 minutes.");
    } catch {
      setMessage("Could not resend the email. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  }, [email]);

  useEffect(() => {
    // If token is provided (clicked from email), verify. Otherwise show instructions.
    if (token && email) {
      startVerify();
    } else {
      setStatus("pending");
      setMessage(
        email
          ? `Check your inbox to verify ${email}. Click the link we sent to finish creating your account.`
          : "This page needs a verification link from your email."
      );
    }
  }, [token, email, startVerify]);

  return (
    <AmbientBackground>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Verify Email</h1>
        <p
          className={
            status === "error"
              ? "text-red-600"
              : status === "success"
              ? "text-green-600"
              : "text-muted-foreground"
          }
        >
          {message}
        </p>

        {status === "pending" && email && (
          <div className="space-y-3">
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              onClick={resend}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend verification email"}
            </button>
            <div className="text-xs text-muted-foreground">
              Didn’t get it? Check your spam folder or try resending.
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="pt-2">
            <Link href="/sign-in" className="underline">Go to Sign in</Link>
          </div>
        )}
        </div>
      </div>
    </AmbientBackground>
  );
}
