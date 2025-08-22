"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AmbientBackground from "@/components/AmbientBackground";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  const emailError = useMemo(() => {
    if (!email) return null;
    const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    return re.test(email) ? null : "Enter a valid email";
  }, [email]);

  const canSubmit = email && password && !emailError && !loading;

  return (
    <AmbientBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
  <Card className="w-full max-w-md border border-white/20 bg-[#1E1E1E] text-white">
        <CardHeader>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14">
              <DotLottieReact
                src="https://lottie.host/41d0971c-d1c6-4f08-a29a-aefc83f45abb/PERTkoTdD2.lottie"
                loop
                autoplay
              />
            </div>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription className="text-white/70">Continue to Rabbit PDF</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {formError && (
            <div className="mb-5 rounded-md border border-red-400/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
              {formError}
            </div>
          )}
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                required
                className="bg-[#262626] text-white placeholder-white/70 border-white/20 focus-visible:ring-white/50"
              />
              {emailError && <p id="email-error" className="mt-1 text-xs text-red-300">{emailError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10 bg-[#262626] text-white placeholder-white/70 border-white/20 focus-visible:ring-white/50"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/80"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Button
                type="button"
                className="w-full bg-white text-black hover:bg-white/90"
                disabled={!canSubmit}
                onClick={async () => {
                setFormError(null);
                const normalizedEmail = email.trim().toLowerCase();
                setLoading(true);
                try {
                  await signIn.email(
                    { email: normalizedEmail, password },
                    {
                      onSuccess: () => {
                        toast.success("Signed in successfully");
                        const next = params.get("next");
                        router.push(next || "/");
                      },
                      onError: (ctx) => {
                        if (ctx.error?.message?.includes("Email not verified")) {
                          toast.error("Please verify your email first.");
                          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
                          return;
                        }
                        setFormError(ctx.error?.message || "Sign in failed. Check your email and password.");
                      },
                    }
                  );
                } catch {
                  setFormError("Sign in failed. Please try again.");
                } finally {
                  setLoading(false);
                }
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in...</span>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center text-sm text-white/70">
                Don&apos;t have an account? {" "}
                <Link href="/sign-up" className="underline underline-offset-4 text-white hover:text-white/90">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AmbientBackground>
  );
}
