import { CalendarDays, Ruler, Scale, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

const currentMonth = new Date().toISOString().slice(0, 7);

function formatDelta(value: number, unit: string) {
  if (value === 0) return `No change`;
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`;
}

export default function UserGrowthPage() {
  const { currentUser } = useAuth();
  const { children, growthData, addGrowthRecord } = useNutriData();
  const [isGrowthDialogOpen, setIsGrowthDialogOpen] = useState(false);
  const [growthForm, setGrowthForm] = useState({
    childId: "",
    date: currentMonth,
    weight: "",
    height: "",
  });
  const myChildren = children.filter((child) => child.createdByEmail === currentUser?.email);
  const [selectedChildId, setSelectedChildId] = useState("");
  const growthRecords = myChildren
    .flatMap((child) =>
      (growthData[child.id] ?? []).map((record) => ({
        ...record,
        childId: child.id,
        childName: child.name,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestRecord = growthRecords[0];
  const selectedChild = myChildren.find((child) => child.id === selectedChildId) ?? myChildren[0];
  const selectedChildGrowth = useMemo(
    () => (selectedChild ? [...(growthData[selectedChild.id] ?? [])].sort((a, b) => a.date.localeCompare(b.date)) : []),
    [growthData, selectedChild],
  );
  const firstSelectedRecord = selectedChildGrowth[0];
  const latestSelectedRecord = selectedChildGrowth.at(-1);
  const weightDelta = firstSelectedRecord && latestSelectedRecord ? latestSelectedRecord.weight - firstSelectedRecord.weight : 0;
  const heightDelta = firstSelectedRecord && latestSelectedRecord ? latestSelectedRecord.height - firstSelectedRecord.height : 0;

  useEffect(() => {
    if (!growthForm.childId && myChildren.length > 0) {
      setGrowthForm((current) => ({ ...current, childId: myChildren[0].id }));
    }
  }, [growthForm.childId, myChildren]);

  useEffect(() => {
    if (!selectedChildId && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].id);
    }
  }, [myChildren, selectedChildId]);

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
    setIsGrowthDialogOpen(false);
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">
        <section className="section-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Growth records
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground">Growth</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review submitted height and weight updates for your child profiles.
            </p>
          </div>
          <Button onClick={() => setIsGrowthDialogOpen(true)} disabled={myChildren.length === 0}>
            Update Growth
          </Button>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Total Records</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{growthRecords.length}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Latest Weight</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {latestRecord ? `${latestRecord.weight} kg` : "-"}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <Ruler className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Latest Height</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {latestRecord ? `${latestRecord.height} cm` : "-"}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Child Growth Progress</h2>
              <p className="mt-1 text-sm text-muted-foreground">See how one child is growing in weight and height over time.</p>
            </div>
            <select
              disabled={myChildren.length === 0}
              value={selectedChild?.id ?? ""}
              onChange={(event) => setSelectedChildId(event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm disabled:opacity-60 sm:w-64"
            >
              {myChildren.length === 0 ? (
                <option value="">No child profiles</option>
              ) : (
                myChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {!selectedChild || selectedChildGrowth.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
              Add at least one growth record to see this child's progress.
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Records</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{selectedChildGrowth.length}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Current Weight</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{latestSelectedRecord?.weight} kg</p>
                  <p className="mt-1 text-xs font-medium text-sage-deep">{formatDelta(weightDelta, "kg")}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Current Height</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{latestSelectedRecord?.height} cm</p>
                  <p className="mt-1 text-xs font-medium text-sage-deep">{formatDelta(heightDelta, "cm")}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Latest Period</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{latestSelectedRecord?.date}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Since {firstSelectedRecord?.date}</p>
                </div>
              </div>

              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedChildGrowth} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="weight" tick={{ fontSize: 12 }} width={36} />
                    <YAxis yAxisId="height" orientation="right" tick={{ fontSize: 12 }} width={42} />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="weight"
                      type="monotone"
                      dataKey="weight"
                      stroke="#192853"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      name="Weight (kg)"
                    />
                    <Line
                      yAxisId="height"
                      type="monotone"
                      dataKey="height"
                      stroke="#8FB3C9"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      name="Height (cm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </section>

        <section className="mt-5 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Growth History</h2>
              <p className="mt-1 text-sm text-muted-foreground">Height and weight updates by date.</p>
            </div>
            <CalendarDays className="hidden h-5 w-5 text-muted-foreground sm:block" />
          </div>

          {growthRecords.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
              Growth updates will appear here after you submit the first record.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Child</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Weight</th>
                    <th className="px-3 py-3 font-medium">Height</th>
                    <th className="px-3 py-3 text-right font-medium">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {growthRecords.map((record) => (
                    <tr
                      key={`${record.childId}-${record.date}-${record.weight}-${record.height}`}
                      className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-3 py-4 font-medium text-foreground">{record.childName}</td>
                      <td className="px-3 py-4 text-muted-foreground">{record.date}</td>
                      <td className="px-3 py-4 tabular-nums">{record.weight} kg</td>
                      <td className="px-3 py-4 tabular-nums">{record.height} cm</td>
                      <td className="px-3 py-4 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/user/children/${record.childId}`}>View Child</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Dialog open={isGrowthDialogOpen} onOpenChange={setIsGrowthDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Growth</DialogTitle>
            <DialogDescription>Submit a growth update without leaving the Growth page.</DialogDescription>
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
              <Button type="button" variant="outline" onClick={() => setIsGrowthDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={myChildren.length === 0}>
                Save Growth Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
