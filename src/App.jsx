import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Download, Plus, RotateCcw, Trash2 } from "lucide-react";

/**
 * Lean Bulk Phone App (PWA-style single-page)
 * - Works great on mobile (add to Home Screen)
 * - Stores your edits + weigh-ins in localStorage
 * - Export/Import JSON to move between devices
 */

const STORAGE_KEY = "lean_bulk_app_v1";

const defaultData = {
  profile: {
    name: "Michael",
    heightCm: 176,
    startWeightKg: 60,
    targetWeightKg: 70,
  },
  calories: {
    maintenanceTraining: 2450,
    maintenanceShiftLow: 2650,
    maintenanceShiftHigh: 2750,
    bulkRegular: 3050,
    bulkShiftLow: 3300,
    bulkShiftHigh: 3400,
    proteinTargetG: 140,
  },
  workouts: {
    push: [
      { ex: "Bench Press", sets: 4, reps: "6–10", start: "40–50 kg" },
      { ex: "Incline Dumbbell Press", sets: 3, reps: "8–12", start: "14–18 kg DBs" },
      { ex: "Overhead Press", sets: 3, reps: "6–10", start: "25–35 kg" },
      { ex: "Lateral Raises", sets: 3, reps: "12–15", start: "6–8 kg DBs" },
      { ex: "Dips / Close-Grip Pushups", sets: 3, reps: "8–15", start: "Bodyweight" },
      { ex: "Overhead Tricep Extensions", sets: 3, reps: "10–15", start: "12–18 kg DB" },
    ],
    pull: [
      { ex: "Deadlifts", sets: 3, reps: "4–6", start: "60–80 kg" },
      { ex: "Pull-ups / Chin-ups", sets: 3, reps: "6–10", start: "Bodyweight (assist if needed)" },
      { ex: "One-Arm Dumbbell Row", sets: 3, reps: "8–12", start: "22–28 kg DB" },
      { ex: "Bent Over Rows", sets: 3, reps: "8–12", start: "40–50 kg" },
      { ex: "Rear Delt Raises", sets: 3, reps: "12–15", start: "6–8 kg DBs" },
      { ex: "Dumbbell Curls", sets: 3, reps: "8–12", start: "10–14 kg DBs" },
    ],
    legs: [
      { ex: "Squats", sets: 4, reps: "6–10", start: "50–65 kg" },
      { ex: "Romanian Deadlifts", sets: 3, reps: "8–12", start: "50–70 kg" },
      { ex: "Bulgarian Split Squats", sets: 3, reps: "8–12 each", start: "12–18 kg DBs" },
      { ex: "Hip Thrusts / Glute Bridges", sets: 3, reps: "10–15", start: "60–80 kg" },
      { ex: "Standing Calf Raises", sets: 4, reps: "12–20", start: "BW + 20–40 kg" },
      { ex: "Core (Planks / Hanging Raises)", sets: 3, reps: "sets", start: "Controlled" },
    ],
    notes:
      "Start at the low end if form breaks. If you hit the top of the rep range with good form, add weight next session (or add reps first).",
  },
  mealPlan: {
    overview: [
      { day: "Day 1", calories: 2900, protein: 135 },
      { day: "Day 2", calories: 2950, protein: 140 },
      { day: "Day 3", calories: 2850, protein: 132 },
      { day: "Day 4", calories: 2920, protein: 138 },
      { day: "Day 5", calories: 3000, protein: 142 },
      { day: "Day 6", calories: 2880, protein: 134 },
      { day: "Day 7", calories: 2940, protein: 139 },
    ],
    noYogurtSubs: [
      "Cottage cheese",
      "Milk",
      "Cheese",
      "Eggs",
      "Protein shake",
      "Tuna",
      "Peanut butter snacks",
    ],
    dailyTemplate: [
      "Breakfast: Oats + eggs + peanut butter + banana",
      "Snack: Weight gain smoothie",
      "Lunch: Mince & rice bowl",
      "Snack: Peanut butter toast + milk / trail mix",
      "Dinner: Chicken pasta / steak & potatoes",
      "Before bed: Milk or cottage cheese",
    ],
    shiftDayAddOn: "On 12-hour shifts, add 200–300 kcal (extra milk, sandwich, trail mix, bigger rice portion).",
  },
  recipes: [
    {
      name: "Weight Gain Smoothie",
      macros: "~800 kcal, ~40g protein",
      ingredients: ["2 cups milk", "1 banana", "2 tbsp peanut butter", "1/2 cup oats", "Protein powder (optional)"],
      steps: ["Blend everything until smooth.", "Drink immediately (easy calories)."],
    },
    {
      name: "Mince & Rice Bowl",
      macros: "~850 kcal, ~45g protein",
      ingredients: ["200g beef mince", "1.5 cups cooked rice", "1 cup frozen veg", "1 tbsp olive oil", "Sauce (optional)"],
      steps: ["Cook mince (salt/pepper).", "Heat veg and rice.", "Combine and drizzle olive oil + sauce."],
    },
    {
      name: "Chicken Pasta",
      macros: "~900 kcal, ~55g protein",
      ingredients: ["200g chicken thighs", "2 cups cooked pasta", "1/2 cup pasta sauce", "30g cheese", "1 tbsp olive oil"],
      steps: ["Cook chicken (pan/oven).", "Mix pasta + sauce.", "Add chicken, cheese, and olive oil."],
    },
    {
      name: "High-Calorie Oats",
      macros: "~700 kcal, ~30g protein",
      ingredients: ["1 cup oats", "1.5 cups milk", "2 tbsp peanut butter", "1 banana", "Honey (optional)"],
      steps: ["Cook oats with milk.", "Stir in peanut butter.", "Top with banana (and honey)."],
    },
  ],
  grocery: {
    protein: ["Eggs – 24 pack", "Chicken thighs – 2 kg", "Beef mince – 1.5 kg", "Canned tuna – 4 cans", "Milk – 6–8 L", "Protein powder (optional)"],
    carbs: ["Rice – 2 kg", "Pasta – 1–2 kg", "Potatoes – 2 kg", "Oats – 1 kg", "Bread/wraps – 1–2 loaves", "Bananas – 7–10"],
    fats: ["Peanut butter – 1 large jar", "Olive oil – 1 bottle", "Cheese – 500 g", "Nuts/trail mix – 500 g", "Butter"],
    vegExtras: ["Frozen veg – 2–3 bags", "Pasta sauce – 2 jars", "BBQ/stir-fry sauce", "Honey"],
  },
  roadmap: {
    weeks: [
      {
        title: "Weeks 1–4: Foundation",
        bullets: [
          "Nail form; keep reps clean.",
          "Calories: regular 3050; shift days 3300–3400.",
          "Goal: +1–2 kg total.",
          "Progress: add reps → then weight.",
        ],
      },
      {
        title: "Weeks 5–8: Growth",
        bullets: [
          "Push closer to failure (leave ~1–2 reps in tank).",
          "If weight stalls 2 weeks: +200 kcal/day.",
          "Goal: +2–3 kg.",
          "Add weight once you hit top of rep range.",
        ],
      },
      {
        title: "Weeks 9–12: Mass & Consistency",
        bullets: [
          "Hit calories daily (shift-proof your eating).",
          "Prioritize sleep and recovery.",
          "Goal: +2–3 kg.",
          "Keep form strict while loads increase.",
        ],
      },
    ],
    strengthBenchmarks: [
      "Bench: work toward bodyweight for reps by Week 12 (aspirational)",
      "Squat: strong progress with clean depth",
      "Deadlift: steady +20–30 kg from start is a win",
      "Pull-ups: aim 8–12 strict",
    ],
  },
  tracker: {
    weighIns: [
      // { date: '2026-02-19', kg: 60.0 }
    ],
    notes: "Weigh 3x/week (morning). Track weekly average. If no gain for 2 weeks, add 200 kcal/day.",
  },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function SectionTitle({ title, right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {right}
    </div>
  );
}

function Small({ children }) {
  return <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>;
}

function List({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((x, i) => (
        <li key={i} className="text-sm leading-relaxed">
          {x}
        </li>
      ))}
    </ul>
  );
}

function WorkoutTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="grid grid-cols-12 bg-muted px-3 py-2 text-xs font-medium">
        <div className="col-span-6">Exercise</div>
        <div className="col-span-2 text-center">Sets</div>
        <div className="col-span-2 text-center">Reps</div>
        <div className="col-span-2 text-center">Start</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-12 px-3 py-2 text-sm border-t">
          <div className="col-span-6">{r.ex}</div>
          <div className="col-span-2 text-center">{r.sets}</div>
          <div className="col-span-2 text-center">{r.reps}</div>
          <div className="col-span-2 text-center">{r.start}</div>
        </div>
      ))}
    </div>
  );
}

function MacroPill({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="rounded-full">{label}</Badge>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    saveData(data);
  }, [data]);

  const currentWeight = useMemo(() => {
    const w = data.tracker.weighIns;
    if (!w.length) return data.profile.startWeightKg;
    return w[w.length - 1].kg;
  }, [data]);

  const progressPct = useMemo(() => {
    const start = data.profile.startWeightKg;
    const target = data.profile.targetWeightKg;
    const pct = ((currentWeight - start) / (target - start)) * 100;
    return clamp(isFinite(pct) ? pct : 0, 0, 100);
  }, [currentWeight, data.profile]);

  const chartData = useMemo(() => {
    return data.tracker.weighIns.map((w) => ({ ...w, dateShort: w.date.slice(5) }));
  }, [data.tracker.weighIns]);

  const weeklyAvg = useMemo(() => {
    // Simple rolling 7-day average using available entries
    const arr = data.tracker.weighIns;
    if (arr.length < 2) return null;
    const last7 = arr.slice(-7);
    const avg = last7.reduce((s, x) => s + Number(x.kg || 0), 0) / last7.length;
    return Number(avg.toFixed(2));
  }, [data.tracker.weighIns]);

  function updateProfile(key, value) {
    setData((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));
  }

  function updateCalories(key, value) {
    setData((d) => ({ ...d, calories: { ...d.calories, [key]: value } }));
  }

  function addWeighIn(date, kg) {
    if (!date || !kg) return;
    const val = Number(kg);
    if (!isFinite(val) || val <= 0) return;
    setData((d) => {
      const next = [...d.tracker.weighIns];
      // overwrite if same date exists
      const idx = next.findIndex((x) => x.date === date);
      if (idx >= 0) next[idx] = { date, kg: val };
      else next.push({ date, kg: val });
      next.sort((a, b) => (a.date > b.date ? 1 : -1));
      return { ...d, tracker: { ...d.tracker, weighIns: next } };
    });
  }

  function deleteWeighIn(date) {
    setData((d) => ({
      ...d,
      tracker: { ...d.tracker, weighIns: d.tracker.weighIns.filter((x) => x.date !== date) },
    }));
  }

  function resetAll() {
    if (confirm("Reset everything back to defaults?")) {
      localStorage.removeItem(STORAGE_KEY);
      setData(defaultData);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lean-bulk-app-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        setData((d) => ({ ...d, ...parsed }));
      } catch {
        alert("That file didn’t look like valid JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lean Bulk Tracker</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{data.profile.heightCm} cm</span>
              <span>•</span>
              <span>Start {data.profile.startWeightKg} kg</span>
              <span>→</span>
              <span>Target {data.profile.targetWeightKg} kg</span>
              <Badge className="rounded-full" variant="secondary">
                {data.calories.proteinTargetG}g protein
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportJSON} className="rounded-2xl">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
              />
              <Button variant="outline" size="sm" className="rounded-2xl">Import</Button>
            </label>
          </div>
        </header>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4 space-y-3">
            <SectionTitle
              title="Progress"
              right={<div className="text-sm font-medium">{currentWeight.toFixed(1)} kg</div>}
            />
            <Progress value={progressPct} />
            <div className="flex flex-wrap items-center gap-3">
              <MacroPill label="To target" value={`${Math.max(0, (data.profile.targetWeightKg - currentWeight)).toFixed(1)} kg`} />
              <MacroPill label="7-entry avg" value={weeklyAvg ? `${weeklyAvg} kg` : "—"} />
              <MacroPill
                label="Calories"
                value={`Reg ${data.calories.bulkRegular} • Shift ${data.calories.bulkShiftLow}-${data.calories.bulkShiftHigh}`}
              />
            </div>
            <Small>
              If you don’t gain for <span className="font-medium text-foreground">2 weeks</span>, add <span className="font-medium text-foreground">+200 kcal/day</span>.
            </Small>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 rounded-2xl">
            <TabsTrigger value="dashboard">Home</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="grocery">Grocery</TabsTrigger>
            <TabsTrigger value="track">Track</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Your Targets" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Regular days</div>
                    <div className="text-lg font-semibold">{data.calories.bulkRegular} kcal</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">12-hour shift days</div>
                    <div className="text-lg font-semibold">{data.calories.bulkShiftLow}–{data.calories.bulkShiftHigh} kcal</div>
                  </div>
                </div>
                <Separator />
                <Small>
                  Height {data.profile.heightCm}cm means 70kg is a milestone. A solid muscular range for you is often <span className="font-medium text-foreground">78–82kg lean</span>.
                </Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="12-Week Roadmap" />
                <div className="space-y-3">
                  {data.roadmap.weeks.map((w, i) => (
                    <div key={i} className="rounded-2xl border p-3">
                      <div className="font-semibold">{w.title}</div>
                      <div className="mt-2">
                        <List items={w.bullets} />
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-semibold">Strength focus</div>
                  <List items={data.roadmap.strengthBenchmarks} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Profile & Calorie Settings" right={
                  <Button variant="ghost" size="sm" onClick={resetAll} className="rounded-2xl">
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                } />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Height (cm)</div>
                    <Input
                      inputMode="numeric"
                      value={data.profile.heightCm}
                      onChange={(e) => updateProfile("heightCm", Number(e.target.value || 0))}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Target weight (kg)</div>
                    <Input
                      inputMode="numeric"
                      value={data.profile.targetWeightKg}
                      onChange={(e) => updateProfile("targetWeightKg", Number(e.target.value || 0))}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Regular calories</div>
                    <Input
                      inputMode="numeric"
                      value={data.calories.bulkRegular}
                      onChange={(e) => updateCalories("bulkRegular", Number(e.target.value || 0))}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Shift calories (low)</div>
                    <Input
                      inputMode="numeric"
                      value={data.calories.bulkShiftLow}
                      onChange={(e) => updateCalories("bulkShiftLow", Number(e.target.value || 0))}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Shift calories (high)</div>
                    <Input
                      inputMode="numeric"
                      value={data.calories.bulkShiftHigh}
                      onChange={(e) => updateCalories("bulkShiftHigh", Number(e.target.value || 0))}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Protein (g)</div>
                    <Input
                      inputMode="numeric"
                      value={data.calories.proteinTargetG}
                      onChange={(e) => updateCalories("proteinTargetG", Number(e.target.value || 0))}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <Small>
                  These numbers are set for your current plan (176cm, 60kg, active shifts). You can tweak them here anytime.
                </Small>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="mt-4 space-y-4">
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Day 1 — Push" />
                <WorkoutTable rows={data.workouts.push} />
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Day 2 — Pull" />
                <WorkoutTable rows={data.workouts.pull} />
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Day 3 — Legs" />
                <WorkoutTable rows={data.workouts.legs} />
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Small>{data.workouts.notes}</Small>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="mt-4 space-y-4">
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="7-Day Overview" />
                <div className="overflow-hidden rounded-2xl border">
                  <div className="grid grid-cols-12 bg-muted px-3 py-2 text-xs font-medium">
                    <div className="col-span-6">Day</div>
                    <div className="col-span-3 text-center">Calories</div>
                    <div className="col-span-3 text-center">Protein</div>
                  </div>
                  {data.mealPlan.overview.map((r, i) => (
                    <div key={i} className="grid grid-cols-12 px-3 py-2 text-sm border-t">
                      <div className="col-span-6">{r.day}</div>
                      <div className="col-span-3 text-center">{r.calories}</div>
                      <div className="col-span-3 text-center">{r.protein}g</div>
                    </div>
                  ))}
                </div>
                <Small>{data.mealPlan.shiftDayAddOn}</Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Daily Template" />
                <List items={data.mealPlan.dailyTemplate} />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="No-Yogurt Substitutes" />
                <List items={data.mealPlan.noYogurtSubs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="mt-4 space-y-4">
            {data.recipes.map((r, i) => (
              <Card key={i} className="rounded-3xl">
                <CardContent className="p-4 space-y-3">
                  <SectionTitle title={r.name} right={<Badge variant="secondary" className="rounded-full">{r.macros}</Badge>} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border p-3">
                      <div className="text-sm font-semibold">Ingredients</div>
                      <div className="mt-2"><List items={r.ingredients} /></div>
                    </div>
                    <div className="rounded-2xl border p-3">
                      <div className="text-sm font-semibold">Steps</div>
                      <div className="mt-2"><List items={r.steps} /></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="grocery" className="mt-4 space-y-4">
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Weekly Grocery List" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Protein</div>
                    <div className="mt-2"><List items={data.grocery.protein} /></div>
                  </div>
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Carbs</div>
                    <div className="mt-2"><List items={data.grocery.carbs} /></div>
                  </div>
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Fats & boosters</div>
                    <div className="mt-2"><List items={data.grocery.fats} /></div>
                  </div>
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Veg & extras</div>
                    <div className="mt-2"><List items={data.grocery.vegExtras} /></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="mt-4 space-y-4">
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Add Weigh-In" />
                <WeighInForm onAdd={addWeighIn} />
                <Small>{data.tracker.notes}</Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Trend" />
                <div className="h-56 w-full">
                  {chartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateShort" tick={{ fontSize: 12 }} />
                        <YAxis domain={[(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="kg" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      Add a weigh-in to see your chart.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Entries" right={
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => {
                    if (!data.tracker.weighIns.length) return;
                    if (confirm("Clear all weigh-ins?")) setData((d) => ({ ...d, tracker: { ...d.tracker, weighIns: [] } }));
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" /> Clear
                  </Button>
                } />
                <div className="space-y-2">
                  {data.tracker.weighIns.length ? (
                    [...data.tracker.weighIns].slice().reverse().map((w) => (
                      <div key={w.date} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <div className="text-sm font-semibold">{w.date}</div>
                          <div className="text-sm text-muted-foreground">{w.kg.toFixed(1)} kg</div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-2xl" onClick={() => deleteWeighIn(w.date)}>
                          Delete
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No weigh-ins yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="pb-8">
          <Small>
            Tip: On iPhone/Android, open this site in your browser → share/menu → <span className="font-medium text-foreground">Add to Home Screen</span>.
          </Small>
        </footer>
      </div>
    </div>
  );
}

function WeighInForm({ onAdd }) {
  const [date, setDate] = useState(todayISO());
  const [kg, setKg] = useState("");

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl" type="date" />
      <Input
        value={kg}
        onChange={(e) => setKg(e.target.value)}
        className="rounded-2xl"
        inputMode="decimal"
        placeholder="Weight (kg)"
      />
      <Button
        className="rounded-2xl"
        onClick={() => {
          onAdd(date, kg);
          setKg("");
        }}
      >
        <Plus className="h-4 w-4 mr-2" /> Add
      </Button>
    </div>
  );
}
