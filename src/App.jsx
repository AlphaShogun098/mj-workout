import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  PlayCircle,
  Timer,
  ChevronRight,
  ChevronLeft,
  Plus,
  Download,
  Upload,
  Bell,
  BellOff,
  Trash2,
} from "lucide-react";

/**
 * MJ WORKOUT — Lean Bulk PWA
 * Includes:
 * - Full plan tabs (Workouts, Meals, Recipes, Grocery, Roadmap, Track)
 * - Exercise videos + form cues + common mistakes
 * - Beginner/Advanced toggle
 * - Workout logging (sets/weight/reps) + PR tracker
 * - Rest timer with optional notifications
 * - “Next exercise” navigation
 * - Export/Import JSON
 */

const STORAGE_KEY = "mj_workout_pwa_v3";

const exerciseLibrary = {
  push: [
    {
      id: "bench",
      ex: "Bench Press",
      sets: 4,
      reps: "6–10",
      startBeginner: "40–50 kg",
      startAdvanced: "50–65 kg",
      video: "https://www.youtube.com/embed/gRVjAtPip0Y",
      cues: [
        "Feet planted, drive the floor.",
        "Shoulder blades back & down.",
        "Touch lower chest; press up and slightly back.",
        "Control the descent (2–3 sec).",
      ],
      mistakes: [
        "Bouncing bar off chest.",
        "Elbows flared hard at 90°.",
        "Losing tight upper back.",
      ],
    },
    {
      id: "incline-db",
      ex: "Incline Dumbbell Press",
      sets: 3,
      reps: "8–12",
      startBeginner: "14–18 kg DBs",
      startAdvanced: "18–26 kg DBs",
      video: "https://www.youtube.com/embed/8iPEnn-ltC8",
      cues: [
        "Set bench ~30–45°.",
        "Wrists stacked over elbows.",
        "Lower slowly; press up without clanking DBs.",
      ],
      mistakes: ["Too steep incline (turns into shoulders).", "Flaring elbows."],
    },
    {
      id: "ohp",
      ex: "Overhead Press",
      sets: 3,
      reps: "6–10",
      startBeginner: "25–35 kg",
      startAdvanced: "35–50 kg",
      video: "https://www.youtube.com/embed/2yjwXTZQDDI",
      cues: [
        "Squeeze glutes, ribs down.",
        "Bar starts at upper chest.",
        "Press straight up; head through at the top.",
      ],
      mistakes: ["Overarching lower back.", "Pressing forward around your face."],
    },
    {
      id: "laterals",
      ex: "Lateral Raises",
      sets: 3,
      reps: "12–15",
      startBeginner: "6–8 kg DBs",
      startAdvanced: "8–12 kg DBs",
      video: "https://www.youtube.com/embed/3VcKaXpzqRo",
      cues: [
        "Slight lean forward.",
        "Lead with elbows, soft bend.",
        "Stop at shoulder height; control down.",
      ],
      mistakes: ["Swinging/using momentum.", "Shrugging shoulders."],
    },
    {
      id: "dips",
      ex: "Dips / Close-Grip Pushups",
      sets: 3,
      reps: "8–15",
      startBeginner: "Bodyweight",
      startAdvanced: "Bodyweight + weight",
      video: "https://www.youtube.com/embed/2z8JmcrW-As",
      cues: [
        "Elbows track back.",
        "Full range without shoulder pain.",
        "Lock out with control.",
      ],
      mistakes: ["Shoulders rolling forward at bottom.", "Half reps."],
    },
    {
      id: "tri-ext",
      ex: "Overhead Tricep Extensions",
      sets: 3,
      reps: "10–15",
      startBeginner: "12–18 kg DB",
      startAdvanced: "18–28 kg DB",
      video: "https://www.youtube.com/embed/nRiJVZDpdL0",
      cues: [
        "Elbows tucked.",
        "Big stretch behind head.",
        "Only forearms move; avoid flaring.",
      ],
      mistakes: ["Turning it into a press.", "Letting elbows drift wide."],
    },
  ],
  pull: [
    {
      id: "deadlift",
      ex: "Deadlifts",
      sets: 3,
      reps: "4–6",
      startBeginner: "60–80 kg",
      startAdvanced: "80–120 kg",
      video: "https://www.youtube.com/embed/op9kVnSso6Q",
      cues: [
        "Bar over midfoot.",
        "Brace hard; lats tight (" +
          "'squeeze oranges in armpits').",
        "Push floor away; bar stays close.",
      ],
      mistakes: ["Rounding lower back.", "Yanking bar off floor."],
    },
    {
      id: "pullups",
      ex: "Pull-ups / Chin-ups",
      sets: 3,
      reps: "6–10",
      startBeginner: "Bodyweight (assist if needed)",
      startAdvanced: "Bodyweight + weight",
      video: "https://www.youtube.com/embed/eGo4IYlbE5g",
      cues: [
        "Start from dead hang.",
        "Pull elbows to ribs.",
        "Chest up; control down.",
      ],
      mistakes: ["Kipping/swinging.", "Half reps."],
    },
    {
      id: "row",
      ex: "Bent Over Rows",
      sets: 3,
      reps: "8–12",
      startBeginner: "40–50 kg",
      startAdvanced: "50–80 kg",
      video: "https://www.youtube.com/embed/vT2GjY_Umpw",
      cues: [
        "Hinge position, back flat.",
        "Pull bar to lower ribs.",
        "Pause briefly at top.",
      ],
      mistakes: ["Jerking weight.", "Standing too upright."],
    },
    {
      id: "onearm-row",
      ex: "One-Arm Dumbbell Row",
      sets: 3,
      reps: "8–12",
      startBeginner: "22–28 kg DB",
      startAdvanced: "28–40 kg DB",
      video: "https://www.youtube.com/embed/pYcpY20QaE8",
      cues: ["Pull elbow toward hip.", "Avoid twisting torso.", "Full stretch at bottom."],
      mistakes: ["Shrugging.", "Short range."],
    },
    {
      id: "rear-delt",
      ex: "Rear Delt Raises",
      sets: 3,
      reps: "12–15",
      startBeginner: "6–8 kg DBs",
      startAdvanced: "8–12 kg DBs",
      video: "https://www.youtube.com/embed/EA7u4Q_8HQ0",
      cues: ["Hinge and stay still.", "Lead with elbows.", "Control down."],
      mistakes: ["Using momentum.", "Shrugging."],
    },
    {
      id: "curls",
      ex: "Dumbbell Curls",
      sets: 3,
      reps: "8–12",
      startBeginner: "10–14 kg DBs",
      startAdvanced: "14–22 kg DBs",
      video: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
      cues: ["Elbows pinned.", "Full range.", "Slow negatives."],
      mistakes: ["Swinging hips.", "Half reps."],
    },
  ],
  legs: [
    {
      id: "squat",
      ex: "Squats",
      sets: 4,
      reps: "6–10",
      startBeginner: "50–65 kg",
      startAdvanced: "65–100 kg",
      video: "https://www.youtube.com/embed/ultWZbUMPL8",
      cues: ["Brace hard.", "Knees track over toes.", "Hit depth; drive up."],
      mistakes: ["Caving knees.", "Cutting depth."],
    },
    {
      id: "rdl",
      ex: "Romanian Deadlifts",
      sets: 3,
      reps: "8–12",
      startBeginner: "50–70 kg",
      startAdvanced: "70–110 kg",
      video: "https://www.youtube.com/embed/2SHsk9AzdjA",
      cues: ["Hinge, slight knee bend.", "Feel hamstring stretch.", "Bar close to legs."],
      mistakes: ["Squatting it.", "Rounding upper back."],
    },
    {
      id: "bulgarian",
      ex: "Bulgarian Split Squats",
      sets: 3,
      reps: "8–12 each",
      startBeginner: "12–18 kg DBs",
      startAdvanced: "18–30 kg DBs",
      video: "https://www.youtube.com/embed/2C-uNgKwPLE",
      cues: ["Long stance.", "Knee tracks over toes.", "Control down."],
      mistakes: ["Too narrow stance.", "Bouncing."],
    },
    {
      id: "hipthrust",
      ex: "Hip Thrusts / Glute Bridges",
      sets: 3,
      reps: "10–15",
      startBeginner: "60–80 kg",
      startAdvanced: "80–140 kg",
      video: "https://www.youtube.com/embed/LM8XHLYJoYs",
      cues: ["Chin tucked.", "Ribs down.", "Squeeze glutes at top."],
      mistakes: ["Overextending lower back.", "Not reaching full lockout."],
    },
    {
      id: "calves",
      ex: "Standing Calf Raises",
      sets: 4,
      reps: "12–20",
      startBeginner: "BW + 20–40 kg",
      startAdvanced: "BW + heavier",
      video: "https://www.youtube.com/embed/-M4-G8p8fmc",
      cues: ["Full stretch at bottom.", "Pause at top.", "Slow reps."],
      mistakes: ["Bouncing.", "Half range."],
    },
    {
      id: "core",
      ex: "Core (Planks / Hanging Raises)",
      sets: 3,
      reps: "sets",
      startBeginner: "Controlled",
      startAdvanced: "Add difficulty",
      video: "https://www.youtube.com/embed/pSHjTRCQxIw",
      cues: ["Brace like a punch.", "No sagging hips.", "Breathe."],
      mistakes: ["Holding breath.", "Short sets."],
    },
  ],
};

const defaultData = {
  profile: {
    name: "Michael",
    heightCm: 176,
    startWeightKg: 60,
    targetWeightKg: 70,
    level: "Beginner", // Beginner | Advanced
  },
  calories: {
    bulkRegular: 3050,
    bulkShiftLow: 3300,
    bulkShiftHigh: 3400,
    proteinTargetG: 140,
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
          "Push close to failure (leave ~1–2 reps in tank).",
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
  },
  tracker: {
    weighIns: [],
    measurements: {
      chestCm: "",
      waistCm: "",
      armCm: "",
      thighCm: "",
    },
  },
  logs: {
    // logs[dateISO][exerciseId] = { sets: [{kg,reps}], notes }
    sessions: {},
    prs: {}, // prs[exerciseId] = { bestKg, bestReps, date }
  },
  settings: {
    restSecondsDefault: 120,
    notificationsEnabled: false,
  },
};

function safeParseJSON(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData;
  const parsed = safeParseJSON(raw, defaultData);
  // Merge shallowly so new fields appear
  return { ...defaultData, ...parsed, profile: { ...defaultData.profile, ...(parsed.profile || {}) } };
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

function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current?.(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function Small({ children }) {
  return <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>;
}

function PillToggle({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-2 text-sm ${
            value === opt ? "bg-foreground text-background" : "bg-background"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mj-workout-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file, setData) {
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = safeParseJSON(String(reader.result || "{}"), null);
    if (!parsed) return alert("That file didn’t look like valid JSON.");
    setData((d) => ({ ...defaultData, ...d, ...parsed }));
  };
  reader.readAsText(file);
}

function requestNotifyPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  Notification.requestPermission();
  return Notification.permission === "granted";
}

function fireNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body });
}

function SectionTitle({ title, right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {right}
    </div>
  );
}

function WorkoutExerciseCard({
  ex,
  level,
  isActive,
  onPrev,
  onNext,
  onSelect,
  sessionDate,
  sessionLog,
  onUpdateSet,
  onUpdateNotes,
  restSecondsDefault,
  notificationsEnabled,
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [showCues, setShowCues] = useState(true);
  const [showMistakes, setShowMistakes] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(restSecondsDefault);
  const [lastCompletedSet, setLastCompletedSet] = useState(null);
  const total = useMemo(() => Math.max(1, restSecondsDefault), [restSecondsDefault]);

  useEffect(() => {
    // Reset timer when default changes
    setSecondsLeft(restSecondsDefault);
    setTimerRunning(false);
    setLastCompletedSet(null);
  }, [restSecondsDefault, ex.id]);

  useInterval(
    () => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          if (notificationsEnabled) fireNotification("Rest finished", `${ex.ex}: ready for the next set.`);
          return restSecondsDefault;
        }
        return s - 1;
      });
    },
    timerRunning ? 1000 : null
  );

  const startText = level === "Advanced" ? ex.startAdvanced : ex.startBeginner;
  const sets = sessionLog?.sets || Array.from({ length: ex.sets }, () => ({ kg: "", reps: "" }));
  const notes = sessionLog?.notes || "";

  return (
    <Card className={`rounded-3xl ${isActive ? "border-foreground" : ""}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">{ex.ex}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {ex.sets} sets • {ex.reps} • Start: <span className="font-medium text-foreground">{startText}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={onPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={onNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={showVideo ? "secondary" : "outline"}
            className="rounded-2xl"
            onClick={() => setShowVideo((v) => !v)}
          >
            <PlayCircle className="h-4 w-4 mr-2" /> Video
          </Button>
          <Button
            size="sm"
            variant={showCues ? "secondary" : "outline"}
            className="rounded-2xl"
            onClick={() => setShowCues((v) => !v)}
          >
            Form cues
          </Button>
          <Button
            size="sm"
            variant={showMistakes ? "secondary" : "outline"}
            className="rounded-2xl"
            onClick={() => setShowMistakes((v) => !v)}
          >
            Common mistakes
          </Button>
        </div>

        {showVideo && (
          <div className="space-y-2">
            <div className="aspect-video w-full">
              <iframe className="w-full h-full rounded-2xl" src={ex.video} title={ex.ex} allowFullScreen />
            </div>
            <Small>
              If the embed doesn’t load, open the video in YouTube by clicking the title on the player.
            </Small>
          </div>
        )}

        {(showCues || showMistakes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {showCues && (
              <div className="rounded-2xl border p-3">
                <div className="text-sm font-semibold">Form cues</div>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {ex.cues.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {showMistakes && (
              <div className="rounded-2xl border p-3">
                <div className="text-sm font-semibold">Common mistakes</div>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {ex.mistakes.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Rest timer</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">{secondsLeft}s</Badge>
              <Button
                size="sm"
                variant={timerRunning ? "secondary" : "outline"}
                className="rounded-2xl"
                onClick={() => setTimerRunning((r) => !r)}
              >
                <Timer className="h-4 w-4 mr-2" /> {timerRunning ? "Pause" : "Start"}
              </Button>
            </div>
          </div>
          <Progress value={((total - secondsLeft) / total) * 100} />
          <div className="flex flex-wrap gap-2">
            {[60, 90, 120, 180].map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(s);
                }}
              >
                {s}s
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-3 space-y-2">
          <div className="text-sm font-semibold">Log your sets ({sessionDate})</div>
          <div className="space-y-2">
            {sets.map((s, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-2 items-center rounded-2xl p-1 ${
                  lastCompletedSet === idx ? "bg-muted" : ""
                }`}
              >
                <div className="col-span-2 text-xs text-muted-foreground">Set {idx + 1}</div>
                <Input
                  className="col-span-4 rounded-2xl"
                  inputMode="decimal"
                  placeholder="kg"
                  value={s.kg}
                  onFocus={onSelect}
                  onChange={(e) => onUpdateSet(ex.id, idx, { ...s, kg: e.target.value })}
                />
                <Input
                  className="col-span-4 rounded-2xl"
                  inputMode="numeric"
                  placeholder="reps"
                  value={s.reps}
                  onFocus={onSelect}
                  onChange={(e) => onUpdateSet(ex.id, idx, { ...s, reps: e.target.value })}
                />
                <Button
                  className="col-span-2 rounded-2xl"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setLastCompletedSet(idx);
                    setTimerRunning(false);
                    setSecondsLeft(restSecondsDefault);
                    setTimerRunning(true);
                    try {
                      navigator.vibrate?.(60);
                    } catch {}
                  }}
                >
                  Done
                </Button>
              </div>
            ))}
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">Notes</div>
          <Input
            className="rounded-2xl"
            placeholder="How did it feel? (e.g., RPE, form notes, next goal)"
            value={notes}
            onFocus={onSelect}
            onChange={(e) => onUpdateNotes(ex.id, e.target.value)}
          />
        </div>

        <Small>
          Tip: When you hit the top of the rep range with clean form, increase weight next session.
        </Small>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dayTab, setDayTab] = useState("push");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sessionDate, setSessionDate] = useState(todayISO());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const weighIns = data.tracker.weighIns || [];
  const currentWeight = useMemo(() => {
    if (!weighIns.length) return data.profile.startWeightKg;
    return weighIns[weighIns.length - 1].kg;
  }, [weighIns, data.profile.startWeightKg]);

  const progressPct = useMemo(() => {
    const start = data.profile.startWeightKg;
    const target = data.profile.targetWeightKg;
    const pct = ((currentWeight - start) / (target - start)) * 100;
    return clamp(isFinite(pct) ? pct : 0, 0, 100);
  }, [currentWeight, data.profile]);

  const chartData = useMemo(() => weighIns.map((w) => ({ ...w, dateShort: w.date.slice(5) })), [weighIns]);

  const workoutList = useMemo(() => exerciseLibrary[dayTab] || [], [dayTab]);

  useEffect(() => {
    setActiveIndex(0);
  }, [dayTab]);

  function updateProfile(key, value) {
    setData((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));
  }

  function updateCalories(key, value) {
    setData((d) => ({ ...d, calories: { ...d.calories, [key]: value } }));
  }

  function addWeighIn(date, kg) {
    if (!date || kg === "") return;
    const val = Number(kg);
    if (!isFinite(val) || val <= 0) return;
    setData((d) => {
      const next = [...(d.tracker.weighIns || [])];
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
      tracker: { ...d.tracker, weighIns: (d.tracker.weighIns || []).filter((x) => x.date !== date) },
    }));
  }

  function setMeasurement(key, value) {
    setData((d) => ({
      ...d,
      tracker: {
        ...d.tracker,
        measurements: { ...(d.tracker.measurements || defaultData.tracker.measurements), [key]: value },
      },
    }));
  }

  function ensureSession() {
    setData((d) => {
      const sessions = { ...(d.logs.sessions || {}) };
      if (!sessions[sessionDate]) sessions[sessionDate] = {};
      return { ...d, logs: { ...d.logs, sessions } };
    });
  }

  function updateSet(exId, setIdx, newSet) {
    ensureSession();
    setData((d) => {
      const sessions = { ...(d.logs.sessions || {}) };
      const day = { ...(sessions[sessionDate] || {}) };
      const existing = day[exId] || { sets: [], notes: "" };
      const sets = [...(existing.sets || [])];
      // Expand to at least setIdx+1
      while (sets.length < setIdx + 1) sets.push({ kg: "", reps: "" });
      sets[setIdx] = { kg: newSet.kg, reps: newSet.reps };
      day[exId] = { ...existing, sets };
      sessions[sessionDate] = day;

      // Update PR (simple: highest kg with any reps)
      const prs = { ...(d.logs.prs || {}) };
      const kgNum = Number(newSet.kg);
      const repsNum = Number(newSet.reps);
      if (isFinite(kgNum) && kgNum > 0 && isFinite(repsNum) && repsNum > 0) {
        const prev = prs[exId];
        const bestKg = prev?.bestKg ?? 0;
        if (kgNum > bestKg || (kgNum === bestKg && repsNum > (prev?.bestReps ?? 0))) {
          prs[exId] = { bestKg: kgNum, bestReps: repsNum, date: sessionDate };
        }
      }

      return { ...d, logs: { ...d.logs, sessions, prs } };
    });
  }

  function updateNotes(exId, notes) {
    ensureSession();
    setData((d) => {
      const sessions = { ...(d.logs.sessions || {}) };
      const day = { ...(sessions[sessionDate] || {}) };
      const existing = day[exId] || { sets: [], notes: "" };
      day[exId] = { ...existing, notes };
      sessions[sessionDate] = day;
      return { ...d, logs: { ...d.logs, sessions } };
    });
  }

  function currentSessionLog(exId) {
    return data.logs.sessions?.[sessionDate]?.[exId] || null;
  }

  function toggleNotifications() {
    const ok = requestNotifyPermission();
    setData((d) => ({ ...d, settings: { ...d.settings, notificationsEnabled: ok ? !d.settings.notificationsEnabled : false } }));
  }

  const activeExercise = workoutList[clamp(activeIndex, 0, Math.max(0, workoutList.length - 1))];

  const prsForDay = useMemo(() => {
    const prs = data.logs.prs || {};
    return workoutList
      .map((e) => ({
        id: e.id,
        ex: e.ex,
        pr: prs[e.id],
      }))
      .filter((x) => x.pr);
  }, [data.logs.prs, workoutList]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MJ WORKOUT</h1>
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
            <Button variant="secondary" size="sm" onClick={() => exportJSON(data)} className="rounded-2xl">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0], setData)}
              />
              <Button variant="outline" size="sm" className="rounded-2xl">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
            </label>
          </div>
        </header>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4 space-y-3">
            <SectionTitle
              title="Progress"
              right={<div className="text-sm font-medium">{Number(currentWeight).toFixed(1)} kg</div>}
            />
            <Progress value={progressPct} />
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="rounded-full">
                To target: {Math.max(0, data.profile.targetWeightKg - currentWeight).toFixed(1)} kg
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                Calories: Reg {data.calories.bulkRegular} • Shift {data.calories.bulkShiftLow}-{data.calories.bulkShiftHigh}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                Level: {data.profile.level}
              </Badge>
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
                <SectionTitle title="Quick Settings" />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Level</div>
                    <PillToggle
                      value={data.profile.level}
                      options={["Beginner", "Advanced"]}
                      onChange={(v) => updateProfile("level", v)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Rest timer default</div>
                    <PillToggle
                      value={`${data.settings.restSecondsDefault}s`}
                      options={["60s", "90s", "120s", "180s"]}
                      onChange={(v) => setData((d) => ({ ...d, settings: { ...d.settings, restSecondsDefault: Number(v.replace("s", "")) } }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Timer notifications</div>
                    <Button
                      size="sm"
                      variant={data.settings.notificationsEnabled ? "secondary" : "outline"}
                      className="rounded-2xl"
                      onClick={toggleNotifications}
                    >
                      {data.settings.notificationsEnabled ? (
                        <>
                          <Bell className="h-4 w-4 mr-2" /> On
                        </>
                      ) : (
                        <>
                          <BellOff className="h-4 w-4 mr-2" /> Off
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Regular calories</div>
                    <Input
                      className="rounded-2xl"
                      inputMode="numeric"
                      value={data.calories.bulkRegular}
                      onChange={(e) => updateCalories("bulkRegular", Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Shift calories (low)</div>
                    <Input
                      className="rounded-2xl"
                      inputMode="numeric"
                      value={data.calories.bulkShiftLow}
                      onChange={(e) => updateCalories("bulkShiftLow", Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Shift calories (high)</div>
                    <Input
                      className="rounded-2xl"
                      inputMode="numeric"
                      value={data.calories.bulkShiftHigh}
                      onChange={(e) => updateCalories("bulkShiftHigh", Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Protein target (g)</div>
                    <Input
                      className="rounded-2xl"
                      inputMode="numeric"
                      value={data.calories.proteinTargetG}
                      onChange={(e) => updateCalories("proteinTargetG", Number(e.target.value || 0))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="12-Week Roadmap" />
                <div className="space-y-3">
                  {data.roadmap.weeks.map((w, i) => (
                    <div key={i} className="rounded-2xl border p-3">
                      <div className="font-semibold">{w.title}</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {w.bullets.map((b, j) => (
                          <li key={j} className="text-sm text-muted-foreground">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="mt-4 space-y-4">
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle
                  title="Workout Day"
                  right={
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">Session</Badge>
                      <Input
                        type="date"
                        className="rounded-2xl"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                      />
                    </div>
                  }
                />

                <div className="flex flex-wrap items-center gap-2">
                  <PillToggle value={dayTab} options={["push", "pull", "legs"]} onChange={setDayTab} />
                  <Badge variant="secondary" className="rounded-full">Auto-next: use arrows</Badge>
                </div>

                <Separator />

                {prsForDay.length > 0 && (
                  <div className="rounded-2xl border p-3 space-y-2">
                    <div className="text-sm font-semibold">Your PRs (this workout)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prsForDay.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-muted p-3 text-sm">
                          <div className="font-medium">{p.ex}</div>
                          <div className="text-muted-foreground">
                            {p.pr.bestKg} kg × {p.pr.bestReps} (on {p.pr.date})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {workoutList.map((ex, idx) => (
                    <WorkoutExerciseCard
                      key={ex.id}
                      ex={ex}
                      level={data.profile.level}
                      isActive={idx === activeIndex}
                      onPrev={() => setActiveIndex((i) => clamp(i - 1, 0, workoutList.length - 1))}
                      onNext={() => setActiveIndex((i) => clamp(i + 1, 0, workoutList.length - 1))}
                      onSelect={() => setActiveIndex(idx)}
                      sessionDate={sessionDate}
                      sessionLog={currentSessionLog(ex.id)}
                      onUpdateSet={updateSet}
                      onUpdateNotes={updateNotes}
                      restSecondsDefault={data.settings.restSecondsDefault}
                      notificationsEnabled={data.settings.notificationsEnabled}
                    />
                  ))}
                </div>
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
                <ul className="list-disc pl-5 space-y-1">
                  {data.mealPlan.dailyTemplate.map((x, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{x}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="No-Yogurt Substitutes" />
                <ul className="list-disc pl-5 space-y-1">
                  {data.mealPlan.noYogurtSubs.map((x, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{x}</li>
                  ))}
                </ul>
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
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {r.ingredients.map((x, j) => (
                          <li key={j} className="text-sm text-muted-foreground">{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border p-3">
                      <div className="text-sm font-semibold">Steps</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {r.steps.map((x, j) => (
                          <li key={j} className="text-sm text-muted-foreground">{x}</li>
                        ))}
                      </ul>
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
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {data.grocery.protein.map((x, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Carbs</div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {data.grocery.carbs.map((x, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Fats & boosters</div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {data.grocery.fats.map((x, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border p-3">
                    <div className="text-sm font-semibold">Veg & extras</div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {data.grocery.vegExtras.map((x, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{x}</li>
                      ))}
                    </ul>
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
                <Small>Weigh 3×/week (morning). If no gain for 2 weeks, add 200 kcal/day.</Small>
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
                        <YAxis
                          domain={[(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)]}
                          tick={{ fontSize: 12 }}
                        />
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
                <SectionTitle title="Measurements" />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["chestCm", "Chest (cm)"],
                    ["waistCm", "Waist (cm)"],
                    ["armCm", "Arm (cm)"],
                    ["thighCm", "Thigh (cm)"],
                  ].map(([k, label]) => (
                    <div key={k} className="space-y-1">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <Input
                        className="rounded-2xl"
                        inputMode="decimal"
                        value={data.tracker.measurements?.[k] ?? ""}
                        onChange={(e) => setMeasurement(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <Small>Update these every 2–4 weeks for the best read on muscle gain.</Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-3">
                <SectionTitle
                  title="Weigh-In Entries"
                  right={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => {
                        if (!weighIns.length) return;
                        if (confirm("Clear all weigh-ins?")) setData((d) => ({ ...d, tracker: { ...d.tracker, weighIns: [] } }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Clear
                    </Button>
                  }
                />
                <div className="space-y-2">
                  {weighIns.length ? (
                    [...weighIns].slice().reverse().map((w) => (
                      <div key={w.date} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <div className="text-sm font-semibold">{w.date}</div>
                          <div className="text-sm text-muted-foreground">{Number(w.kg).toFixed(1)} kg</div>
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
            Tip: On iPhone/Android, open your deployed link → share/menu → <span className="font-medium text-foreground">Add to Home Screen</span>.
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
