import { Link } from "react-router-dom";
import { Bell, CalendarDays, Heart, Leaf, LogOut, Salad, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const highlights = [
  {
    icon: Salad,
    title: "Meal reminders",
    description: "Keep meal logging consistent with simple daily check-ins.",
    tone: "bg-peach",
  },
  {
    icon: CalendarDays,
    title: "Routine tracking",
    description: "Review upcoming nutrition activities and wellness habits.",
    tone: "bg-sage",
  },
  {
    icon: Bell,
    title: "Helpful alerts",
    description: "Stay aware of updates that matter to your account.",
    tone: "bg-sky",
  },
];

export default function UserPortal() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold tracking-tight text-foreground">Nutri-Track</p>
              <p className="text-xs text-muted-foreground">User Portal</p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-peach/45 via-background to-sage/30 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Signed In</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">
              Welcome, {currentUser?.name.split(" ")[0]}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Your account is active. This portal gives users a dedicated place to access core Nutri-Track information without entering the admin side of the app.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                <p className="mt-2 text-xl font-bold text-foreground">Active</p>
              </div>
              <div className="rounded-2xl bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Session</p>
                <p className="mt-2 text-xl font-bold text-foreground">Secure</p>
              </div>
              <div className="rounded-2xl bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Access</p>
                <p className="mt-2 text-xl font-bold text-foreground">User</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{currentUser?.name}</h2>
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-muted/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Account protection</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Your user session is stored on this device and separated from the admin portal.</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Health focus</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Use this space as the user-facing starting point for future family and nutrition features.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                <item.icon className="h-5 w-5 text-foreground/80" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
