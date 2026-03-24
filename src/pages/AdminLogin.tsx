import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast({ title: "Welcome back!", description: "Logged in successfully." });
        navigate("/admin");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-8">
            <Leaf className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground leading-tight">
            Nutri-Track Admin Portal
          </h2>
          <p className="text-primary-foreground/70 mt-4 leading-relaxed">
            Access the dashboard to monitor children's health, manage records, and generate reports for Barangay Tinampa-an Health Center, Cadiz City.
          </p>
          <div className="mt-10 space-y-4">
            {["Manage children's health records", "Track meals and growth data", "Generate health reports"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
                {item}
              </div>
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute bottom-20 left-16 w-48 h-48 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm section-enter">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-2.5 mb-2 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Nutri-Track</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mt-4">Admin Login</h1>
          <p className="text-muted-foreground mt-1 text-sm">Enter your credentials to access the admin dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nutritrack.gov.ph"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Looking for a regular account?{" "}
            <Link to="/user/login" className="font-medium text-primary hover:underline">
              User login
            </Link>
          </p>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Demo: admin@nutritrack.gov.ph / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
