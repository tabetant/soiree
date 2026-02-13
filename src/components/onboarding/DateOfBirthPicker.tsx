"use client";

/**
 * DateOfBirthPicker Component
 *
 * Three-dropdown date picker (Month/Day/Year) with 19+ age validation.
 * Ontario legal drinking age requirement.
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function DateOfBirthPicker() {
    const router = useRouter();

    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [year, setYear] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Generate year options (current year - 100 to current year - 19)
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const arr: number[] = [];
        for (let y = currentYear - 19; y >= currentYear - 100; y--) {
            arr.push(y);
        }
        return arr;
    }, [currentYear]);

    // Generate days based on selected month/year
    const daysInMonth = useMemo(() => {
        if (!month || !year) return 31;
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    }, [month, year]);

    const days = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [daysInMonth]);

    const isFormFilled = month !== "" && day !== "" && year !== "";

    const validateAge = useCallback(
        (dateStr: string): boolean => {
            const dob = new Date(dateStr);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < dob.getDate())
            ) {
                age--;
            }
            return age >= 19;
        },
        []
    );

    const handleSubmit = async () => {
        setError(null);

        const monthNum = parseInt(month);
        const dayNum = parseInt(day);
        const yearNum = parseInt(year);

        // Build ISO date string
        const dateStr = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

        // Validate age (must be 19+ for Ontario)
        if (!validateAge(dateStr)) {
            setError("You must be 19 or older to use Soirée.");
            return;
        }

        setLoading(true);

        // Store DOB in sessionStorage for final submission at step 4
        try {
            sessionStorage.setItem("soiree_dob", dateStr);
            router.push("/onboarding/step-3-music");
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const selectBaseClass =
        "h-14 flex-1 appearance-none rounded-xl border border-border bg-surface px-4 text-foreground text-base outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer";

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Date selectors */}
            <div className="flex gap-3">
                {/* Month */}
                <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={selectBaseClass}
                    aria-label="Month"
                >
                    <option value="" disabled>
                        Month
                    </option>
                    {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1)}>
                            {m}
                        </option>
                    ))}
                </select>

                {/* Day */}
                <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className={selectBaseClass}
                    style={{ maxWidth: "90px" }}
                    aria-label="Day"
                >
                    <option value="" disabled>
                        Day
                    </option>
                    {days.map((d) => (
                        <option key={d} value={String(d)}>
                            {d}
                        </option>
                    ))}
                </select>

                {/* Year */}
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={selectBaseClass}
                    style={{ maxWidth: "110px" }}
                    aria-label="Year"
                >
                    <option value="" disabled>
                        Year
                    </option>
                    {years.map((y) => (
                        <option key={y} value={String(y)}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="animate-fade-in rounded-xl bg-error-surface px-4 py-3 text-sm text-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Continue */}
            <button
                onClick={handleSubmit}
                disabled={!isFormFilled || loading}
                className="h-14 w-full rounded-2xl bg-accent font-semibold text-white text-base transition-all duration-200 hover:bg-accent-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {loading ? "Loading…" : "Continue"}
            </button>

            <p className="text-center text-xs text-foreground-muted">
                You must be at least 19 years old to use Soirée (Ontario legal drinking
                age).
            </p>
        </div>
    );
}
