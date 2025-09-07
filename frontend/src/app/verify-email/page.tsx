"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AmbientBackground from "@/components/AmbientBackground";

type Status = "idle" | "verifying" | "pending" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const startVerify = useCallback(async () => {
    const currentToken = searchParams.get("token");
    const currentEmail = searchParams.get("email");

    if (!currentToken || !currentEmail) return;
    setStatus("verifying");
    setMessage("Verifying your email...");
    try {
      // Hit the new endpoint that verifies AND creates a session, then redirects
      const next = `/api/auth/email/verify-and-login?token=${encodeURIComponent(currentToken)}&email=${encodeURIComponent(currentEmail)}`;
      router.replace(next);
      return;
    } catch (e: unknown) {
      const message = typeof e === "object" && e && "message" in e ? String((e as { message?: unknown }).message) : undefined;
      setStatus("error");
      setMessage(message || "Verification link is invalid or expired.");
    }
  }, [searchParams, router]);

  const resend = useCallback(async () => {
    const currentEmail = searchParams.get("email");
    if (!currentEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/email/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("We re-sent the verification link. Check your inbox (and spam).");
      } else {
        setStatus("error");
        const data = await res.json().catch(() => ({}));
        setMessage(data?.error || "Could not resend the email. Please try again in a moment.");
      }
    } catch (e: unknown) {
      setStatus("error");
      const message = typeof e === "object" && e && "message" in e ? String((e as { message?: unknown }).message) : undefined;
      setMessage(message || "Could not resend the email. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // If token is provided (clicked from email), verify. Otherwise show instructions.
    const currentToken = searchParams.get("token");
    const currentEmail = searchParams.get("email");

    if (currentToken && currentEmail) {
      startVerify();
    } else {
      setStatus("pending");
      setMessage(
        currentEmail
          ? `Check your inbox to verify ${currentEmail}. Click the link we sent to finish creating your account.`
          : "This page needs a verification link from your email."
      );
    }
  }, [searchParams, startVerify]);

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

        {((status === "pending" || status === "error") && searchParams.get("email")) && (
          <div className="space-y-3">
            <Button
              onClick={resend}
              disabled={resending}
              className="w-full bg-black text-white hover:bg-black/90 transition-all duration-200 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:shadow-lg font-medium"
            >
              {resending ? "Resending..." : "Resend verification email"}
            </Button>
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
