"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentToken, email: currentEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Verification failed");
      }
      setStatus("success");
      setMessage("Email verified! You can now sign in.");

      // Remove token from URL after successful verification
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("token");
      router.replace(`/verify-email?${newSearchParams.toString()}`);
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
