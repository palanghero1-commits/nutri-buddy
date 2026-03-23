import { Link } from "react-router-dom";
import { Leaf, UtensilsCrossed, TrendingUp, Bell, Bot, Shield, Heart, Users, ArrowRight, ChevronRight } from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Daily Meal Tracking",
    description: "Log and monitor daily food intake with detailed nutritional breakdowns for every child.",
    color: "bg-peach",
  },
  {
    icon: TrendingUp,
    title: "Growth Monitoring",
    description: "Track weight, height, and BMI trends over time with interactive growth charts.",
    color: "bg-sage",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Receive timely notifications for nutritional concerns and health recommendations.",
    color: "bg-coral-light",
  },
  {
    icon: Bot,
    title: "AI Nutrition Assistant",
    description: "Get personalized meal plans and nutrition advice powered by artificial intelligence.",
    color: "bg-sky",
  },
  {
    icon: Shield,
    title: "Health Reports",
    description: "Generate comprehensive reports for health professionals and program evaluation.",
    color: "bg-lavender",
  },
  {
    icon: Heart,
    title: "Community Health",
    description: "Supporting Barangay Tinampa-an's mission for healthier children and families.",
    color: "bg-peach",
  },
];

const stats = [
  { value: "500+", label: "Children Monitored" },
  { value: "1,200+", label: "Meals Tracked" },
  { value: "98%", label: "Parent Satisfaction" },
  { value: "24/7", label: "AI Support" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">Nutri-Track</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="#features" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">Features</a>
            <a href="#about" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">About</a>
            <Link
              to="/user/login"
              className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted sm:inline-flex"
            >
              User Login
            </Link>
            <Link
              to="/admin/login"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] sm:px-4"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="section-enter">
            <span className="mb-6 inline-block rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Barangay Tinampa-an, Cadiz City
            </span>
            <h1 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-5xl">
              Nourishing Every Child&apos;s Future
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              A digital health monitoring system designed to track children&apos;s nutritional intake, growth, and overall well-being -
              empowering parents, guardians, and health professionals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/user/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
              >
                Create User Account <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-all hover:bg-muted active:scale-[0.97]"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-all hover:bg-muted active:scale-[0.97]"
              >
                Admin Portal <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="section-enter stagger-2">
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-sage/40 via-background to-peach/30 p-4 shadow-xl sm:p-6">
              <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-coral-light/30 blur-3xl" />
              <div className="relative grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border/60 bg-background/85 p-5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Today&apos;s Snapshot</p>
                      <h3 className="mt-2 text-2xl font-bold text-foreground">Healthy Habits</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Leaf className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-peach p-3 text-center">
                      <UtensilsCrossed className="mx-auto h-5 w-5 text-foreground/70" />
                      <p className="mt-2 text-lg font-bold text-foreground">18</p>
                      <p className="text-xs text-muted-foreground">Meals logged</p>
                    </div>
                    <div className="rounded-2xl bg-sage p-3 text-center">
                      <TrendingUp className="mx-auto h-5 w-5 text-foreground/70" />
                      <p className="mt-2 text-lg font-bold text-foreground">94%</p>
                      <p className="text-xs text-muted-foreground">Growth on track</p>
                    </div>
                    <div className="rounded-2xl bg-sky p-3 text-center">
                      <Heart className="mx-auto h-5 w-5 text-foreground/70" />
                      <p className="mt-2 text-lg font-bold text-foreground">12</p>
                      <p className="text-xs text-muted-foreground">Care plans</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/90 p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-light">
                        <Heart className="h-5 w-5 text-foreground/80" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Balanced nutrition</p>
                        <p className="text-xs text-muted-foreground">Fresh produce, protein, and daily monitoring</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-foreground p-5 text-background">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-background/70">Focus Areas</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Meal consistency</span>
                        <span className="text-sm font-semibold">Excellent</span>
                      </div>
                      <div className="h-2 rounded-full bg-background/15">
                        <div className="h-2 w-[82%] rounded-full bg-peach" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Growth check-ins</span>
                        <span className="text-sm font-semibold">Weekly</span>
                      </div>
                      <div className="h-2 rounded-full bg-background/15">
                        <div className="h-2 w-[68%] rounded-full bg-sage" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-foreground/5" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`section-enter text-center stagger-${i + 1}`}>
              <p className="text-3xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="section-enter mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Comprehensive Health Monitoring</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to track and improve children&apos;s nutritional health in one place.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => (
              <div key={feat.title} className={`stat-card section-enter group stagger-${(i % 5) + 1}`}>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feat.color} transition-transform group-hover:scale-105`}>
                  <feat.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h3 className="font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-muted/50 px-4 py-20 sm:px-6">
        <div className="section-enter mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">About Nutri-Track</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The Nutri-Track System is designed for Barangay Tinampa-an, Cadiz City - a digital solution for monitoring children&apos;s nutritional intake and overall health status. It supports parents, guardians, and health professionals in promoting healthy growth and development through data-driven insights, AI-powered recommendations, and comprehensive reporting tools.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Evaluated using the ISO/IEC 25010 (SQuaRE) model for functional suitability, performance efficiency, usability, reliability, security, maintainability, flexibility, and safety.
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Nutri-Track System</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Barangay Tinampa-an, Cadiz City. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
