import { Link } from "react-router-dom";
import { Leaf, UtensilsCrossed, TrendingUp, Bell, Bot, Shield, Heart, Users, ArrowRight, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-children.jpg";

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
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Nutri-Track</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Features</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">About</a>
            <Link
              to="/admin/login"
              className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 active:scale-[0.97] transition-all"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="section-enter">
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-sage px-3 py-1 rounded-full mb-6">
              Barangay Tinampa-an, Cadiz City
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-[1.1]">
              Nourishing Every Child's Future
            </h1>
            <p className="text-lg text-muted-foreground mt-5 max-w-lg leading-relaxed">
              A digital health monitoring system designed to track children's nutritional intake, growth, and overall well-being — empowering parents, guardians, and health professionals.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 active:scale-[0.97] transition-all"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted active:scale-[0.97] transition-all"
              >
                Admin Portal <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="section-enter stagger-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={heroImage}
                alt="Filipino children enjoying healthy food together"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 bg-primary">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`text-center section-enter stagger-${i + 1}`}>
              <p className="text-3xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center section-enter max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground">Comprehensive Health Monitoring</h2>
            <p className="text-muted-foreground mt-3">Everything you need to track and improve children's nutritional health in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feat, i) => (
              <div key={feat.title} className={`stat-card section-enter stagger-${(i % 5) + 1} group`}>
                <div className={`w-11 h-11 rounded-xl ${feat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <feat.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <h3 className="font-semibold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-muted/50">
        <div className="max-w-3xl mx-auto text-center section-enter">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Users className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">About Nutri-Track</h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            The Nutri-Track System is designed for Barangay Tinampa-an, Cadiz City — a digital solution 
            for monitoring children's nutritional intake and overall health status. It supports parents, 
            guardians, and health professionals in promoting healthy growth and development through 
            data-driven insights, AI-powered recommendations, and comprehensive reporting tools.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Evaluated using the ISO/IEC 25010 (SQuaRE) model for functional suitability, performance 
            efficiency, usability, reliability, security, maintainability, flexibility, and safety.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Nutri-Track System</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Barangay Tinampa-an, Cadiz City. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
