import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Leaf, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { currentUser, loginUser, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/user" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const success = await loginUser(email, password);

      if (success) {
        toast({
          title: "Welcome back",
          description: "Your Nutri-Track account is ready.",
        });
        navigate("/user");
      } else {
        toast({
          title: "Login failed",
          description: "We couldn't match that email and password.",
          variant: "destructive",
        });
      }

      setIsLoading(false);
    }, 700);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !currentPassword.trim() || !newPassword.trim()) {
      toast({
        title: "Missing details",
        description: "Enter your email, current password, and new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters for your new password.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    const result = await resetPassword(email, currentPassword, newPassword, "user");

    toast({
      title: result.success ? "Password updated" : "Reset failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setIsResetDialogOpen(false);
    }

    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-peach via-background to-sage p-12">
        <div className="absolute left-12 top-16 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-12 right-12 h-40 w-40 rounded-full bg-coral-light/30 blur-3xl" />
        <div className="relative z-10 max-w-md rounded-3xl border border-border/60 bg-background/80 p-8 shadow-xl backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <UserRound className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">User Login</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Sign in to view your account details, stay on top of nutrition updates, and keep your family informed.
          </p>
          <div className="mt-8 space-y-3 text-sm text-foreground/80">
            <div className="rounded-2xl bg-peach px-4 py-3">Access your personal dashboard</div>
            <div className="rounded-2xl bg-sage px-4 py-3">Review healthy habit reminders</div>
            <div className="rounded-2xl bg-sky px-4 py-3">Keep profile details in one place</div>
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

          <h1 className="text-2xl font-bold text-foreground mt-4">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">Log in to your Nutri-Track user account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsResetDialogOpen(true)}
            className="mt-4 w-full text-sm font-medium text-primary hover:underline"
          >
            Reset password
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link to="/user/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Demo user: user@nutritrack.app / user12345
          </p>
        </div>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Enter your current password before choosing a new one.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-reset-email">Email</Label>
              <Input
                id="user-reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-current-password">Current password</Label>
              <Input
                id="user-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-new-password">New password</Label>
              <Input
                id="user-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
