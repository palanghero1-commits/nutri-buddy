import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Plus,
  Salad,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";
import { formatChildAge } from "@/lib/mockData";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().toISOString().slice(0, 7);

export default function UserPortal() {
  const { currentUser } = useAuth();
  const { children, addChild, addMealEntry, addGrowthRecord } = useNutriData();
  const [activeDialog, setActiveDialog] = useState<"child" | "meal" | "growth" | null>(null);

  const [childForm, setChildForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    gender: "Female",
    weight: "",
    height: "",
  });
  const [mealForm, setMealForm] = useState({
    childId: "",
    date: today,
    mealType: "Breakfast",
    foods: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [growthForm, setGrowthForm] = useState({
    childId: "",
    date: currentMonth,
    weight: "",
    height: "",
  });
  const [message, setMessage] = useState("");

  const myChildren = useMemo(
    () => children.filter((child) => child.createdByEmail === currentUser?.email),
    [children, currentUser?.email],
  );
  const calculatedChildAge = formatChildAge(childForm.birthDate);

  useEffect(() => {
    if (!mealForm.childId && myChildren.length > 0) {
      setMealForm((current) => ({ ...current, childId: myChildren[0].id }));
    }
  }, [mealForm.childId, myChildren]);

  useEffect(() => {
    if (!growthForm.childId && myChildren.length > 0) {
      setGrowthForm((current) => ({ ...current, childId: myChildren[0].id }));
    }
  }, [growthForm.childId, myChildren]);

  const handleAddChild = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;

    addChild({
      firstName: childForm.firstName,
      middleName: childForm.middleName,
      lastName: childForm.lastName,
      birthDate: childForm.birthDate,
      gender: childForm.gender as "Male" | "Female",
      weight: Number(childForm.weight),
      height: Number(childForm.height),
      parentName: currentUser.name,
      createdByEmail: currentUser.email,
    });

    setChildForm({
      firstName: "",
      middleName: "",
      lastName: "",
      birthDate: "",
      gender: "Female",
      weight: "",
      height: "",
    });
    setMessage("Child profile saved. The admin dashboard now uses this record.");
    setActiveDialog(null);
  };

  const handleAddMeal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addMealEntry({
      childId: mealForm.childId,
      date: mealForm.date,
      mealType: mealForm.mealType as "Breakfast" | "Lunch" | "Dinner" | "Snack",
      foods: mealForm.foods.split(",").map((food) => food.trim()).filter(Boolean),
      calories: Number(mealForm.calories),
      protein: Number(mealForm.protein),
      carbs: Number(mealForm.carbs),
      fat: Number(mealForm.fat),
    });

    setMealForm((current) => ({
      ...current,
      date: today,
      mealType: "Breakfast",
      foods: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    }));
    setMessage("Meal entry saved. It is now visible in the admin meal tracker.");
    setActiveDialog(null);
  };

  const handleAddGrowthRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addGrowthRecord({
      childId: growthForm.childId,
      date: growthForm.date,
      weight: Number(growthForm.weight),
      height: Number(growthForm.height),
    });

    setGrowthForm((current) => ({
      ...current,
      date: currentMonth,
      weight: "",
      height: "",
    }));
    setMessage("Growth update saved. Charts, reports, and alerts now reflect the latest values.");
    setActiveDialog(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="section-enter overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="p-5 sm:p-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  User dashboard
                </div>
                <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                  Welcome back, {currentUser?.name.split(" ")[0]}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Add new records from quick actions, then review saved child, meal, and growth data from the sidebar menus.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => setActiveDialog("child")}>
                    <Plus className="h-4 w-4" />
                    Add Child
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveDialog("meal")} disabled={myChildren.length === 0}>
                    <Salad className="h-4 w-4" />
                    Log Meal
                  </Button>
                  <Button variant="outline" onClick={() => setActiveDialog("growth")} disabled={myChildren.length === 0}>
                    <TrendingUp className="h-4 w-4" />
                    Update Growth
                  </Button>
                </div>
              </div>
            </div>

            {message && (
              <div className="border-t border-border/70 bg-background/80 px-5 py-3 text-sm text-foreground sm:px-7">
                {message}
              </div>
            )}
          </div>

          <div className="section-enter stagger-1 grid gap-3 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage text-sage-deep">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Account Sync</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Profiles created here stay linked to your signed-in user account.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-peach text-warning-foreground">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Admin Visibility</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  New records update dashboard counts, alerts, reports, and trackers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid items-start gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="section-enter stagger-2 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Use the sidebar to open each record area without crowding this dashboard.
                </p>
              </div>
              <UsersRound className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-sm font-semibold text-foreground">Child Profiles</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Each child appears under the Child Profiles section in the sidebar.
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-sm font-semibold text-foreground">Meals</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Meal history is kept in its own menu so food logs stay organized.
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-sm font-semibold text-foreground">Growth</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Height and weight updates are grouped in the Growth page.
                </p>
              </div>
            </div>
          </div>

          <div className="section-enter stagger-3 h-fit rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Record Flow</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Start with a child profile, then continue with meal and growth updates.
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-sage p-4">
                <p className="text-xs font-semibold text-sage-deep">Step 1</p>
                <p className="mt-2 font-semibold text-foreground">Add child</p>
              </div>
              <div className="rounded-lg bg-peach p-4">
                <p className="text-xs font-semibold text-warning-foreground">Step 2</p>
                <p className="mt-2 font-semibold text-foreground">Log meals</p>
              </div>
              <div className="rounded-lg bg-sky p-4">
                <p className="text-xs font-semibold text-foreground/70">Step 3</p>
                <p className="mt-2 font-semibold text-foreground">Update growth</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Dialog open={activeDialog === "child"} onOpenChange={(open) => setActiveDialog(open ? "child" : null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Child Profile</DialogTitle>
            <DialogDescription>Create a child record that appears in admin children lists and reports.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddChild} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground">
                First Name
                <input
                  required
                  value={childForm.firstName}
                  onChange={(event) => setChildForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Middle Name
                <input
                  value={childForm.middleName}
                  onChange={(event) => setChildForm((current) => ({ ...current, middleName: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Last Name
                <input
                  required
                  value={childForm.lastName}
                  onChange={(event) => setChildForm((current) => ({ ...current, lastName: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Birthdate
                <input
                  required
                  type="date"
                  max={today}
                  value={childForm.birthDate}
                  onChange={(event) => setChildForm((current) => ({ ...current, birthDate: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <div className="rounded-lg border border-input bg-muted/60 px-3 py-2.5 text-sm text-foreground">
                <p className="text-xs text-muted-foreground">Calculated Age</p>
                <p className="mt-1 font-semibold">{calculatedChildAge || "Select birthdate"}</p>
              </div>
              <label className="text-sm text-foreground">
                Gender
                <select
                  value={childForm.gender}
                  onChange={(event) => setChildForm((current) => ({ ...current, gender: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </label>
              <label className="text-sm text-foreground">
                Weight (kg)
                <input
                  required
                  min="1"
                  step="0.1"
                  type="number"
                  value={childForm.weight}
                  onChange={(event) => setChildForm((current) => ({ ...current, weight: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground sm:col-span-2">
                Height (cm)
                <input
                  required
                  min="30"
                  step="0.1"
                  type="number"
                  value={childForm.height}
                  onChange={(event) => setChildForm((current) => ({ ...current, height: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Child Profile</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "meal"} onOpenChange={(open) => setActiveDialog(open ? "meal" : null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
            <DialogDescription>Add a meal entry that syncs into the admin meal tracker.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMeal} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground sm:col-span-2">
                Child
                <select
                  required
                  disabled={myChildren.length === 0}
                  value={mealForm.childId}
                  onChange={(event) => setMealForm((current) => ({ ...current, childId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 disabled:opacity-60"
                >
                  <option value="">Select child</option>
                  {myChildren.map((child) => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-foreground">
                Date
                <input
                  required
                  type="date"
                  value={mealForm.date}
                  onChange={(event) => setMealForm((current) => ({ ...current, date: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Meal Type
                <select
                  value={mealForm.mealType}
                  onChange={(event) => setMealForm((current) => ({ ...current, mealType: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </label>
              <label className="text-sm text-foreground sm:col-span-2">
                Foods
                <input
                  required
                  placeholder="Rice, fish, banana"
                  value={mealForm.foods}
                  onChange={(event) => setMealForm((current) => ({ ...current, foods: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Calories
                <input
                  required
                  min="0"
                  type="number"
                  value={mealForm.calories}
                  onChange={(event) => setMealForm((current) => ({ ...current, calories: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Protein (g)
                <input
                  required
                  min="0"
                  type="number"
                  value={mealForm.protein}
                  onChange={(event) => setMealForm((current) => ({ ...current, protein: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Carbs (g)
                <input
                  required
                  min="0"
                  type="number"
                  value={mealForm.carbs}
                  onChange={(event) => setMealForm((current) => ({ ...current, carbs: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Fat (g)
                <input
                  required
                  min="0"
                  type="number"
                  value={mealForm.fat}
                  onChange={(event) => setMealForm((current) => ({ ...current, fat: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={myChildren.length === 0}>
                Save Meal Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "growth"} onOpenChange={(open) => setActiveDialog(open ? "growth" : null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Growth</DialogTitle>
            <DialogDescription>Submit a new height and weight record for admin charts and alerts.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGrowthRecord} className="grid gap-4">
            <label className="text-sm text-foreground">
              Child
              <select
                required
                disabled={myChildren.length === 0}
                value={growthForm.childId}
                onChange={(event) => setGrowthForm((current) => ({ ...current, childId: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 disabled:opacity-60"
              >
                <option value="">Select child</option>
                {myChildren.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-foreground">
              Period
              <input
                required
                type="month"
                value={growthForm.date}
                onChange={(event) => setGrowthForm((current) => ({ ...current, date: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground">
                Weight (kg)
                <input
                  required
                  min="1"
                  step="0.1"
                  type="number"
                  value={growthForm.weight}
                  onChange={(event) => setGrowthForm((current) => ({ ...current, weight: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Height (cm)
                <input
                  required
                  min="30"
                  step="0.1"
                  type="number"
                  value={growthForm.height}
                  onChange={(event) => setGrowthForm((current) => ({ ...current, height: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={myChildren.length === 0}>
                Save Growth Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
