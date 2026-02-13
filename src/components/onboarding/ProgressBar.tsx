"use client";

/**
 * ProgressBar Component
 *
 * Displays the current onboarding step with an animated progress fill.
 */

interface ProgressBarProps {
    currentStep: number;
    totalSteps?: number;
}

export default function ProgressBar({
    currentStep,
    totalSteps = 4,
}: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground-muted">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs font-medium text-accent">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Track */}
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface">
                {/* Fill */}
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-dim via-accent to-accent-glow transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Glow dot at the end */}
                <div
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent-glow shadow-lg shadow-accent/40 transition-all duration-700 ease-out"
                    style={{ left: `calc(${progress}% - 6px)` }}
                />
            </div>
        </div>
    );
}
