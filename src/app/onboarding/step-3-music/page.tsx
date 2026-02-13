/**
 * Step 3: Music Preferences
 *
 * Multi-select genre picker with autocomplete search.
 */

import MusicSelector from "@/components/onboarding/MusicSelector";

export default function Step3MusicPage() {
    return (
        <div className="animate-slide-up flex flex-col items-center gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-4xl">🎵</span>
                <h1 className="text-2xl font-bold text-foreground">
                    What&apos;s your sound?
                </h1>
                <p className="text-sm text-foreground-muted max-w-xs">
                    Pick the genres you love — we&apos;ll match you with venues that play
                    your kind of music.
                </p>
            </div>

            {/* Genre selector */}
            <div className="w-full">
                <MusicSelector />
            </div>
        </div>
    );
}
