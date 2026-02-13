/**
 * Root Page — Redirects to onboarding or home
 *
 * The middleware handles the actual redirect logic based on auth state.
 * This page is a fallback that shouldn't normally render.
 */

export default function RootPage() {
  return (
    <div className="bg-nightlife-gradient flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-float text-5xl">🌙</div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-glow via-accent to-neon-pink bg-clip-text text-transparent">
          Soirée
        </h1>
        <p className="text-sm text-foreground-muted">Loading…</p>
      </div>
    </div>
  );
}
