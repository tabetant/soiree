/**
 * Supplier Dashboard — Placeholder
 *
 * Minimal landing page for verified venue owners.
 * Full dashboard will be built in the next phase.
 */

export default function SupplierDashboardPage() {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">🏢</div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Venue Dashboard
                </h1>
                <p className="text-sm text-foreground-muted mb-6">
                    Your venue management tools are coming soon. You&apos;ll be able to
                    manage events, view analytics, and engage with customers.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Under Development
                </div>
            </div>
        </div>
    );
}
