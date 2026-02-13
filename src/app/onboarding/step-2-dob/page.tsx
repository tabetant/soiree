/**
 * Step 2: Date of Birth
 *
 * Collects the user's date of birth and validates they are 19+
 * (Ontario legal drinking age).
 */

import DateOfBirthPicker from "@/components/onboarding/DateOfBirthPicker";

export default function Step2DobPage() {
    return (
        <div className="animate-slide-up flex flex-col items-center gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-4xl">🎂</span>
                <h1 className="text-2xl font-bold text-foreground">
                    When&apos;s your birthday?
                </h1>
                <p className="text-sm text-foreground-muted max-w-xs">
                    We need to verify your age to show you the best nightlife experiences.
                </p>
            </div>

            {/* Date picker */}
            <div className="w-full">
                <DateOfBirthPicker />
            </div>
        </div>
    );
}
