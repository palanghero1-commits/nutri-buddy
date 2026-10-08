import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNutriData } from "@/hooks/useNutriData";

type GrowthMetric = "height" | "weight" | "bmi";
const chartColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ec4899", "#14b8a6"];
const dateValue = (value: string) => value.length === 7 ? `${value}-01` : value;
const metricValue = (record: { weight: number; height: number }, metric: GrowthMetric) => {
  if (metric === "weight") return record.weight;
  if (metric === "height") return record.height;
  return record.height > 0 ? Number((record.weight / ((record.height / 100) ** 2)).toFixed(1)) : null;
};

export default function GrowthMonitor() {
  const { children, growthData } = useNutriData();
  const [selectedChild, setSelectedChild] = useState("");
  const [metric, setMetric] = useState<GrowthMetric>("height");

  useEffect(() => {
    if (!children.some((candidate) => candidate.id === selectedChild)) setSelectedChild(children[0]?.id ?? "");
  }, [children, selectedChild]);

  const child = children.find((candidate) => candidate.id === selectedChild);
  const records = useMemo(() => [...(growthData[selectedChild] || [])].sort((a, b) => dateValue(a.date).localeCompare(dateValue(b.date))), [growthData, selectedChild]);
  const comparisonSeries = useMemo(() => children.map((candidate, index) => ({
    child: candidate,
    color: chartColors[index % chartColors.length],
    records: [...(growthData[candidate.id] || [])].sort((a, b) => dateValue(a.date).localeCompare(dateValue(b.date))),
  })).filter((series) => series.records.length > 0), [children, growthData]);
  const comparisonData = useMemo(() => {
    const dates = [...new Set(comparisonSeries.flatMap((series) => series.records.map((record) => record.date)))].sort((a, b) => dateValue(a).localeCompare(dateValue(b)));
    return dates.map((date) => {
      const point: Record<string, string | number | null> = { date };
      comparisonSeries.forEach((series) => {
        const record = series.records.find((item) => item.date === date);
        point[series.child.id] = record ? metricValue(record, metric) : null;
      });
      return point;
    });
  }, [comparisonSeries, metric]);

  return <div>
    <div className="section-enter"><h1 className="text-2xl font-bold">Growth Monitor</h1><p className="mt-1 text-muted-foreground">Compare overall progress or inspect an individual child.</p></div>

    <section className="stat-card mt-6 section-enter stagger-1" aria-labelledby="overall-growth-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 id="overall-growth-heading" className="font-semibold">Overall Growth Progress</h2><p className="mt-1 text-sm text-muted-foreground">Live measurements from all registered children.</p></div>
        <div className="flex rounded-full bg-muted p-1" role="group" aria-label="Growth metric">
          {(["height", "weight", "bmi"] as GrowthMetric[]).map((option) => <button key={option} type="button" onClick={() => setMetric(option)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${metric === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-pressed={metric === option}>{option}</button>)}
        </div>
      </div>
      {comparisonData.length > 0 ? <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={comparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend />{comparisonSeries.map((series) => <Line key={series.child.id} type="monotone" dataKey={series.child.id} name={series.child.name} stroke={series.color} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />)}</LineChart></ResponsiveContainer></div> : <div className="mt-5 flex h-56 items-center justify-center rounded-xl bg-muted/40 text-center text-sm text-muted-foreground">No growth data available yet. Add measurements to see the overall chart.</div>}
    </section>

    <div className="mt-6 section-enter stagger-2"><label htmlFor="growth-child" className="sr-only">Select child</label><select id="growth-child" value={selectedChild} onChange={(event) => setSelectedChild(event.target.value)} disabled={children.length === 0} className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]">{children.length === 0 ? <option value="">No children available</option> : children.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></div>

    {child ? <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="stat-card section-enter stagger-3 lg:col-span-2"><h2 className="mb-4 font-semibold">Individual Growth — {child.name}</h2>{records.length > 0 ? <div className="h-64 sm:h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={records}><CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis yAxisId="weight" tick={{ fontSize: 12 }} /><YAxis yAxisId="height" orientation="right" tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line yAxisId="weight" type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Weight (kg)" /><Line yAxisId="height" type="monotone" dataKey="height" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} name="Height (cm)" /></LineChart></ResponsiveContainer></div> : <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">No growth data available for this child yet.</div>}</div>
      <div className="space-y-4 section-enter stagger-4"><div className="stat-card"><p className="text-sm text-muted-foreground">Current Weight</p><p className="mt-1 text-3xl font-bold">{child.weight} <span className="text-base font-normal text-muted-foreground">kg</span></p></div><div className="stat-card"><p className="text-sm text-muted-foreground">Current Height</p><p className="mt-1 text-3xl font-bold">{child.height} <span className="text-base font-normal text-muted-foreground">cm</span></p></div><div className="stat-card"><p className="text-sm text-muted-foreground">BMI</p><p className="mt-1 text-3xl font-bold">{child.bmi}</p><span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{child.status}</span></div></div>
    </div> : <div className="stat-card mt-6 flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">No children are available for individual growth tracking.</div>}
  </div>;
}
