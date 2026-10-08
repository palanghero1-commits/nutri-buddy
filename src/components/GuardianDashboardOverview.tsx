import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Baby,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Heart,
  Plus,
  Salad,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import type { Child, GrowthRecord, MealEntry } from "@/lib/mockData";

type DashboardDialog = "child" | "meal" | "growth";
type GrowthMetric = "height" | "weight" | "bmi";

type Props = {
  currentUser: { name: string; email: string; verificationStatus?: string } | null;
  children: Child[];
  mealEntries: MealEntry[];
  growthData: Record<string, GrowthRecord[]>;
  onOpenDialog: (dialog: DashboardDialog) => void;
};

const metricLabels: Record<GrowthMetric, string> = { height: "Height", weight: "Weight", bmi: "BMI" };

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CH";
}

function formatMealDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function bmi(weight: number, height: number) {
  const meters = height / 100;
  return meters > 0 ? weight / (meters * meters) : 0;
}

function metricValue(metric: GrowthMetric, record: GrowthRecord) {
  if (metric === "height") return record.height;
  if (metric === "weight") return record.weight;
  return bmi(record.weight, record.height);
}

function chartPath(values: number[], min: number, max: number, width = 380, height = 150) {
  if (!values.length) return "";
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export default function GuardianDashboardOverview({ currentUser, children, mealEntries, growthData, onOpenDialog }: Props) {
  const navigate = useNavigate();
  const [metric, setMetric] = useState<GrowthMetric>("height");
  const [showNotifications, setShowNotifications] = useState(false);

  const childIds = useMemo(() => new Set(children.map((child) => child.id)), [children]);
  const visibleMeals = useMemo(() => mealEntries.filter((meal) => childIds.has(meal.childId)), [childIds, mealEntries]);
  const recentMeals = useMemo(() => [...visibleMeals].sort((a, b) => `${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)).slice(0, 4), [visibleMeals]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const mealsThisWeek = visibleMeals.filter((meal) => Date.now() - new Date(`${meal.date}T12:00:00`).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
  const growthThisMonth = Object.entries(growthData).filter(([childId]) => childIds.has(childId)).flatMap(([, records]) => records).filter((record) => record.date.startsWith(currentMonth)).length;
  const healthStatus = children.length === 0 ? "No data" : children.some((child) => child.status !== "Normal") ? "Review needed" : "Good";

  const chartSeries = useMemo(() => children.slice(0, 3).map((child, index) => ({
    child,
    records: [...(growthData[child.id] ?? [])].sort((a, b) => a.date.localeCompare(b.date)).slice(-7),
    color: ["#3f83f8", "#8b5cf6", "#16a085"][index],
  })).filter((series) => series.records.length > 0), [children, growthData]);
  const chartValues = chartSeries.flatMap((series) => series.records.map((record) => metricValue(metric, record)));
  const chartMin = chartValues.length ? Math.min(...chartValues) - (Math.max(...chartValues) - Math.min(...chartValues) || 1) * 0.12 : 0;
  const chartMax = chartValues.length ? Math.max(...chartValues) + (Math.max(...chartValues) - Math.min(...chartValues) || 1) * 0.12 : 1;

  return (
    <div className="min-h-screen bg-[#f4f8ff] text-[#142650]">
      <div className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-[#dfe9f8] bg-white/90 px-4 py-3 backdrop-blur sm:px-7">
        <div className="flex-1" />
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <button type="button" aria-label="Notifications" onClick={() => setShowNotifications((value) => !value)} className="relative rounded-full p-2 text-[#7f91b1] hover:bg-[#eef5ff]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ed4f61]" />
          </button>
          {showNotifications && <div className="absolute right-20 top-14 z-30 w-64 rounded-2xl border border-[#dfe9f7] bg-white p-4 text-sm shadow-xl"><p className="font-bold">Notifications</p><p className="mt-2 text-xs leading-5 text-[#7990b5]">{currentUser?.verificationStatus === "pending" ? "Your ID verification is still pending review." : "You are all caught up."}</p></div>}
          <button type="button" onClick={() => navigate("/user/profile")} className="hidden items-center gap-2 rounded-full p-1 text-left hover:bg-[#eef5ff] sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f5bb9d] to-[#8a5b4e] text-xs font-bold text-white">{initials(currentUser?.name ?? "User")}</div>
            <span className="max-w-28 truncate text-sm font-semibold">{currentUser?.name ?? "User"}</span>
            <ChevronDown className="h-4 w-4 text-[#7f91b1]" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        {currentUser?.verificationStatus === "pending" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#f5df92] bg-[#fffbea] px-4 py-3 text-sm text-[#536887] shadow-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#d9aa18]" />
            <p><span className="font-semibold text-[#263b67]">ID verification pending.</span> Your registration document has been submitted and will be reviewed by an authorized Admin or BHW.</p>
          </div>
        ) : currentUser?.verificationStatus === "approved" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-[#bfe9d5] bg-[#effcf5] px-4 py-3 text-sm text-[#35745a]"><ShieldCheck className="h-5 w-5" /> Your account is verified and connected to the health center.</div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)]">
          <section className="relative min-h-[250px] overflow-hidden rounded-[24px] bg-[#e8f6fc] p-6 shadow-[0_10px_30px_rgba(68,116,177,0.1)] sm:min-h-[270px] sm:p-8">
            <div className="max-w-lg">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#3970a5]"><Sparkles className="h-3.5 w-3.5" /> Child nutrition tracker</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {currentUser?.name.split(" ")[0] ?? "there"}! <span aria-hidden="true">👋</span></h1>
              <p className="mt-4 max-w-md text-base leading-7 text-[#48658f]">Track your child&apos;s nutrition, meals, and growth — for a healthier tomorrow.</p>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#e1eaf8] bg-white p-5 shadow-[0_8px_24px_rgba(68,116,177,0.08)] sm:p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Quick Actions</h2><button type="button" aria-label="Open add child action" onClick={() => onOpenDialog("child")} className="rounded-full p-1 text-[#8ba0c1] hover:bg-[#eef5ff] hover:text-[#347be7]"><ArrowRight className="h-5 w-5" /></button></div>
            <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { key: "child" as const, icon: Plus, title: "Add Child", text: "Register a new child profile", tone: "bg-[#eef5ff] text-[#347be7]" },
                { key: "growth" as const, icon: TrendingUp, title: "Update Growth", text: "Add height & weight measurements", tone: "bg-[#f5f0ff] text-[#8965df]" },
              ].map((action) => (
                <button key={action.key} type="button" onClick={() => onOpenDialog(action.key)} disabled={action.key !== "child" && children.length === 0} className={`group flex min-h-[148px] flex-col items-center justify-start rounded-2xl p-3 text-center transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:p-4 ${action.tone}`}>
                  <span className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm"><action.icon className="h-5 w-5" /></span>
                  <span className="mt-3 block text-xs font-bold leading-5 sm:text-sm">{action.title}</span>
                  <span className="mt-1 text-[10px] leading-4 opacity-75 sm:text-[11px]">{action.text}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Children", value: children.length, note: "Active profiles", icon: Baby, tone: "bg-[#edf5ff] text-[#347be7]", action: () => children[0] ? navigate(`/user/children/${children[0].id}`) : onOpenDialog("child") },
            { label: "Meals Logged", value: mealsThisWeek, note: "This week", icon: Salad, tone: "bg-[#effbf5] text-[#2da473]", action: () => navigate("/user/meals") },
            { label: "Growth Updates", value: growthThisMonth, note: "This month", icon: TrendingUp, tone: "bg-[#f4efff] text-[#8663de]", action: () => navigate("/user/growth") },
            { label: "Health Status", value: healthStatus, note: children.length ? "Based on latest records" : "Add a child to begin", icon: Heart, tone: "bg-[#fff5e9] text-[#dd751d]", action: () => onOpenDialog(children.length ? "growth" : "child") },
          ].map((stat) => (
            <button key={stat.label} type="button" onClick={stat.action} className="flex items-center gap-4 rounded-[20px] border border-[#e1eaf8] bg-white p-5 text-left shadow-[0_8px_24px_rgba(68,116,177,0.06)] transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.tone}`}><stat.icon className="h-6 w-6" /></div>
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#7890b6]">{stat.label}</p><p className={`mt-1 font-bold leading-tight ${stat.label === "Health Status" ? "text-lg sm:text-xl" : "text-2xl"}`}>{stat.value}</p><p className="mt-0.5 line-clamp-2 text-xs leading-4 text-[#7990b5]">{stat.note}</p></div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#8aa4cb]" />
            </button>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr_1.25fr]">
          <div className="rounded-[22px] border border-[#e1eaf8] bg-white p-5 shadow-[0_8px_24px_rgba(68,116,177,0.06)]">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Child Profiles</h2><p className="mt-1 text-xs text-[#7990b5]">{children.length} active profile{children.length === 1 ? "" : "s"}</p></div><button type="button" aria-label="Open child profile" onClick={() => children[0] && navigate(`/user/children/${children[0].id}`)} className="rounded-full p-1 text-[#4e8bf1] hover:bg-[#eef5ff]"><ArrowRight className="h-5 w-5" /></button></div>
            <div className="mt-4 space-y-3">
              {children.slice(0, 3).map((child) => <button type="button" key={child.id} onClick={() => navigate(`/user/children/${child.id}`)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e5edf8] p-3 text-left hover:bg-[#f7faff]"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{child.name}</p><p className="mt-1 text-xs text-[#7990b5]">{child.gender} · {child.ageDisplay}</p></div><span className="rounded-full bg-[#edf5ff] px-2 py-1 text-[11px] font-semibold text-[#4e86d4]">{child.age} yrs</span><ChevronRight className="h-4 w-4 text-[#89a2c7]" /></button>)}
              {children.length === 0 && <div className="rounded-2xl bg-[#f3f8ff] p-5 text-center"><Baby className="mx-auto h-8 w-8 text-[#8badde]" /><p className="mt-2 text-sm font-semibold">No children yet</p><p className="mt-1 text-xs leading-5 text-[#7990b5]">Add a child to start tracking their nutrition and growth.</p></div>}
              <button type="button" onClick={() => onOpenDialog("child")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#eaf4ff] py-3 text-sm font-semibold text-[#347be7] hover:bg-[#dceeff]"><Plus className="h-4 w-4" /> Add Child</button>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#e1eaf8] bg-white p-5 shadow-[0_8px_24px_rgba(68,116,177,0.06)]">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent Meals</h2><p className="mt-1 text-xs text-[#7990b5]">Latest food records</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe9f7] px-3 py-1.5 text-xs font-semibold text-[#6e86ad]"><CalendarDays className="h-3.5 w-3.5" /> Recent</span></div>
            <div className="mt-4 divide-y divide-[#edf2f8]">
              {recentMeals.map((meal, index) => <div key={meal.id} className="flex items-center gap-3 py-3 first:pt-0"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${["bg-[#fff0d7] text-[#ed9b21]", "bg-[#e4f8ee] text-[#2fa16e]", "bg-[#fde8ef] text-[#d96591]", "bg-[#e8efff] text-[#557fe5]"][index]}`}><Utensils className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{meal.mealType}</p><p className="truncate text-xs text-[#7990b5]">{meal.foods.join(", ")}</p></div><div className="text-right"><p className="text-[11px] text-[#7990b5]">{formatMealDate(meal.date)}</p><span className="mt-1 inline-block rounded-full bg-[#e6f8ed] px-2 py-0.5 text-[10px] font-bold text-[#2a9a63]">Recorded</span></div></div>)}
              {recentMeals.length === 0 && <div className="py-8 text-center text-sm text-[#7990b5]">No meals recorded yet.</div>}
            </div>
            <p className="mt-3 rounded-2xl bg-[#f3f8ff] px-3 py-2.5 text-center text-xs font-medium text-[#6e86ad]">Meal records are entered by BHW staff.</p>
          </div>

          <div className="rounded-[22px] border border-[#e1eaf8] bg-white p-5 shadow-[0_8px_24px_rgba(68,116,177,0.06)]">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Growth Overview</h2><p className="mt-1 text-xs text-[#7990b5]">Compare recent measurements</p></div><button type="button" onClick={() => onOpenDialog("growth")} disabled={children.length === 0} className="text-xs font-semibold text-[#347be7] disabled:opacity-50">View details <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div>
            <div className="mt-4 flex gap-2 rounded-full bg-[#f1f5fb] p-1">{(Object.keys(metricLabels) as GrowthMetric[]).map((key) => <button key={key} type="button" onClick={() => setMetric(key)} className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${metric === key ? "bg-[#4387f4] text-white shadow-sm" : "text-[#637b9f] hover:bg-white"}`}>{metricLabels[key]}</button>)}</div>
            {chartSeries.length > 0 ? <div className="mt-4"><svg viewBox="0 0 380 180" className="h-44 w-full overflow-visible" role="img" aria-label={`${metricLabels[metric]} growth chart`}><line x1="0" y1="150" x2="380" y2="150" stroke="#e3ebf7" /><line x1="0" y1="100" x2="380" y2="100" stroke="#e3ebf7" /><line x1="0" y1="50" x2="380" y2="50" stroke="#e3ebf7" />{chartSeries.map((series) => <g key={series.child.id}><path d={chartPath(series.records.map((record) => metricValue(metric, record)), chartMin, chartMax)} fill="none" stroke={series.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{series.records.map((record, index) => { const values = series.records.map((item) => metricValue(metric, item)); const range = chartMax - chartMin || 1; const x = values.length === 1 ? 190 : (index / (values.length - 1)) * 380; const y = 150 - ((values[index] - chartMin) / range) * 150; return <circle key={`${record.date}-${index}`} cx={x} cy={y} r="4" fill="white" stroke={series.color} strokeWidth="3" />; })}</g>)}</svg><div className="mt-2 flex flex-wrap gap-4">{chartSeries.map((series) => <span key={series.child.id} className="inline-flex items-center gap-2 text-xs text-[#6f85aa]"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />{series.child.name}</span>)}</div></div> : <div className="flex min-h-48 flex-col items-center justify-center text-center"><TrendingUp className="h-9 w-9 text-[#9bb5dd]" /><p className="mt-2 text-sm font-semibold">Not enough growth data yet</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#7990b5]">Add height and weight measurements to see growth trends.</p><button type="button" onClick={() => onOpenDialog("growth")} className="mt-3 rounded-full bg-[#eaf4ff] px-4 py-2 text-xs font-semibold text-[#347be7]">Update Growth</button></div>}
          </div>
        </section>
      </div>
    </div>
  );
}
