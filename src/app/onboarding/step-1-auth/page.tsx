/**
 * Step 1: Authentication
 *
 * Email/password sign-up and sign-in form.
 * Toggle between modes with a link at the bottom.
 */

import AuthForm from "@/components/onboarding/AuthForm";

export default function Step1AuthPage() {
    return (
        <div className="animate-slide-up flex flex-col items-center gap-8">
            {/* Logo / Brand */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="animate-float text-5xl">🌙</div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-accent-glow via-accent to-neon-pink bg-clip-text text-transparent">
                    Soirée
                </h1>
                <p className="text-base text-foreground-muted max-w-xs">
                    Discover Toronto&apos;s best nightlife, curated to your vibe.
                </p>
            </div>

            {/* Auth form */}
            <div className="w-full">
                <AuthForm />
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-foreground-muted leading-relaxed max-w-xs">
                By continuing, you agree to Soirée&apos;s{" "}
                <span className="underline underline-offset-2">Terms of Service</span>{" "}
                and{" "}
                <span className="underline underline-offset-2">Privacy Policy</span>.
            </p>
        </div>
    );
}
