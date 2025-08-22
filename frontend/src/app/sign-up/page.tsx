"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AmbientBackground from "@/components/AmbientBackground";

export default function SignUp() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const router = useRouter();

	const emailError = useMemo(() => {
		if (!email) return null;
		const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
		return re.test(email) ? null : "Enter a valid email";
	}, [email]);

	const passwordError = useMemo(() => {
		if (!password) return null;
		return password.length >= 8 ? null : "Password must be at least 8 characters";
	}, [password]);

	const confirmError = useMemo(() => {
		if (!passwordConfirmation) return null;
		return passwordConfirmation === password ? null : "Passwords do not match";
	}, [passwordConfirmation, password]);

	const usernameError = useMemo(() => {
		return username.trim() ? null : "Username is required";
	}, [username]);

	const canSubmit = useMemo(() => {
		return !loading && !usernameError && !emailError && !passwordError && !confirmError && email && password && username;
	}, [loading, usernameError, emailError, passwordError, confirmError, email, password, username]);

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
							<CardTitle className="text-xl">Sign Up</CardTitle>
							<CardDescription className="text-white/70">Start using RabbitPDF</CardDescription>
						</div>
				</CardHeader>
				<CardContent>
					{formError && (
						<div className="mb-4 rounded-md border border-red-400/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
							{formError}
						</div>
					)}
					<div className="grid gap-5">
							<div className="grid gap-2">
								<Label htmlFor="username" className="text-white">Username</Label>
								<Input
									id="username"
									placeholder="rabbitfan"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									autoComplete="username"
									required
									aria-invalid={!!usernameError}
									aria-describedby={usernameError ? "username-error" : undefined}
									className="bg-[#262626] text-white placeholder-white/70 border-white/20 focus-visible:ring-white/50 focus-visible:ring-offset-0 focus:outline-none"
								/>
							</div>

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
								className="bg-[#262626] text-white placeholder-white/70 border-white/20 focus-visible:ring-white/50 focus-visible:ring-offset-0 focus:outline-none"
							/>
							{emailError && (
								<p id="email-error" className="mt-1 text-xs text-red-300">{emailError}</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="password" className="text-white">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="new-password"
									placeholder="••••••••"
									aria-invalid={!!passwordError}
									aria-describedby={passwordError ? "password-error" : undefined}
									required
									className="pr-10 bg-[#262626] text-white placeholder-white/70 border-white/20 focus-visible:ring-white/50 focus-visible:ring-offset-0 focus:outline-none"
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
							<p className="mt-1 text-xs text-white/60">Use at least 8 characters.</p>
							{passwordError && (
								<p id="password-error" className="mt-1 text-xs text-red-300">{passwordError}</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="password_confirmation" className="text-white">Confirm password</Label>
							<Input
								id="password_confirmation"
								type="password"
								value={passwordConfirmation}
								onChange={(e) => setPasswordConfirmation(e.target.value)}
								autoComplete="new-password"
								placeholder="••••••••"
								aria-invalid={!!confirmError}
								aria-describedby={confirmError ? "confirm-error" : undefined}
								required
								className="bg-[#262626] text-white placeholder-white/70 border-white/20 focus-visible:ring-white/50 focus-visible:ring-offset-0 focus:outline-none"
							/>
							{confirmError && (
								<p id="confirm-error" className="mt-1 text-xs text-red-300">{confirmError}</p>
							)}
						</div>
					</div>

						<div className="mt-6 space-y-4">
						<Button
							type="button"
							className="w-full bg-white text-black hover:bg-white/90"
							disabled={!canSubmit}
							onClick={async () => {
								setFormError(null);
								if (usernameError || emailError || passwordError || confirmError) {
									setFormError("Please fix the errors above and try again.");
									return;
								}
								if (!username || !email || !password) {
									setFormError("Username, email and password are required.");
									return;
								}

								const normalizedEmail = email.trim().toLowerCase();
								setLoading(true);
								try {
									const response = await fetch("/api/auth/pending-signup", {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({
											email: normalizedEmail,
											password,
											name: username.trim() || null,
										}),
									});
									const data = await response.json().catch(() => ({}));
									if (response.ok) {
										toast.success("Verification email sent! Check your inbox.");
										router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
									} else {
										setFormError(data?.error || "Sign up failed. Please try again.");
									}
								} catch {
									setFormError("Sign up failed. Please try again.");
								} finally {
									setLoading(false);
								}
							}}
						>
							{loading ? (
								<span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Creating...</span>
							) : (
								"Sign Up"
							)}
						</Button>

						<div className="text-center text-sm text-white/70">
							Already have an account? {" "}
							<Link href="/sign-in" className="underline underline-offset-4 text-white hover:text-white/90">Sign in</Link>
						</div>
						</div>

				</CardContent>
			</Card>
		</div>
		</AmbientBackground>
	);
}
