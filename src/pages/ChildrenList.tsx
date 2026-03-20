import { children } from "@/lib/mockData";
import { Search, Plus, Scale, Ruler, Activity } from "lucide-react";
import { useState } from "react";

export default function ChildrenList() {
  const [search, setSearch] = useState("");
  const filtered = children.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between section-enter">
        <div>
          <h1 className="text-2xl font-bold">Children Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor registered children</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Add Child
        </button>
      </div>

      <div className="relative mt-6 section-enter stagger-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search children..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((child, i) => (
          <div key={child.id} className={`stat-card section-enter stagger-${(i % 5) + 1} cursor-pointer group`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-sm font-bold text-sage-deep group-hover:scale-105 transition-transform">
                {child.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{child.name}</h3>
                <p className="text-xs text-muted-foreground">{child.age} years old • {child.gender}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 rounded-lg bg-muted">
                <Scale className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold mt-1">{child.weight}</p>
                <p className="text-[10px] text-muted-foreground">kg</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <Ruler className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold mt-1">{child.height}</p>
                <p className="text-[10px] text-muted-foreground">cm</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <Activity className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold mt-1">{child.bmi}</p>
                <p className="text-[10px] text-muted-foreground">BMI</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                child.status === "Normal" ? "bg-sage text-sage-deep" :
                child.status === "Underweight" ? "bg-peach text-warning-foreground" :
                child.status === "Overweight" ? "bg-coral-light text-coral" :
                "bg-destructive/10 text-destructive"
              }`}>
                {child.status}
              </span>
              <span className="text-xs text-muted-foreground">Parent: {child.parentName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
