/**
 * Step 4: Vibe Selection
 *
 * Multi-select vibe grid. On submit, saves the complete profile
 * to Supabase and redirects to /home.
 */

import VibeSelector from "@/components/onboarding/VibeSelector";

export default function Step4VibePage() {
    return (
        <div className="animate-slide-up flex flex-col items-center gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-4xl">✨</span>
                <h1 className="text-2xl font-bold text-foreground">
                    What&apos;s your vibe?
                </h1>
                <p className="text-sm text-foreground-muted max-w-xs">
                    Choose the atmospheres you gravitate towards — we&apos;ll find your
                    perfect spots.
                </p>
            </div>

            {/* Vibe selector */}
            <div className="w-full">
                <VibeSelector />
            </div>
        </div>
    );
}
