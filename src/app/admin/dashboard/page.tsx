/**
 * Admin Dashboard — Placeholder
 *
 * Minimal landing page for platform admins.
 * Full admin panel will be built in the next phase.
 */

export default function AdminDashboardPage() {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">🛡️</div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Admin Panel
                </h1>
                <p className="text-sm text-foreground-muted mb-6">
                    Platform management tools are under construction.
                    User management, content moderation, and analytics coming soon.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Under Development
                </div>
            </div>
        </div>
    );
}
