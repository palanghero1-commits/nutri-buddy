import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Leaf, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function UserRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/user" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters for your password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Re-enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = registerUser(name, email, password);

      if (result.success) {
        toast({
          title: "Account created",
          description: "You're now signed in to Nutri-Track.",
        });
        navigate("/user");
      } else {
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        });
      }

      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-sky/40 via-background to-peach p-12">
        <div className="absolute right-20 top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-16 left-16 h-40 w-40 rounded-full bg-sage/40 blur-3xl" />
        <div className="relative z-10 max-w-md rounded-3xl border border-border/60 bg-background/80 p-8 shadow-xl backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <UserPlus className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Create a user account</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Register once to access your Nutri-Track portal and keep your nutrition information in one place.
          </p>
          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3">Quick account setup</div>
            <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3">Private session stored on this device</div>
            <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3">Instant access after registration</div>
          </div>
        </div>
      </div>

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

          <h1 className="text-2xl font-bold text-foreground mt-4">Register</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create your Nutri-Track user account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/user/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
