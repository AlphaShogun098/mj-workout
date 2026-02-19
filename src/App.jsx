import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  Sparkles,
  Flame,
  Swords,
  Crown,
} from "lucide-react";

/**
 * MJ WORKOUT — Lean Bulk PWA
 * Level 2 (Advanced) includes:
 * - More volume on compounds (+1 set) and key accessories (+1 set)
 * - Slightly heavier rep ranges on main lifts
 * - Longer default rest on main lifts
 * - Optional intensity finisher cues (AMRAP / back-off set)
 * - Recommended calorie bump displayed (doesn't force-change your saved targets)
 */

const STORAGE_KEY = "mj_workout_pwa_v4";

// --- Exercise library (includes videos + cues) ---
const exerciseLibrary = {
  push: [
    {
      id: "bench",
      ex: "Bench Press",
      sets: 4,
      reps: "6–10",
      startBeginner: "40–50 kg",
      startAdvanced: "50–65 kg",
      tier: "main",
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
      tier: "secondary",
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
      tier: "main",
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
      tier: "accessory",
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
      tier: "secondary",
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
      tier: "accessory",
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
      tier: "main",
      video: "https://www.youtube.com/embed/op9kVnSso6Q",
      cues: [
        "Bar over midfoot.",
        "Brace hard; lats tight ('squeeze oranges in armpits').",
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
      tier: "secondary",
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
      tier: "main",
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
      tier: "secondary",
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
      tier: "accessory",
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
      tier: "accessory",
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
      tier: "main",
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
      tier: "secondary",
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
      tier: "secondary",
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
      tier: "main",
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
      tier: "accessory",
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
      tier: "accessory",
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
    shiftDayAddOn:
      "On 12-hour shifts, add 200–300 kcal (extra milk, sandwich, trail mix, bigger rice portion).",
  },
  recipes: [
    {
      name: "Weight Gain Smoothie",
      macros: "~800 kcal, ~40g protein",
      ingredients: [
        "2 cups milk",
        "1 banana",
        "2 tbsp peanut butter",
        "1/2 cup oats",
        "Protein powder (optional)",
      ],
      steps: ["Blend everything until smooth.", "Drink immediately (easy calories)."],
    },
    {
      name: "Mince & Rice Bowl",
      macros: "~850 kcal, ~45g protein",
      ingredients: [
        "200g beef mince",
        "1.5 cups cooked rice",
        "1 cup frozen veg",
        "1 tbsp olive oil",
        "Sauce (optional)",
      ],
      steps: [
        "Cook mince (salt/pepper).",
        "Heat veg and rice.",
        "Combine and drizzle olive oil + sauce.",
      ],
    },
    {
      name: "Chicken Pasta",
      macros: "~900 kcal, ~55g protein",
      ingredients: [
        "200g chicken thighs",
        "2 cups cooked pasta",
        "1/2 cup pasta sauce",
        "30g cheese",
        "1 tbsp olive oil",
      ],
      steps: [
        "Cook chicken (pan/oven).",
        "Mix pasta + sauce.",
        "Add chicken, cheese, and olive oil.",
      ],
    },
    {
      name: "High-Calorie Oats",
      macros: "~700 kcal, ~30g protein",
      ingredients: [
        "1 cup oats",
        "1.5 cups milk",
        "2 tbsp peanut butter",
        "1 banana",
        "Honey (optional)",
      ],
      steps: [
        "Cook oats with milk.",
        "Stir in peanut butter.",
        "Top with banana (and honey).",
      ],
    },
  ],
  grocery: {
    protein: [
      "Eggs – 24 pack",
      "Chicken thighs – 2 kg",
      "Beef mince – 1.5 kg",
      "Canned tuna – 4 cans",
      "Milk – 6–8 L",
      "Protein powder (optional)",
    ],
    carbs: [
      "Rice – 2 kg",
      "Pasta – 1–2 kg",
      "Potatoes – 2 kg",
      "Oats – 1 kg",
      "Bread/wraps – 1–2 loaves",
      "Bananas – 7–10",
    ],
    fats: [
      "Peanut butter – 1 large jar",
      "Olive oil – 1 bottle",
      "Cheese – 500 g",
      "Nuts/trail mix – 500 g",
      "Butter",
    ],
    vegExtras: [
      "Frozen veg – 2–3 bags",
      "Pasta sauce – 2 jars",
      "BBQ/stir-fry sauce",
      "Honey",
    ],
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
    sessions: {},
    prs: {},
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
  return {
    ...defaultData,
    ...parsed,
    profile: { ...defaultData.profile, ...(parsed.profile || {}) },
    calories: { ...defaultData.calories, ...(parsed.calories || {}) },
    tracker: { ...defaultData.tracker, ...(parsed.tracker || {}) },
    logs: { ...defaultData.logs, ...(parsed.logs || {}) },
    settings: { ...defaultData.settings, ...(parsed.settings || {}) },
  };
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
  return (
    <div className="text-sm text-slate-300/80 leading-relaxed">{children}</div>
  );
}

function PillToggle({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-2 text-sm transition ${
            value === opt
              ? "bg-gradient-to-r from-violet-500/70 to-cyan-400/60 text-white"
              : "text-slate-200/80 hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
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
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {right}
    </div>
  );
}

function RankBadge({ level, progressPct }) {
  const rank = level === "Advanced" ? "S-RANK" : "B-RANK";
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
        <Crown className="h-4 w-4 text-cyan-200" />
      </span>
      <div className="leading-tight">
        <div className="text-xs text-slate-300/70">Hunter Rank</div>
        <div className="text-sm font-semibold text-white">{rank}</div>
      </div>
      <div className="ml-2 w-28">
        <div className="text-[10px] text-slate-300/70">XP</div>
        <Progress value={progressPct} />
      </div>
    </div>
  );
}

function LevelUpToast({ data, onClose }) {
  useEffect(() => {
    if (!data) return;
    const id = setTimeout(() => onClose?.(), 2600);
    return () => clearTimeout(id);
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="rounded-3xl border border-cyan-400/25 bg-black/70 backdrop-blur px-4 py-3 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/20">
                <Flame className="h-5 w-5 text-cyan-200" />
              </span>
              <div className="leading-tight">
                <div className="text-xs tracking-widest text-cyan-200/90">LEVEL UP • NEW PR</div>
                <div className="text-sm font-semibold text-white">
                  {data.ex}
                  <span className="text-slate-300/80 font-medium"> — {data.kg} kg × {data.reps}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-2xl text-white/80 hover:text-white"
                onClick={onClose}
              >
                ✕
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Level 2 rules ---
function isMainLift(exId) {
  return ["bench", "squat", "deadlift", "ohp", "row", "hipthrust"].includes(exId);
}

function applyLevel(ex, level) {
  if (level !== "Advanced") return ex;

  // Level 2: +1 set on main lifts and selected secondary lifts
  let sets = ex.sets;
  if (isMainLift(ex.id)) sets = ex.sets + 1;
  else if (["incline-db", "pullups", "onearm-row", "rdl", "bulgarian"].includes(ex.id))
    sets = ex.sets + 1;

  // Level 2 rep ranges: slightly heavier work on main lifts
  let reps = ex.reps;
  if (ex.id === "bench") reps = "5–8";
  if (ex.id === "squat") reps = "5–8";
  if (ex.id === "deadlift") reps = "3–5";
  if (ex.id === "ohp") reps = "5–8";
  if (ex.id === "row") reps = "6–10";

  // Add a finisher cue for Level 2 (optional)
  const finisher = isMainLift(ex.id)
    ? "Level 2 finisher: Last set = AMRAP leaving 0–1 reps in reserve (stop before form breaks)."
    : "Level 2 finisher: On the last set, slow 3 sec negatives.";

  return {
    ...ex,
    sets,
    reps,
    level2Finisher: finisher,
  };
}

function recommendedRestSeconds(level, exId, base) {
  if (level !== "Advanced") return base;
  if (isMainLift(exId)) return Math.max(base, 180);
  return Math.max(base, 120);
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

  const rest = useMemo(
    () => recommendedRestSeconds(level, ex.id, restSecondsDefault),
    [level, ex.id, restSecondsDefault]
  );

  const [secondsLeft, setSecondsLeft] = useState(rest);
  const [lastCompletedSet, setLastCompletedSet] = useState(null);
  const total = useMemo(() => Math.max(1, rest), [rest]);

  useEffect(() => {
    setSecondsLeft(rest);
    setTimerRunning(false);
    setLastCompletedSet(null);
  }, [rest, ex.id]);

  useInterval(
    () => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          if (notificationsEnabled)
            fireNotification("Rest finished", `${ex.ex}: ready for the next set.`);
          return rest;
        }
        return s - 1;
      });
    },
    timerRunning ? 1000 : null
  );

  const startText = level === "Advanced" ? ex.startAdvanced : ex.startBeginner;

  // Always render ALL planned sets
  const setsRaw = sessionLog?.sets || [];
  const sets = [...setsRaw];
  while (sets.length < ex.sets) sets.push({ kg: "", reps: "" });
  sets.length = ex.sets;

  const notes = sessionLog?.notes || "";

  const completedSetsCount = useMemo(() => {
    let c = 0;
    for (const s of sets) {
      const kg = Number(s.kg);
      const reps = Number(s.reps);
      if (isFinite(kg) && kg > 0 && isFinite(reps) && reps > 0) c += 1;
    }
    return c;
  }, [sets]);

  const questPct = useMemo(() => {
    return ex.sets ? Math.round((completedSetsCount / ex.sets) * 100) : 0;
  }, [completedSetsCount, ex.sets]);

   return (
    <motion.div
      initial={false}
      animate={
        isActive
          ? {
              boxShadow:
                "0 0 0 1px rgba(34,211,238,0.35), 0 0 70px rgba(34,211,238,0.10)",
            }
          : { boxShadow: "0 0 0 0px rgba(0,0,0,0)" }
      }
      transition={{ duration: 0.25 }}
      className="rounded-3xl"
    >
      <Card
        className={`rounded-3xl overflow-hidden border-white/10 bg-white/5 backdrop-blur shadow-[0_0_30px_rgba(99,102,241,0.10)] ${
          isActive ? "ring-1 ring-violet-400/60" : ""
        }`}
      >
        <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-white flex items-center gap-2">
              {isMainLift(ex.id) ? <Swords className="h-4 w-4 text-cyan-300" /> : <Sparkles className="h-4 w-4 text-violet-300" />}
              {ex.ex}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                Quest: {completedSetsCount}/{ex.sets} sets
              </Badge>
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                {questPct}% complete
              </Badge>
            </div>
            <div className="mt-1 text-sm text-slate-300/80">
              {ex.sets} sets • {ex.reps} • Start:{" "}
              <span className="font-medium text-white">{startText}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-col items-end">
            <Button variant="outline" size="sm" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10" onClick={onPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10" onClick={onNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={showVideo ? "secondary" : "outline"}
            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => setShowVideo((v) => !v)}
          >
            <PlayCircle className="h-4 w-4 mr-2" /> Video
          </Button>
          <Button
            size="sm"
            variant={showCues ? "secondary" : "outline"}
            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => setShowCues((v) => !v)}
          >
            Form cues
          </Button>
          <Button
            size="sm"
            variant={showMistakes ? "secondary" : "outline"}
            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => setShowMistakes((v) => !v)}
          >
            Common mistakes
          </Button>
        </div>

        {level === "Advanced" && ex.level2Finisher && (
          <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-violet-200" /> Level 2 finisher
            </div>
            <div className="text-sm text-slate-200/80 mt-1">{ex.level2Finisher}</div>
          </div>
        )}

        {showVideo && (
          <div className="space-y-2">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-2xl"
                src={ex.video}
                title={ex.ex}
                allowFullScreen
              />
            </div>
          </div>
        )}

        {(showCues || showMistakes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {showCues && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-sm font-semibold text-white">Form cues</div>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {ex.cues.map((c, i) => (
                    <li key={i} className="text-sm text-slate-300/80">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showMistakes && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-sm font-semibold text-white">Common mistakes</div>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {ex.mistakes.map((m, i) => (
                    <li key={i} className="text-sm text-slate-300/80">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Rest timer</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full bg-white/10 text-white border border-white/10">
                {secondsLeft}s
              </Badge>
              <Button
                size="sm"
                variant={timerRunning ? "secondary" : "outline"}
                className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => setTimerRunning((r) => !r)}
              >
                <Timer className="h-4 w-4 mr-2" /> {timerRunning ? "Pause" : "Start"}
              </Button>
            </div>
          </div>
          <Progress value={((total - secondsLeft) / total) * 100} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
  <div className="text-sm font-semibold text-white">Log your sets ({sessionDate})</div>
  <div className="w-28">
    <Progress value={questPct} />
  </div>
</div>
          <div className="space-y-2">
            {sets.map((s, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-2 items-center rounded-2xl p-1 ${
                  lastCompletedSet === idx ? "bg-white/5" : ""
                }`}
              >
                <div className="col-span-2 text-xs text-slate-300/70">Set {idx + 1}</div>
                <Input
                  className="col-span-4 rounded-2xl bg-white/5 border-white/10 text-white"
                  inputMode="decimal"
                  placeholder="kg"
                  value={s.kg}
                  onFocus={onSelect}
                  onChange={(e) => onUpdateSet(ex.id, idx, { ...s, kg: e.target.value })}
                />
                <Input
                  className="col-span-4 rounded-2xl bg-white/5 border-white/10 text-white"
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

  // XP flash animation
  const el = document.body;
  el.classList.add("xp-flash");
  setTimeout(() => el.classList.remove("xp-flash"), 300);

  setTimerRunning(false);
  setSecondsLeft(rest);
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
          <div className="text-xs text-slate-300/70">Notes</div>
          <Input
            className="rounded-2xl bg-white/5 border-white/10 text-white"
            placeholder="How did it feel? (e.g., RPE, form notes, next goal)"
            value={notes}
            onFocus={onSelect}
            onChange={(e) => onUpdateNotes(ex.id, e.target.value)}
          />
        </div>

        <Small>
          Progression: hit the top of the rep range with clean form → add weight next session.
        </Small>
      </CardContent>
      </Card>
    </motion.div>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dayTab, setDayTab] = useState("push");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sessionDate, setSessionDate] = useState(todayISO());
  const [showSummary, setShowSummary] = useState(false);
  const [levelUp, setLevelUp] = useState(null);
  const levelUpSound = useRef(null);

  useEffect(() => {
document.documentElement.classList.add("dark");
  document.body.style.backgroundColor = "#000";
    saveData(data);
  }, [data]);

  const level = data.profile.level;

  // Level 2 recommended calorie bump (display only)
  const recommendedCalories = useMemo(() => {
    if (level !== "Advanced") return null;
    return {
      bulkRegular: data.calories.bulkRegular + 150,
      bulkShiftLow: data.calories.bulkShiftLow + 150,
      bulkShiftHigh: data.calories.bulkShiftHigh + 150,
      proteinTargetG: Math.max(data.calories.proteinTargetG, 150),
    };
  }, [level, data.calories]);

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

  const chartData = useMemo(
    () => weighIns.map((w) => ({ ...w, dateShort: w.date.slice(5) })),
    [weighIns]
  );

  const workoutList = useMemo(() => {
    const base = exerciseLibrary[dayTab] || [];
    return base.map((e) => applyLevel(e, level));
  }, [dayTab, level]);

  useEffect(() => {
    setActiveIndex(0);
  }, [dayTab, level]);

  function updateProfile(key, value) {
    setData((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));
  }

  function updateCalories(key, value) {
    setData((d) => ({ ...d, calories: { ...d.calories, [key]: value } }));
  }

  function applyRecommendedAdvancedCalories() {
    if (!recommendedCalories) return;
    setData((d) => ({
      ...d,
      calories: {
        ...d.calories,
        ...recommendedCalories,
      },
    }));
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
      tracker: {
        ...d.tracker,
        weighIns: (d.tracker.weighIns || []).filter((x) => x.date !== date),
      },
    }));
  }

  function setMeasurement(key, value) {
    setData((d) => ({
      ...d,
      tracker: {
        ...d.tracker,
        measurements: {
          ...(d.tracker.measurements || defaultData.tracker.measurements),
          [key]: value,
        },
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

  let levelUpPayload = null;

  setData((d) => {
    const sessions = { ...(d.logs.sessions || {}) };
    const day = { ...(sessions[sessionDate] || {}) };
    const existing = day[exId] || { sets: [], notes: "" };
    const sets = [...(existing.sets || [])];

    while (sets.length < setIdx + 1) sets.push({ kg: "", reps: "" });
    sets[setIdx] = { kg: newSet.kg, reps: newSet.reps };

    day[exId] = { ...existing, sets };
    sessions[sessionDate] = day;

    const prs = { ...(d.logs.prs || {}) };
    const kgNum = Number(newSet.kg);
    const repsNum = Number(newSet.reps);

    if (isFinite(kgNum) && kgNum > 0 && isFinite(repsNum) && repsNum > 0) {
      const prev = prs[exId];
      const bestKg = prev?.bestKg ?? 0;
      const bestReps = prev?.bestReps ?? 0;

      const isNewPR = kgNum > bestKg || (kgNum === bestKg && repsNum > bestReps);

      if (isNewPR) {
        prs[exId] = { bestKg: kgNum, bestReps: repsNum, date: sessionDate };

        // We'll trigger the toast AFTER setData finishes
        const exName = workoutList.find((w) => w.id === exId)?.ex || "Exercise";
        levelUpPayload = { ex: exName, kg: kgNum, reps: repsNum };
      }
    }

    return { ...d, logs: { ...d.logs, sessions, prs } };
  });

  // ✅ THIS is the part you said you couldn't find
  // It's right after the setData(...) call ends.
  if (levelUpPayload) {
    try {
      navigator.vibrate?.([40, 40, 40]);
    } catch {}
    setLevelUp(levelUpPayload);levelUpSound.current?.play();
  }
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
    setData((d) => ({
      ...d,
      settings: {
        ...d.settings,
        notificationsEnabled: ok
          ? !d.settings.notificationsEnabled
          : false,
      },
    }));
  }

  const prsForDay = useMemo(() => {
    const prs = data.logs.prs || {};
    return workoutList
      .map((e) => ({ id: e.id, ex: e.ex, pr: prs[e.id] }))
      .filter((x) => x.pr);
  }, [data.logs.prs, workoutList]);

  const sessionSummary = useMemo(() => {
    const dayLogs = data.logs.sessions?.[sessionDate] || {};
    let completedSets = 0;
    let plannedSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    const perExercise = [];

    for (const ex of workoutList) {
      plannedSets += ex.sets;
      const log = dayLogs[ex.id];
      const sets = (log?.sets || []).filter(
        (s) =>
          s &&
          String(s.kg).trim() !== "" &&
          String(s.reps).trim() !== ""
      );
      let exReps = 0;
      let exVol = 0;
      for (const s of sets) {
        const kg = Number(s.kg);
        const reps = Number(s.reps);
        if (isFinite(kg) && isFinite(reps) && kg > 0 && reps > 0) {
          completedSets += 1;
          exReps += reps;
          exVol += kg * reps;
        }
      }
      totalReps += exReps;
      totalVolume += exVol;
      if (sets.length) {
        perExercise.push({
          name: ex.ex,
          sets: sets.length,
          reps: exReps,
          volume: exVol,
        });
      }
    }

    const prs = data.logs.prs || {};
    const prsHit = workoutList
      .map((ex) => (prs[ex.id] ? { ex: ex.ex, ...prs[ex.id] } : null))
      .filter(Boolean)
      .filter((pr) => pr.date === sessionDate);

    const completionPct = plannedSets
      ? Math.round((completedSets / plannedSets) * 100)
      : 0;

    return {
      plannedSets,
      completedSets,
      completionPct,
      totalReps,
      totalVolume,
      prsHit,
      perExercise,
    };
  }, [data.logs.sessions, data.logs.prs, sessionDate, workoutList]);

  return (
    <div className="min-h-screen bg-black text-white">
/* Background layer (always visible) */}
<div className="fixed inset-0 z-0 pointer-events-none">
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: [
        "radial-gradient(circle at 20% 10%, rgba(0,255,255,0.35), transparent 40%)",
        "radial-gradient(circle at 80% 30%, rgba(139,92,246,0.45), transparent 50%)",
        "radial-gradient(circle at 30% 90%, rgba(168,85,247,0.25), transparent 55%)",
        "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.92) 78%)",
      ].join(", "),
    }}
  />
  <div
    className="absolute inset-0 opacity-25"
    style={{
      backgroundImage:
        "repeating-linear-gradient(180deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 10px)",
    }}
  />
  <div className="absolute inset-0 opacity-30 animate-pulse"
       style={{
         backgroundImage:
           "linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.12) 50%, transparent 100%)",
       }}
  />
</div>
{/* Deep vignette + aura */}
{/* Aura background (inline styles so it always renders) */}
<div
  className="pointer-events-none fixed inset-0 -z-10"
  style={{
    backgroundImage: [
      "radial-gradient(circle at 20% 10%, rgba(0,255,255,0.35), transparent 40%)",
      "radial-gradient(circle at 80% 30%, rgba(139,92,246,0.45), transparent 50%)",
      "radial-gradient(circle at 30% 90%, rgba(168,85,247,0.25), transparent 55%)",
      "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.92) 78%)",
    ].join(", "),
  }}
/>

{/* Scan lines */}
<div
  className="pointer-events-none fixed inset-0 -z-10 opacity-25"
  style={{
    backgroundImage:
      "repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 10px)",
  }}
/>

{/* Energy sweep */}
<div
  className="pointer-events-none fixed inset-0 -z-10 opacity-30"
  style={{
    backgroundImage:
      "linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.10) 50%, transparent 100%)",
    animation: "mjSweep 3.2s ease-in-out infinite",
  }}
/>

<style>{`
  @keyframes mjSweep {
    0% { transform: translateX(-20%); opacity: 0.12; }
    50% { transform: translateX(0%); opacity: 0.35; }
    100% { transform: translateX(20%); opacity: 0.12; }
  }
`}</style>
      
  <LevelUpToast data={levelUp} onClose={() => setLevelUp(null)} />
      <div className="relative z-10 mx-auto max-w-2xl p-3 sm:p-6 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="absolute -z-10 h-14 w-14 rounded-full blur-2xl bg-cyan-400/20" />
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                <Sparkles className="h-4 w-4 text-cyan-200" />
              </span>
              MJ WORKOUT
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-300/80">
              <span>{data.profile.heightCm} cm</span>
              <span>•</span>
              <span>Start {data.profile.startWeightKg} kg</span>
              <span>→</span>
              <span>Target {data.profile.targetWeightKg} kg</span>
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                {data.calories.proteinTargetG}g protein
              </Badge>
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                {level === "Advanced" ? "Level 2" : "Level 1"}
              </Badge>
            </div>
          </div>

<div className="flex flex-col items-end gap-2">
  {/* 🔥 Hunter Rank Badge */}
  <RankBadge level={level} progressPct={progressPct} />

  <div className="flex gap-2">
    <Button
      variant="secondary"
      size="sm"
      onClick={() => exportJSON(data)}
      className="rounded-2xl"
    >
      <Download className="h-4 w-4 mr-2" /> Export
    </Button>

    <label className="inline-flex">
      <input
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && importJSON(e.target.files[0], setData)
        }
      />
      <Button
        variant="outline"
        size="sm"
        className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
      >
        <Upload className="h-4 w-4 mr-2" /> Import
      </Button>
    </label>
  </div>
</div>
        </header>

        <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur shadow-[0_0_30px_rgba(34,211,238,0.10)]">
          <CardContent className="p-4 space-y-3">
            <SectionTitle
              title="Progress"
              right={
                <div className="text-sm font-medium text-white">
                  {Number(currentWeight).toFixed(1)} kg
                </div>
              }
            />
            <Progress value={progressPct} />
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                To target: {Math.max(0, data.profile.targetWeightKg - currentWeight).toFixed(1)} kg
              </Badge>
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                Reg: {data.calories.bulkRegular}
              </Badge>
              <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                Shift: {data.calories.bulkShiftLow}-{data.calories.bulkShiftHigh}
              </Badge>
            </div>
            {recommendedCalories && (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <Flame className="h-4 w-4 text-cyan-200" /> Level 2 recommended targets
                    </div>
                    <div className="text-sm text-slate-200/80 mt-1">
                      Reg {recommendedCalories.bulkRegular} • Shift {recommendedCalories.bulkShiftLow}-{recommendedCalories.bulkShiftHigh} • Protein {recommendedCalories.proteinTargetG}g
                    </div>
                  </div>
                  <Button size="sm" className="rounded-2xl" onClick={applyRecommendedAdvancedCalories}>
                    Apply
                  </Button>
                </div>
              </div>
            )}
            <Small>
              If you don’t gain for <span className="font-medium text-white">2 weeks</span>, add <span className="font-medium text-white">+200 kcal/day</span>.
            </Small>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 rounded-2xl bg-white/5 border border-white/10">
            <TabsTrigger value="dashboard">Home</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="grocery">Grocery</TabsTrigger>
            <TabsTrigger value="track">Track</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="rounded-3xl border-white/10 bg-gradient-to-br from-white/5 to-black/30 backdrop-blur shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                <CardContent className="p-4 space-y-2">
                  <SectionTitle
                    title="System Status"
                    right={
                      <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                        {level === "Advanced" ? "LEVEL 2" : "LEVEL 1"}
                      </Badge>
                    }
                  />
                  <Small>
                    Daily quest: hit your calories + log your workout sets. Each PR is a "Level Up" moment.
                  </Small>
                </CardContent>
              </Card>
            </motion.div>
            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Quick Settings" />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300/70">Program level</div>
                    <PillToggle
                      value={level}
                      options={["Beginner", "Advanced"]}
                      onChange={(v) => updateProfile("level", v)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300/70">Rest timer default</div>
                    <PillToggle
                      value={`${data.settings.restSecondsDefault}s`}
                      options={["60s", "90s", "120s", "180s"]}
                      onChange={(v) =>
                        setData((d) => ({
                          ...d,
                          settings: {
                            ...d.settings,
                            restSecondsDefault: Number(v.replace("s", "")),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300/70">Timer notifications</div>
                    <Button
                      size="sm"
                      variant={data.settings.notificationsEnabled ? "secondary" : "outline"}
                      className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
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
                    <div className="text-xs text-slate-300/70">Regular calories</div>
                    <Input
                      className="rounded-2xl bg-white/5 border-white/10 text-white"
                      inputMode="numeric"
                      value={data.calories.bulkRegular}
                      onChange={(e) => updateCalories("bulkRegular", Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300/70">Shift calories (low)</div>
                    <Input
                      className="rounded-2xl bg-white/5 border-white/10 text-white"
                      inputMode="numeric"
                      value={data.calories.bulkShiftLow}
                      onChange={(e) => updateCalories("bulkShiftLow", Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300/70">Shift calories (high)</div>
                    <Input
                      className="rounded-2xl bg-white/5 border-white/10 text-white"
                      inputMode="numeric"
                      value={data.calories.bulkShiftHigh}
                      onChange={(e) => updateCalories("bulkShiftHigh", Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300/70">Protein target (g)</div>
                    <Input
                      className="rounded-2xl bg-white/5 border-white/10 text-white"
                      inputMode="numeric"
                      value={data.calories.proteinTargetG}
                      onChange={(e) => updateCalories("proteinTargetG", Number(e.target.value || 0))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="12-Week Roadmap" />
                <div className="space-y-3">
                  {data.roadmap.weeks.map((w, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="font-semibold text-white">{w.title}</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {w.bullets.map((b, j) => (
                          <li key={j} className="text-sm text-slate-300/80">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {level === "Advanced" && (
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <Flame className="h-4 w-4 text-violet-200" /> Level 2 rules
                    </div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li className="text-sm text-slate-200/80">Main lifts: +1 set and heavier rep targets.</li>
                      <li className="text-sm text-slate-200/80">Rest: 180s on main lifts, 120s on accessories (minimum).</li>
                      <li className="text-sm text-slate-200/80">Finisher: last set AMRAP (0–1 reps in reserve) on main lifts.</li>
                      <li className="text-sm text-slate-200/80">Progression: add weight when you hit top reps on ≥2 sets.</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="mt-4 space-y-4">
            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle
                  title="Workout"
                  right={
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-white/10 text-white border border-white/10">Session</Badge>
                      <Input
                        type="date"
                        className="rounded-2xl bg-white/5 border-white/10 text-white"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                      />
                    </div>
                  }
                />

                <div className="flex flex-wrap items-center gap-2">
                  <PillToggle
                    value={dayTab}
                    options={["push", "pull", "legs"]}
                    onChange={(v) => {
                      setDayTab(v);
                      setShowSummary(false);
                    }}
                  />
                  <Button
                    size="sm"
                    className="rounded-2xl"
                    variant={showSummary ? "secondary" : "outline"}
                    onClick={() => setShowSummary((s) => !s)}
                  >
                    Finish Session
                  </Button>
                </div>

                <Separator />

                {showSummary && (
                  <Card className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10">
                    <CardContent className="p-4 space-y-3">
                      <SectionTitle
                        title={`Session Summary (${dayTab.toUpperCase()} • ${sessionDate})`}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                          Completion: {sessionSummary.completionPct}% ({sessionSummary.completedSets}/{sessionSummary.plannedSets} sets)
                        </Badge>
                        <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                          Total reps: {sessionSummary.totalReps}
                        </Badge>
                        <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                          Volume: {Math.round(sessionSummary.totalVolume)}
                        </Badge>
                      </div>

                      {sessionSummary.perExercise.length > 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="text-sm font-semibold text-white">Breakdown</div>
                          <div className="mt-2 space-y-2">
                            {sessionSummary.perExercise.map((x, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <div className="font-medium text-white">{x.name}</div>
                                <div className="text-slate-300/80">
                                  {x.sets} sets • {x.reps} reps • {Math.round(x.volume)} vol
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Small>No logged sets yet for this session date.</Small>
                      )}

                      {sessionSummary.prsHit.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="text-sm font-semibold text-white">PRs hit today</div>
                          <div className="mt-2 space-y-2">
                            {sessionSummary.prsHit.map((p, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <div className="font-medium text-white">{p.ex}</div>
                                <div className="text-slate-300/80">{p.bestKg} kg × {p.bestReps}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Small>
                        Next time: beat 1 rep or add 2.5kg. Consistency is the skill.
                      </Small>
                    </CardContent>
                  </Card>
                )}

                {prsForDay.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2">
                    <div className="text-sm font-semibold text-white">Your PRs</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prsForDay.map((p) => (
                        <div key={p.id} className="rounded-2xl bg-white/5 border border-white/10 p-3 text-sm">
                          <div className="font-medium text-white">{p.ex}</div>
                          <div className="text-slate-300/80">
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
                      level={level}
                      isActive={idx === activeIndex}
                      onPrev={() =>
                        setActiveIndex((i) => clamp(i - 1, 0, workoutList.length - 1))
                      }
                      onNext={() =>
                        setActiveIndex((i) => clamp(i + 1, 0, workoutList.length - 1))
                      }
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
            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="7-Day Overview" />
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <div className="grid grid-cols-12 bg-white/5 px-3 py-2 text-xs font-medium text-white">
                    <div className="col-span-6">Day</div>
                    <div className="col-span-3 text-center">Calories</div>
                    <div className="col-span-3 text-center">Protein</div>
                  </div>
                  {data.mealPlan.overview.map((r, i) => (
                    <div key={i} className="grid grid-cols-12 px-3 py-2 text-sm border-t border-white/10 text-slate-200">
                      <div className="col-span-6">{r.day}</div>
                      <div className="col-span-3 text-center">{r.calories}</div>
                      <div className="col-span-3 text-center">{r.protein}g</div>
                    </div>
                  ))}
                </div>
                <Small>{data.mealPlan.shiftDayAddOn}</Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Daily Template" />
                <ul className="list-disc pl-5 space-y-1">
                  {data.mealPlan.dailyTemplate.map((x, i) => (
                    <li key={i} className="text-sm text-slate-300/80">{x}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="No-Yogurt Substitutes" />
                <ul className="list-disc pl-5 space-y-1">
                  {data.mealPlan.noYogurtSubs.map((x, i) => (
                    <li key={i} className="text-sm text-slate-300/80">{x}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="mt-4 space-y-4">
            {data.recipes.map((r, i) => (
              <Card key={i} className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="p-4 space-y-3">
                  <SectionTitle
                    title={r.name}
                    right={
                      <Badge className="rounded-full bg-white/10 text-white border border-white/10">
                        {r.macros}
                      </Badge>
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="text-sm font-semibold text-white">Ingredients</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {r.ingredients.map((x, j) => (
                          <li key={j} className="text-sm text-slate-300/80">{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="text-sm font-semibold text-white">Steps</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {r.steps.map((x, j) => (
                          <li key={j} className="text-sm text-slate-300/80">{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="grocery" className="mt-4 space-y-4">
            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Weekly Grocery List" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ["Protein", data.grocery.protein],
                    ["Carbs", data.grocery.carbs],
                    ["Fats & boosters", data.grocery.fats],
                    ["Veg & extras", data.grocery.vegExtras],
                  ].map(([label, items]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <div className="text-sm font-semibold text-white">{label}</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {items.map((x, i) => (
                          <li key={i} className="text-sm text-slate-300/80">{x}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="mt-4 space-y-4">
            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Add Weigh-In" />
                <WeighInForm onAdd={addWeighIn} />
                <Small>
                  Weigh 3×/week (morning). If no gain for 2 weeks, add 200 kcal/day.
                </Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle title="Trend" />
                <div className="h-56 w-full">
                  {chartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
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
                    <div className="h-full flex items-center justify-center text-sm text-slate-300/80">
                      Add a weigh-in to see your chart.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
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
                      <div className="text-xs text-slate-300/70">{label}</div>
                      <Input
                        className="rounded-2xl bg-white/5 border-white/10 text-white"
                        inputMode="decimal"
                        value={data.tracker.measurements?.[k] ?? ""}
                        onChange={(e) => setMeasurement(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <Small>Update these every 2–4 weeks.</Small>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4 space-y-3">
                <SectionTitle
                  title="Weigh-In Entries"
                  right={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
                      onClick={() => {
                        if (!weighIns.length) return;
                        if (confirm("Clear all weigh-ins?"))
                          setData((d) => ({
                            ...d,
                            tracker: { ...d.tracker, weighIns: [] },
                          }));
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Clear
                    </Button>
                  }
                />
                <div className="space-y-2">
                  {weighIns.length ? (
                    [...weighIns]
                      .slice()
                      .reverse()
                      .map((w) => (
                        <div
                          key={w.date}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {w.date}
                            </div>
                            <div className="text-sm text-slate-300/80">
                              {Number(w.kg).toFixed(1)} kg
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-2xl text-white"
                            onClick={() => deleteWeighIn(w.date)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-slate-300/80">No weigh-ins yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="pb-8">
          <Small>
            Tip: Open your deployed link → Add to Home Screen for the full app feel.
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
      <Input
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-2xl bg-white/5 border-white/10 text-white"
        type="date"
      />
      <Input
        value={kg}
        onChange={(e) => setKg(e.target.value)}
        className="rounded-2xl bg-white/5 border-white/10 text-white"
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

