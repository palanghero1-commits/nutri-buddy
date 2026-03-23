import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, Heart, Leaf, LogOut, Salad, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";

const highlights = [
  {
    icon: Salad,
    title: "Meal reminders",
    description: "Log breakfast, lunch, dinner, and snacks so the admin side sees the same entries.",
    tone: "bg-peach",
  },
  {
    icon: CalendarDays,
    title: "Growth updates",
    description: "Submit the latest weight and height to keep charts and reports current.",
    tone: "bg-sage",
  },
  {
    icon: Bell,
    title: "Shared alerts",
    description: "Status changes on your child records automatically affect admin alerts and summaries.",
    tone: "bg-sky",
  },
];

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().toISOString().slice(0, 7);

export default function UserPortal() {
  const { currentUser, logout } = useAuth();
  const { children, mealEntries, addChild, addMealEntry, addGrowthRecord } = useNutriData();

  const [childForm, setChildForm] = useState({
    name: "",
    age: "",
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
  const myChildIds = useMemo(() => new Set(myChildren.map((child) => child.id)), [myChildren]);
  const myMeals = useMemo(
    () => mealEntries.filter((meal) => myChildIds.has(meal.childId)).slice(0, 5),
    [mealEntries, myChildIds],
  );

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
      name: childForm.name,
      age: Number(childForm.age),
      gender: childForm.gender as "Male" | "Female",
      weight: Number(childForm.weight),
      height: Number(childForm.height),
      parentName: currentUser.name,
      createdByEmail: currentUser.email,
    });

    setChildForm({
      name: "",
      age: "",
      gender: "Female",
      weight: "",
      height: "",
    });
    setMessage("Child profile saved. The admin dashboard now uses this record.");
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
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-peach/45 via-background to-sage/30 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Shared Data Entry</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              Welcome, {currentUser?.name.split(" ")[0]}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Anything you submit here appears on the admin dashboard, children list, meal tracker, growth monitor, reports, and alerts.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">My Children</p>
                <p className="mt-2 text-xl font-bold text-foreground">{myChildren.length}</p>
              </div>
              <div className="rounded-2xl bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Meal Logs</p>
                <p className="mt-2 text-xl font-bold text-foreground">{myMeals.length}</p>
              </div>
              <div className="rounded-2xl bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sync Status</p>
                <p className="mt-2 text-xl font-bold text-foreground">Live</p>
              </div>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-background/85 px-4 py-3 text-sm text-foreground">
                {message}
              </div>
            )}
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
                  <span className="text-sm font-medium">Account ownership</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Child profiles you create are linked to this signed-in user account.</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Admin visibility</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Admin pages use the same stored data, so updates are visible immediately on this device.</p>
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

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
          <form onSubmit={handleAddChild} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Add Child Profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a child record that will appear in the admin children list and reports.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground">
                Child Name
                <input
                  required
                  value={childForm.name}
                  onChange={(event) => setChildForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Age
                <input
                  required
                  min="1"
                  max="18"
                  type="number"
                  value={childForm.age}
                  onChange={(event) => setChildForm((current) => ({ ...current, age: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
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
            <button className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Save Child Profile
            </button>
          </form>

          <form onSubmit={handleAddMeal} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Log Meal</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add a meal entry that syncs directly into the admin meal tracker.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            <button
              disabled={myChildren.length === 0}
              className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Save Meal Entry
            </button>
          </form>

          <div className="space-y-6">
            <form onSubmit={handleAddGrowthRecord} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Update Growth</h2>
              <p className="mt-2 text-sm text-muted-foreground">Submit a new height and weight record for admin charts and alerts.</p>
              <div className="mt-5 grid gap-4">
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
              <button
                disabled={myChildren.length === 0}
                className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                Save Growth Record
              </button>
            </form>

            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">My Submitted Records</h2>
              {myChildren.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No child records yet. Add a child profile first to unlock meal and growth submissions.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {myChildren.map((child) => (
                    <div key={child.id} className="rounded-2xl bg-muted/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.age} yrs, {child.gender}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          child.status === "Normal" ? "bg-sage text-sage-deep" :
                          child.status === "Underweight" ? "bg-peach text-warning-foreground" :
                          child.status === "Overweight" ? "bg-coral-light text-coral" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {child.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {child.weight} kg • {child.height} cm • BMI {child.bmi}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {myMeals.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recent Meals</h3>
                  <div className="mt-3 space-y-2">
                    {myMeals.map((meal) => (
                      <div key={meal.id} className="rounded-2xl bg-background p-3">
                        <p className="text-sm font-medium text-foreground">{meal.mealType} • {meal.date}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{meal.foods.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
