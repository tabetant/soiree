"use client";

/**
 * Onboarding Layout
 *
 * Shared layout for all onboarding steps.
 * Includes: background gradient, progress bar, centered content container.
 * Determines current step from the URL pathname.
 */

import { usePathname } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";

const STEP_MAP: Record<string, number> = {
    "/onboarding/step-1-auth": 1,
    "/onboarding/step-2-dob": 2,
    "/onboarding/step-3-music": 3,
    "/onboarding/step-4-vibe": 4,
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const currentStep = STEP_MAP[pathname] ?? 1;

    return (
        <div className="bg-nightlife-gradient flex min-h-dvh flex-col">
            {/* Progress bar - fixed at top */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl px-6 pt-4 pb-3">
                <ProgressBar currentStep={currentStep} />
            </div>

            {/* Main content */}
            <main className="flex flex-1 flex-col items-center px-6 pb-10">
                <div className="w-full max-w-md flex-1 flex flex-col justify-center">
                    {children}
                </div>
            </main>
        </div>
    );
}
