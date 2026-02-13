"use client";

/**
 * AuthForm Component
 *
 * Dual-mode form for email/password authentication:
 * - Sign Up: username, email, password, confirm password
 * - Sign In: email, password
 *
 * On sign-up success → redirect to step-2-dob
 * On sign-in success → check if profile exists → step-2-dob or /home
 */

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { routeByRole } from "@/lib/roleRouter";

type AuthMode = "signin" | "signup";

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export default function AuthForm() {
    const router = useRouter();

    const [mode, setMode] = useState<AuthMode>("signup");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // Form fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ── Validation ──────────────────────────────────────────
    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        // Username (sign-up only)
        if (mode === "signup") {
            if (!username.trim()) {
                newErrors.username = "Username is required.";
            } else if (username.trim().length < 3) {
                newErrors.username = "Username must be at least 3 characters.";
            } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
                newErrors.username =
                    "Username can only contain letters, numbers, and underscores.";
            }
        }

        // Email
        if (!email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }

        // Password
        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters.";
        }

        // Confirm password (sign-up only)
        if (mode === "signup") {
            if (!confirmPassword) {
                newErrors.confirmPassword = "Please confirm your password.";
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit Handler ──────────────────────────────────────
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const supabase = createClient();

            if (mode === "signup") {
                // ── Sign Up ─────────────────────────────────────
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                });

                if (error) {
                    console.error("[Soirée Auth] Sign-up error:", {
                        message: error.message,
                        status: error.status,
                        code: error.code,
                        name: error.name,
                    });
                    setErrors({ general: mapAuthError(error.message, error.status) });
                    setLoading(false);
                    return;
                }

                // Supabase may return a user with a fake ID if email confirmations
                // are enabled but the email is already registered
                if (data?.user?.identities?.length === 0) {
                    setErrors({ general: "An account with this email already exists. Try signing in." });
                    setLoading(false);
                    return;
                }

                // Store username for later profile creation
                sessionStorage.setItem("soiree_username", username.trim());
                router.push("/onboarding/step-2-dob");
            } else {
                // ── Sign In ─────────────────────────────────────
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

                if (error) {
                    console.error("[Soirée Auth] Sign-in error:", {
                        message: error.message,
                        status: error.status,
                        code: error.code,
                        name: error.name,
                    });
                    setErrors({ general: mapAuthError(error.message, error.status) });
                    setLoading(false);
                    return;
                }

                // Check if profile exists
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("id, role")
                        .eq("id", user.id)
                        .single();

                    if (profile) {
                        // Route based on role
                        const destination = await routeByRole(user.id);
                        router.push(destination);
                    } else {
                        router.push("/onboarding/step-2-dob");
                    }
                }
            }
        } catch (err) {
            // Catch network errors, unexpected crashes, etc.
            console.error("[Soirée Auth] Unexpected error:", err);
            setErrors({
                general: "Connection error. Please check your internet and try again.",
            });
            setLoading(false);
        }
    };

    // ── Toggle mode ─────────────────────────────────────────
    const toggleMode = () => {
        setMode(mode === "signin" ? "signup" : "signin");
        setErrors({});
        setPassword("");
        setConfirmPassword("");
    };

    // ── Input styling ───────────────────────────────────────
    const inputClass = (hasError: boolean) =>
        `h-14 w-full rounded-xl border bg-surface px-4 text-foreground text-base placeholder:text-foreground-muted outline-none transition-all duration-200 focus:ring-2 ${hasError
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-border focus:border-accent focus:ring-accent/20"
        }`;

    return (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
            {/* Username (sign-up only) */}
            {mode === "signup" && (
                <div className="animate-fade-in flex flex-col gap-1.5">
                    <label htmlFor="username" className="text-sm font-medium text-foreground-muted">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className={inputClass(!!errors.username)}
                        autoComplete="username"
                        autoCapitalize="off"
                    />
                    {errors.username && <FieldError message={errors.username} />}
                </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground-muted">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass(!!errors.email)}
                    autoComplete="email"
                    autoCapitalize="off"
                />
                {errors.email && <FieldError message={errors.email} />}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground-muted">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={inputClass(!!errors.password)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                {errors.password && <FieldError message={errors.password} />}
            </div>

            {/* Confirm Password (sign-up only) */}
            {mode === "signup" && (
                <div className="animate-fade-in flex flex-col gap-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground-muted">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className={inputClass(!!errors.confirmPassword)}
                        autoComplete="new-password"
                    />
                    {errors.confirmPassword && <FieldError message={errors.confirmPassword} />}
                </div>
            )}

            {/* General error */}
            {errors.general && (
                <div
                    className="animate-fade-in rounded-xl bg-error-surface px-4 py-3 text-sm text-error"
                    role="alert"
                >
                    {errors.general}
                </div>
            )}

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="mt-2 h-14 w-full rounded-2xl bg-accent font-semibold text-white text-base transition-all duration-200 hover:bg-accent-glow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Spinner />
                        {mode === "signup" ? "Creating Account…" : "Signing In…"}
                    </span>
                ) : mode === "signup" ? (
                    "Create Account"
                ) : (
                    "Sign In"
                )}
            </button>

            {/* Mode toggle */}
            <p className="text-center text-sm text-foreground-muted">
                {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
                <button
                    type="button"
                    onClick={toggleMode}
                    className="font-medium text-accent underline underline-offset-2 transition-colors hover:text-accent-glow"
                >
                    {mode === "signup" ? "Sign In" : "Sign Up"}
                </button>
            </p>
        </form>
    );
}

// ── Helper: Map Supabase auth errors to user-friendly messages ─
function mapAuthError(message: string, status?: number): string {
    // Server-side error — likely a Supabase config issue
    if (status && status >= 500) {
        console.error(`[Soirée Auth] Server error ${status}: ${message}`);
        return `Server error (${status}). This usually means Supabase email auth needs to be configured. Check your Supabase Dashboard → Authentication → Settings.`;
    }

    const lower = message.toLowerCase();
    if (lower.includes("already registered") || lower.includes("already been registered")) {
        return "An account with this email already exists. Try signing in.";
    }
    if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
        return "Invalid email or password. Please try again.";
    }
    if (lower.includes("email not confirmed")) {
        return "Please check your email and confirm your account before signing in.";
    }
    if (lower.includes("rate limit")) {
        return "Too many attempts. Please wait a moment and try again.";
    }
    if (lower.includes("signup is disabled")) {
        return "Sign-up is currently disabled. Please enable email sign-ups in the Supabase Dashboard.";
    }
    return message;
}

// ── Subcomponents ───────────────────────────────────────────

function FieldError({ message }: { message: string }) {
    return (
        <p className="animate-fade-in text-xs text-error" role="alert">
            {message}
        </p>
    );
}

function Spinner() {
    return (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}
