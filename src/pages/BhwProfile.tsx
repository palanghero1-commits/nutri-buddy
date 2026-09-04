import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, CheckCircle2, KeyRound, Mail, MapPin, Phone, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function BhwProfile() {
  const { staffUser, updateStaffProfile, resetPassword, deleteAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({
    name: staffUser?.name || "",
    contactNumber: staffUser?.contactNumber || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: staffUser?.name || "",
      contactNumber: staffUser?.contactNumber || "",
    });
  }, [staffUser]);

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProfile(true);

    const result = await updateStaffProfile({
      name: profileForm.name,
      contactNumber: profileForm.contactNumber,
    });

    toast({
      title: result.success ? "Profile updated" : "Update failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    setIsSavingProfile(false);
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staffUser) return;

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters for your new password.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Re-enter the same new password in both fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPassword(true);
    const result = await resetPassword(staffUser.email, passwordForm.currentPassword, passwordForm.newPassword, "bhw");

    toast({
      title: result.success ? "Password updated" : "Password update failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setIsSavingPassword(false);
  };

  const handleDeleteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const confirmed = window.confirm("Delete your BHW profile? This will remove your BHW login account.");
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteAccount(deletePassword, "bhw");

    toast({
      title: result.success ? "Profile deleted" : "Delete failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    setIsDeleting(false);

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div>
      <section className="section-enter rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sage text-sage-deep">
              <UserRound className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">BHW Profile</p>
              <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground">{staffUser?.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{staffUser?.email}</p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            BHW account
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleProfileSubmit} className="section-enter stagger-1 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Profile Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update your BHW profile details.</p>
            </div>
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5 grid gap-4">
            <label className="text-sm text-foreground">
              Full Name
              <input
                required
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
              />
            </label>

            <label className="text-sm text-foreground">
              Email
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-input bg-muted/60 px-3 py-2.5 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{staffUser?.email}</span>
              </div>
            </label>

            <label className="text-sm text-foreground">
              Designation
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-input bg-muted/60 px-3 py-2.5 text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                <span className="text-sm">{staffUser?.designation || "Barangay Health Worker"}</span>
              </div>
            </label>

            <label className="text-sm text-foreground">
              Assigned Area
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-input bg-muted/60 px-3 py-2.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{staffUser?.assignedArea || "Not assigned"}</span>
              </div>
            </label>

            <label className="text-sm text-foreground">
              Contact Number
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={profileForm.contactNumber}
                  onChange={(event) => setProfileForm((current) => ({ ...current, contactNumber: event.target.value }))}
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3"
                />
              </div>
            </label>
          </div>

          <Button type="submit" className="mt-5" disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="section-enter stagger-2 h-fit rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update your BHW sign-in password.</p>
            </div>
            <KeyRound className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-5 grid gap-4">
            <label className="text-sm text-foreground">
              Current Password
              <input required type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
            </label>
            <label className="text-sm text-foreground">
              New Password
              <input required type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
            </label>
            <label className="text-sm text-foreground">
              Confirm New Password
              <input required type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
            </label>
          </div>

          <Button type="submit" variant="secondary" className="mt-5" disabled={isSavingPassword}>
            {isSavingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </section>

      <form onSubmit={handleDeleteSubmit} className="section-enter stagger-3 mt-5 rounded-xl border border-destructive/30 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-destructive">Delete BHW Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter your current password before deleting your BHW login account.</p>
          </div>
          <Trash2 className="h-5 w-5 text-destructive" />
        </div>

        <div className="mt-5 max-w-md">
          <label className="text-sm text-foreground">
            Current Password
            <input required type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
          </label>
        </div>

        <Button type="submit" variant="destructive" className="mt-5" disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete Profile"}
        </Button>
      </form>
    </div>
  );
}
