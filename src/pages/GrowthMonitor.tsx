import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNutriData } from "@/hooks/useNutriData";

export default function GrowthMonitor() {
  const { children, growthData } = useNutriData();
  const [selectedChild, setSelectedChild] = useState("");
  const child = children.find((c) => c.id === selectedChild);
  const records = growthData[selectedChild] || [];

  useEffect(() => {
    if (!selectedChild && children.length > 0) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  return (
    <div>
      <div className="section-enter">
        <h1 className="text-2xl font-bold">Growth Monitor</h1>
        <p className="text-muted-foreground mt-1">Track weight and height over time</p>
      </div>

      <div className="mt-6 section-enter stagger-1">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {child && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Chart */}
          <div className="stat-card lg:col-span-2 section-enter stagger-2">
            <h2 className="font-semibold mb-4">Growth Trend — {child.name}</h2>
            {records.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="weight" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="height" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="hsl(152, 44%, 42%)" strokeWidth={2.5} dot={{ r: 4 }} name="Weight (kg)" />
                    <Line yAxisId="height" type="monotone" dataKey="height" stroke="hsl(12, 76%, 62%)" strokeWidth={2.5} dot={{ r: 4 }} name="Height (cm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                No growth data available for this child yet.
              </div>
            )}
          </div>

          {/* Current stats */}
          <div className="space-y-4 section-enter stagger-3">
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Current Weight</p>
              <p className="text-3xl font-bold mt-1">{child.weight} <span className="text-base font-normal text-muted-foreground">kg</span></p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Current Height</p>
              <p className="text-3xl font-bold mt-1">{child.height} <span className="text-base font-normal text-muted-foreground">cm</span></p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="text-3xl font-bold mt-1">{child.bmi}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-2 inline-block ${
                child.status === "Normal" ? "bg-sage text-sage-deep" :
                child.status === "Underweight" ? "bg-peach text-warning-foreground" :
                child.status === "Overweight" ? "bg-coral-light text-coral" :
                "bg-destructive/10 text-destructive"
              }`}>
                {child.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
