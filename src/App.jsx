import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG — REPLACE WITH YOUR GOOGLE CLIENT ID ──────────────────────────
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.body.read",
].join(" ");

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const T = {
  bg:        "#080808",
  surface:   "#0f0f0f",
  card:      "#141414",
  cardHover: "#1a1a1a",
  border:    "#1e1e1e",
  borderHi:  "#2a2a2a",
  dim:       "#181818",
  gold:      "#c8973a",
  goldLight: "#e0b55a",
  goldDim:   "#c8973a18",
  green:     "#4caf7d",
  greenDim:  "#4caf7d18",
  red:       "#e05555",
  redDim:    "#e0555518",
  blue:      "#5b8fbf",
  blueDim:   "#5b8fbf18",
  purple:    "#9b7fd4",
  purpleDim: "#9b7fd418",
  orange:    "#e07a3a",
  text:      "#ede8dc",
  textDim:   "#c0b8a8",
  muted:     "#484848",
  sub:       "#707070",
  grad1:     "linear-gradient(135deg, #c8973a, #e0b55a)",
  grad2:     "linear-gradient(135deg, #4caf7d, #6dd49a)",
};

const SS_COLORS = { A:"#c8973a", B:"#5b8fbf", C:"#9b7fd4", D:"#4caf7d", E:"#e07a3a" };

// ─── WORKOUT DATA ─────────────────────────────────────────────────────────
const WEEKLY_TEMPLATE = [
  {
    dayOfWeek:1, label:"Monday", type:"gym", focus:"Chest, Triceps & Shoulders", color:T.gold,
    exercises:[
      { id:"e1",  name:"Chest Press Machine",         sets:4, repsRange:"10–12", startWeight:"45 lbs",      muscles:"Chest, Anterior Delt, Triceps",   machine:true,  superset:"A1", rest:0,  instructions:"Sit upright, back flat. Press forward to near-full extension — squeeze chest hard at the top for 1 sec. Control the return for 3 counts. Don't let shoulders roll forward.\n\n🔄 ALTERNATIVE: Dumbbell Chest Press — lie on bench or floor, dumbbells at chest height, press up and slightly inward. Floor press protects shoulders if no bench available." },
      { id:"e2",  name:"Pec Deck / Chest Fly",        sets:4, repsRange:"12–15", startWeight:"35 lbs",      muscles:"Inner Chest, Anterior Delt",      machine:true,  superset:"A2", rest:75, instructions:"Arms on pads, elbows slightly bent. Bring pads together, squeeze inner chest for 1 sec at full contraction. Open slowly — feel the deep chest stretch at end range.\n\n🔄 ALTERNATIVE: Dumbbell Chest Fly — lie on bench or floor, dumbbells above chest, wide arc downward until you feel a deep stretch, squeeze back up." },
      { id:"e3",  name:"Incline Chest Press Machine", sets:3, repsRange:"12",    startWeight:"35 lbs",      muscles:"Upper Chest, Front Delt",         machine:true,  superset:"B1", rest:0,  instructions:"Press upward at angle, targeting the upper chest shelf. Keep shoulder blades pinched back into the pad throughout. Don't let elbows flare wider than 75°.\n\n🔄 ALTERNATIVE: Incline Dumbbell Press — set bench to 30–45°. No bench? Do push-ups with feet elevated on a couch — same upper chest angle." },
      { id:"e4",  name:"Cable Lateral Raise",         sets:3, repsRange:"15",    startWeight:"10 lbs each", muscles:"Lateral Deltoid",                 machine:true,  superset:"B2", rest:0,  instructions:"Cable at lowest point, stand sideways. Raise arm to shoulder height — no higher. 2 counts up, 3 counts down. Don't shrug. Do both sides. Go straight to Face Pulls.\n\n🔄 ALTERNATIVE: Dumbbell Lateral Raise — stand tall, slight elbow bend, raise both arms to shoulder height. Lean slightly forward for better lateral delt isolation." },
      { id:"e4b", name:"Face Pull (Cable Rope)",      sets:3, repsRange:"15",    startWeight:"20 lbs",      muscles:"Rear Delts, Rotator Cuff, Traps", machine:true,  superset:"B3", rest:75, instructions:"Cable at face height, rope attachment. Pull rope to cheeks — elbows HIGH above shoulder level. Externally rotate at top — thumbs pointing backward. Essential for rotator cuff health and posture.\n\n🔄 ALTERNATIVE: Band Pull-Apart — hold resistance band at shoulder height, pull apart squeezing shoulder blades." },
      { id:"e5",  name:"Tricep Pushdown (Rope)",      sets:4, repsRange:"12–15", startWeight:"30 lbs",      muscles:"Triceps",                         machine:true,  superset:"C1", rest:0,  instructions:"Elbows pinned to sides — they don't move. Push down and spread rope ends apart at the bottom for full contraction. Slow return.\n\n🔄 ALTERNATIVE: Dumbbell Tricep Kickback — hinge forward 45°, upper arm parallel to floor, extend forearm back until arm is straight." },
      { id:"e6",  name:"Overhead Tricep Extension",   sets:3, repsRange:"12",    startWeight:"22 lbs",      muscles:"Triceps Long Head",               machine:true,  superset:"C2", rest:60, instructions:"Rope or single cable overhead. Elbows point up, stay close to head. Extend until arms are straight. Lower slowly behind head.\n\n🔄 ALTERNATIVE: Dumbbell Overhead Tricep Extension — hold one dumbbell with both hands overhead, lower behind head by bending elbows, press back up." },
      { id:"e7",  name:"Ab Crunch Machine",           sets:3, repsRange:"15",    startWeight:"40 lbs",      muscles:"Rectus Abdominis",                machine:true,  superset:null, rest:60, instructions:"Initiate from abs not hip flexors. Round the spine forward. Hold at full contraction for 1 sec. Slow return.\n\n🔄 ALTERNATIVE: Weighted Crunch on Floor — hold a weight plate on chest, crunch shoulders off floor rounding spine." },
    ]
  },
  {
    dayOfWeek:2, label:"Tuesday", type:"home", focus:"Lower Body & Glutes", color:T.green,
    exercises:[
      { id:"e8",  name:"Romanian Deadlift (DBs)",   sets:4, repsRange:"10–12",   startWeight:"25 lbs each", muscles:"Hamstrings, Glutes, Lower Back", machine:false, superset:"A1", rest:0,  instructions:"Micro-bend knees — they stay fixed. Hinge at hips, push them back. Lower weights to mid-shin. Drive hips forward to stand. Keep back flat throughout.\n\n🔄 ALTERNATIVE: Single-Leg RDL — same hinge pattern but one leg at a time, other leg behind for balance. Harder but great for hamstring isolation." },
      { id:"e9",  name:"Goblet Squat",              sets:4, repsRange:"12–15",   startWeight:"25 lbs",      muscles:"Quads, Glutes, Core",            machine:false, superset:"A2", rest:75, instructions:"Hold dumbbell at chest. Feet shoulder-width, toes out 30°. Squat deep — chest tall, knees tracking over toes. Drive through heels. Squeeze glutes at top.\n\n🔄 ALTERNATIVE: Bodyweight Squat with Pause — squat deep, pause 2 seconds at bottom, drive up explosively. Add resistance band above knees." },
      { id:"e10", name:"Hip Thrust (Floor)",        sets:4, repsRange:"15",      startWeight:"30 lbs",      muscles:"Glutes, Hamstrings",             machine:false, superset:"B1", rest:0,  instructions:"Upper back on couch/surface, dumbbell on hip crease. Drive hips explosively upward — squeeze HARD at top, hold 1 sec. Lower slowly. Never let hips touch floor between reps.\n\n🔄 ALTERNATIVE: Glute Bridge — same movement but shoulders on floor, less range of motion. Add dumbbell on hips for resistance." },
      { id:"e11", name:"Reverse Lunge",             sets:3, repsRange:"10 each", startWeight:"12 lbs each", muscles:"Quads, Glutes, Balance",         machine:false, superset:"B2", rest:75, instructions:"Step back, lower knee to 1 inch off floor. Front knee stays stacked over ankle. Drive through front heel to return. Alternate legs.\n\n🔄 ALTERNATIVE: Walking Lunge — step forward alternating legs. Or: Step-Up — use stairs or sturdy box, step up driving through heel." },
      { id:"e12", name:"Sumo Squat Pulse",          sets:3, repsRange:"20",      startWeight:"20 lbs",      muscles:"Inner Thighs, Glutes",           machine:false, superset:"C1", rest:0,  instructions:"Wide stance, toes out 45°. Lower into sumo squat then pulse 2 inches up and down 20 times before standing. Feel the burn in inner thighs and glutes.\n\n🔄 ALTERNATIVE: Resistance Band Sumo Squat — place band above knees for added glute activation. Or: Lateral Band Walk." },
      { id:"e13", name:"Single-Leg Hip Thrust",     sets:3, repsRange:"12 each", startWeight:"Bodyweight",  muscles:"Glutes, Hamstrings",             machine:false, superset:"C2", rest:60, instructions:"One leg extended, drive through planted foot. Full hip extension at top — squeeze glute hard. Lower controlled. All reps one side then switch.\n\n🔄 ALTERNATIVE: Donkey Kick — on all fours, kick one leg back and up squeezing glute at top. Or: Cable Kickback at gym." },
      { id:"e14", name:"Dead Bug",                  sets:3, repsRange:"10 each", startWeight:"Bodyweight",  muscles:"Deep Core, Stability",           machine:false, superset:null, rest:45, instructions:"Arms to ceiling, knees at 90°. Slowly lower opposite arm and leg — back stays flat on floor. Return and switch. Never let the lower back arch.\n\n🔄 ALTERNATIVE: Bird Dog — on all fours, extend opposite arm and leg simultaneously, hold 2 sec." },
    ]
  },
  {
    dayOfWeek:3, label:"Wednesday", type:"gym", focus:"Back & Biceps", color:T.gold,
    exercises:[
      { id:"e15", name:"Lat Pulldown Machine",     sets:4, repsRange:"10–12",   startWeight:"55 lbs",       muscles:"Lats, Biceps, Upper Back",      machine:true,  superset:"A1", rest:0,  instructions:"Grip just wider than shoulders. Slight backward lean. Drive elbows DOWN and back. Squeeze lats at bottom. Full stretch at top.\n\n🔄 ALTERNATIVE: Resistance Band Pulldown — anchor band overhead, pull down driving elbows to hips. Or: Assisted Pull-Up Machine." },
      { id:"e16", name:"Seated Cable Row",         sets:4, repsRange:"12",      startWeight:"45 lbs",       muscles:"Mid Back, Rhomboids, Biceps",   machine:true,  superset:"A2", rest:75, instructions:"Sit upright — no leaning back. Pull to lower chest. Hold 1 sec squeezing shoulder blades together. Let back stretch forward on return.\n\n🔄 ALTERNATIVE: Dumbbell Bent-Over Row — hinge 45°, pull dumbbell to hip keeping elbow close." },
      { id:"e17", name:"Assisted Pull-Up Machine", sets:3, repsRange:"10",      startWeight:"50 lbs assist",muscles:"Lats, Biceps",                  machine:true,  superset:"B1", rest:0,  instructions:"Wide overhand grip. Pull until chin clears bar. Lower for 3 full counts. Reduce assist by 5 lbs each week.\n\n🔄 ALTERNATIVE: Negative Pull-Ups — jump to top position, lower as slowly as possible (5–10 counts). Or: Inverted Row using Smith Machine bar." },
      { id:"e18", name:"Face Pull (Cable Rope)",   sets:3, repsRange:"15",      startWeight:"25 lbs",       muscles:"Rear Delts, Rotator Cuff",      machine:true,  superset:"B2", rest:60, instructions:"Cable at face height. Pull rope to cheeks, elbows HIGH above shoulders. Externally rotate at top — thumbs back. Essential for shoulder health.\n\n🔄 ALTERNATIVE: Band Pull-Apart — hold resistance band at face height with arms extended, pull apart keeping arms straight." },
      { id:"e19", name:"Rear Delt Fly Machine",    sets:3, repsRange:"15",      startWeight:"30 lbs",       muscles:"Rear Deltoids, Rhomboids",      machine:true,  superset:"C1", rest:0,  instructions:"Chest on pad. Open arms wide squeezing shoulder blades together. Lower slowly — 3 counts. Key for posture.\n\n🔄 ALTERNATIVE: Bent-Over Dumbbell Rear Delt Fly — hinge 45° forward, raise both arms out to sides squeezing shoulder blades." },
      { id:"e20", name:"Preacher Curl Machine",    sets:3, repsRange:"12",      startWeight:"25 lbs",       muscles:"Biceps Peak",                   machine:true,  superset:"C2", rest:60, instructions:"Arms on angled pad. Full curl to contraction. Lower FULLY — complete extension is what builds the bicep. Don't use shoulders to cheat.\n\n🔄 ALTERNATIVE: Concentration Curl — sit on bench, elbow braced against inner thigh, curl dumbbell." },
      { id:"e21", name:"Hammer Curl (DBs)",        sets:3, repsRange:"12 each", startWeight:"15 lbs each",  muscles:"Biceps, Brachialis, Forearms",  machine:false, superset:null, rest:60, instructions:"Palms facing each other throughout. Full range — lower completely. Builds bicep thickness and forearm strength.\n\n🔄 ALTERNATIVE: Rope Hammer Curl on Cable — use rope attachment at lowest setting, curl with neutral grip for constant tension." },
    ]
  },
  {
    dayOfWeek:4, label:"Thursday", type:"home", focus:"Shoulders (Press + Variety) & Core", color:T.green,
    exercises:[
      { id:"e22",  name:"Dumbbell Shoulder Press", sets:4, repsRange:"10–12",   startWeight:"15 lbs each", muscles:"Deltoids, Triceps",              machine:false, superset:"A1", rest:0,  instructions:"Seated or standing. Dumbbells at shoulder height, palms forward. Press overhead — stop just before locking elbows. Lower controlled. Go straight to Arnold Press.\n\n🔄 ALTERNATIVE: Pike Push-Up — downward dog position, lower head toward floor and press back up." },
      { id:"e22b", name:"Arnold Press",            sets:4, repsRange:"10–12",   startWeight:"12 lbs each", muscles:"All 3 Delt Heads, Triceps",      machine:false, superset:"A2", rest:75, instructions:"Start with palms facing you at shoulder height. As you press overhead, rotate palms forward so they face away at top. Lower and rotate back. Hits all three delt heads.\n\n🔄 ALTERNATIVE: Seated DB Shoulder Press with slow rotation — same movement broken into deliberate steps." },
      { id:"e23",  name:"Upright Row (DBs)",       sets:3, repsRange:"12–15",   startWeight:"15 lbs each", muscles:"Lateral Delts, Traps, Biceps",   machine:false, superset:"B1", rest:0,  instructions:"Hold dumbbells in front of thighs, palms facing you. Pull straight up leading with elbows — elbows stay higher than wrists. Raise to chin height. Keep elbows at 45° to protect shoulders.\n\n🔄 ALTERNATIVE: Cable Upright Row at gym. Or: Face Pulls if upright row causes shoulder discomfort." },
      { id:"e24",  name:"Bent-Over Reverse Fly",  sets:3, repsRange:"15",       startWeight:"10 lbs each", muscles:"Rear Deltoids, Upper Back",      machine:false, superset:"B2", rest:60, instructions:"Hinge 45°, soft knees. Raise arms out to sides squeezing shoulder blades at top. Lower slowly — 3 counts. Secondary focus — rear delts already worked Monday.\n\n🔄 ALTERNATIVE: Prone Rear Delt Raise — lie face down on flat bench or floor, raise arms out to sides." },
      { id:"e25",  name:"Zottman Curl",            sets:3, repsRange:"12",       startWeight:"12 lbs each", muscles:"Biceps + Forearms",              machine:false, superset:"C1", rest:0,  instructions:"Curl up with palms up. At top ROTATE palms down. Lower slowly in pronated position — works forearms hard. Rotate back to palms-up at bottom.\n\n🔄 ALTERNATIVE: Standard curl up, then rotate and lower — same movement in deliberate two-step form." },
      { id:"e26",  name:"Push-Up (Full/Modified)", sets:3, repsRange:"12–15",    startWeight:"Bodyweight",  muscles:"Chest, Triceps, Core",           machine:false, superset:"C2", rest:45, instructions:"Hands slightly wider than shoulders. Straight line head to heel. Lower chest to floor. Press up. Squeeze core and glutes throughout.\n\n🔄 ALTERNATIVE: Modified on knees. Or: Incline Push-Up — hands on couch to reduce difficulty." },
      { id:"e27",  name:"Plank Hold",              sets:3, repsRange:"45 sec",   startWeight:"Bodyweight",  muscles:"Core, Shoulders, Glutes",        machine:false, superset:"D1", rest:0,  instructions:"Forearms on floor, elbows under shoulders. Straight line head to heel — hips level. Squeeze glutes and abs. Breathe steadily. Progress to 60 sec.\n\n🔄 ALTERNATIVE: High Plank on hands — slightly less core intensive. Or: Side Plank for obliques." },
      { id:"e28",  name:"Mountain Climbers",       sets:3, repsRange:"30 sec",   startWeight:"Bodyweight",  muscles:"Core, Hip Flexors, Cardio",      machine:false, superset:"D2", rest:45, instructions:"Push-up plank position. Drive knees alternately to chest. Hips level — don't pike up. All-out effort for 30 sec. Immediately follows plank.\n\n🔄 ALTERNATIVE: Slow Mountain Climbers — bring knee all the way to elbow, hold 1 sec. Or: Bicycle Crunch." },
    ]
  },
  {
    dayOfWeek:5, label:"Friday", type:"gym", focus:"Legs & Glutes", color:T.gold,
    exercises:[
      { id:"e29", name:"Leg Press Machine",        sets:4, repsRange:"10–12",   startWeight:"90 lbs",  muscles:"Quads, Glutes, Hamstrings",    machine:true,  superset:"A1", rest:0,  instructions:"Feet shoulder-width, toes slightly out. Lower until knees reach 90°. Press through whole foot. Higher foot placement = more glute.\n\n🔄 ALTERNATIVE: Dumbbell Squat or Bulgarian Split Squat — rear foot elevated, front foot forward, lower rear knee to floor." },
      { id:"e30", name:"Leg Curl Machine (Lying)", sets:4, repsRange:"12",      startWeight:"35 lbs",  muscles:"Hamstrings",                   machine:true,  superset:"A2", rest:75, instructions:"Ankle pad above heels. Curl to full contraction — squeeze hard at top. Lower for 3 full counts. Don't let hips lift off the pad.\n\n🔄 ALTERNATIVE: Nordic Hamstring Curl — kneel with feet anchored, lower torso controlling with hamstrings. Or: Swiss Ball Hamstring Curl." },
      { id:"e31", name:"Glute Kickback Machine",   sets:3, repsRange:"15 each", startWeight:"25 lbs",  muscles:"Glutes, Hamstrings",           machine:true,  superset:"B1", rest:0,  instructions:"Pad behind knee. Kick back and up — squeeze glute HARD at full extension. Hold 1 sec. Lower controlled. All reps one side then switch.\n\n🔄 ALTERNATIVE: Cable Kickback — ankle attachment at lowest cable. Or: Donkey Kick on floor." },
      { id:"e32", name:"Hip Abductor Machine",     sets:3, repsRange:"15",      startWeight:"45 lbs",  muscles:"Glute Medius, Hip Abductors",  machine:true,  superset:"B2", rest:60, instructions:"Sit upright, pads on outer thighs. Press out — squeeze at widest point 1 sec. Return slowly. Targets side glutes that shape the hip.\n\n🔄 ALTERNATIVE: Resistance Band Lateral Walk — band above knees, slight squat, step side to side." },
      { id:"e33", name:"Leg Extension Machine",    sets:3, repsRange:"15",      startWeight:"35 lbs",  muscles:"Quadriceps",                   machine:true,  superset:"C1", rest:0,  instructions:"Ankle pad over shins. Extend fully — squeeze quads hard for 1 sec at top. Lower slowly. Don't let weight drop.\n\n🔄 ALTERNATIVE: Wall Sit — back flat against wall, thighs parallel to floor, hold 45–60 sec." },
      { id:"e34", name:"Hip Adductor Machine",     sets:3, repsRange:"15",      startWeight:"40 lbs",  muscles:"Inner Thighs",                 machine:true,  superset:"C2", rest:60, instructions:"Pads on inner thighs. Squeeze legs together. Hold briefly at center. Return slowly — feel inner thigh stretch. Don't bounce.\n\n🔄 ALTERNATIVE: Sumo Squat with Pause — wide stance, squat deep, pause at bottom feeling inner thigh stretch." },
      { id:"e35", name:"Calf Raise Machine",       sets:4, repsRange:"20",      startWeight:"55 lbs",  muscles:"Gastrocnemius, Soleus",        machine:true,  superset:null, rest:45, instructions:"Rise up on toes fully — hold 1 sec. Lower heel BELOW platform for deep stretch. Full range every rep.\n\n🔄 ALTERNATIVE: Standing Calf Raise on Step — hold dumbbells, stand on edge of stair step. Or: Single-Leg Calf Raise." },
      { id:"e36", name:"Cable Crunch (Kneeling)",  sets:3, repsRange:"15",      startWeight:"35 lbs",  muscles:"Upper Abs, Core",              machine:true,  superset:null, rest:60, instructions:"Rope behind head. Crunch elbows toward knees — round the spine. Resist cable on slow return. Movement from abs, not hip flexors.\n\n🔄 ALTERNATIVE: Weighted Crunch on Floor — hold plate on chest, crunch shoulders off floor." },
    ]
  },
];

function generateWeeks() {
  const weeks = [];
  for (let w = 1; w <= 8; w++) {
    const isIntensity = w >= 5;
    const days = WEEKLY_TEMPLATE.map(day => ({
      ...day,
      weekNum: w,
      phase: isIntensity ? "Intensity" : "Foundation",
      exercises: day.exercises.map(ex => ({
        ...ex,
        id: `w${w}_${ex.id}`,
        sets: isIntensity ? Math.min(ex.sets + 1, 5) : ex.sets,
        repsRange: isIntensity
          ? ex.repsRange.replace("12–15","8–10").replace("10–12","8–10").replace("15","12")
          : ex.repsRange,
      }))
    }));
    weeks.push({ weekNum: w, phase: isIntensity ? "Intensity" : "Foundation", days });
  }
  return weeks;
}

const ALL_WEEKS = generateWeeks();

// ─── STORAGE ──────────────────────────────────────────────────────────────
const LS_KEY = "chrisTracker_v1";
const EMPTY_DATA = { logs:{}, bodyWeight:[], prs:{}, settings:{ weekNum:1, goalWeight:"", dailyProtein:180 }, googleToken:null };

function loadData() {
  try { const r = localStorage.getItem(LS_KEY); return r ? {...EMPTY_DATA, ...JSON.parse(r)} : EMPTY_DATA; }
  catch { return EMPTY_DATA; }
}
function saveData(d) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch(e) { console.error(e); }
}

// ─── GOOGLE FIT API ───────────────────────────────────────────────────────
const FIT_BASE = "https://www.googleapis.com/fitness/v1/users/me";

async function fitRequest(endpoint, token, options = {}) {
  const r = await fetch(`${FIT_BASE}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers||{}) }
  });
  if (!r.ok) throw new Error(`Fit API error: ${r.status}`);
  return r.json();
}

function dayRange(daysAgo = 0) {
  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - daysAgo); start.setHours(0,0,0,0);
  const end = new Date(start); end.setHours(23,59,59,999);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

async function fetchFitData(token, daysBack = 7) {
  const { startMs, endMs } = dayRange(daysBack - 1);
  const body = {
    aggregateBy: [
      { dataTypeName:"com.google.sleep.segment" },
      { dataTypeName:"com.google.heart_rate.bpm" },
      { dataTypeName:"com.google.step_count.delta" },
      { dataTypeName:"com.google.active_minutes" },
      { dataTypeName:"com.google.calories.expended" },
      { dataTypeName:"com.google.heart_minutes" },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startMs,
    endTimeMillis: endMs,
  };
  try {
    const data = await fitRequest("/dataset:aggregate", token, { method:"POST", body: JSON.stringify(body) });
    return parseFitBuckets(data.bucket || []);
  } catch(e) { console.error("Fit fetch error:", e); return []; }
}

function parseFitBuckets(buckets) {
  return buckets.map(bucket => {
    const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().slice(0,10);
    let sleep = 0, avgHR = 0, hrCount = 0, steps = 0, activeMin = 0, calories = 0;
    let deepSleep = 0, remSleep = 0, lightSleep = 0, hrSamples = [];

    (bucket.dataset || []).forEach(ds => {
      (ds.point || []).forEach(pt => {
        const type = ds.dataSourceId || "";
        if (type.includes("sleep")) {
          const val = pt.value?.[0]?.intVal;
          const dur = (parseInt(pt.endTimeNanos) - parseInt(pt.startTimeNanos)) / 1e6 / 60;
          if (val === 1 || val === 4 || val === 5 || val === 6) { // awake, light, deep, rem
            if (val === 5) deepSleep += dur;
            else if (val === 6) remSleep += dur;
            else if (val === 4) lightSleep += dur;
            if (val !== 1) sleep += dur;
          }
        }
        if (type.includes("heart_rate")) { const v = pt.value?.[0]?.fpVal; if (v) { hrSamples.push(v); hrCount++; avgHR += v; } }
        if (type.includes("step_count")) steps += pt.value?.[0]?.intVal || 0;
        if (type.includes("active_minutes")) activeMin += pt.value?.[0]?.intVal || 0;
        if (type.includes("calories")) calories += pt.value?.[0]?.fpVal || 0;
      });
    });

    const restingHR = hrSamples.length ? Math.min(...hrSamples.filter(v => v > 30)) : 0;
    return {
      date,
      sleepHours: +(sleep / 60).toFixed(1),
      deepSleepMin: Math.round(deepSleep),
      remSleepMin: Math.round(remSleep),
      lightSleepMin: Math.round(lightSleep),
      avgHR: hrCount ? Math.round(avgHR / hrCount) : 0,
      restingHR: Math.round(restingHR),
      steps,
      activeMin,
      calories: Math.round(calories),
    };
  });
}

function calcReadiness(today, history) {
  if (!today) return null;
  const scores = [];
  const avg = (arr, key) => arr.length ? arr.reduce((s,x) => s + (x[key]||0), 0) / arr.length : 0;

  // Sleep score (0–30 pts)
  const sleepTarget = 7.5;
  const sleepScore = Math.min(30, Math.round((today.sleepHours / sleepTarget) * 30));
  scores.push(sleepScore);

  // Sleep quality score (0–20 pts) — deep + REM should be ~40–50% of total
  const totalSleep = today.sleepHours * 60;
  const qualitySleep = today.deepSleepMin + today.remSleepMin;
  const qualityRatio = totalSleep > 0 ? qualitySleep / totalSleep : 0;
  const qualityScore = Math.min(20, Math.round(qualityRatio * 40));
  scores.push(qualityScore);

  // Resting HR score (0–25 pts) — lower is better vs baseline
  if (today.restingHR && history.length > 3) {
    const baselineHR = avg(history, "restingHR");
    const hrDiff = today.restingHR - baselineHR;
    const hrScore = Math.min(25, Math.max(0, 25 - (hrDiff * 5)));
    scores.push(Math.round(hrScore));
  } else { scores.push(15); }

  // Activity yesterday score (0–15 pts) — steps
  const stepTarget = 8000;
  const stepScore = Math.min(15, Math.round((today.steps / stepTarget) * 15));
  scores.push(stepScore);

  // Active minutes score (0–10 pts)
  const activeTarget = 30;
  const activeScore = Math.min(10, Math.round((today.activeMin / activeTarget) * 10));
  scores.push(activeScore);

  const total = scores.reduce((a,b) => a+b, 0);
  return { total, sleepScore, qualityScore, stepScore, activeScore, breakdown: scores };
}

function readinessLabel(score) {
  if (!score) return { label:"No Data", color:T.muted, emoji:"—", advice:"Connect Google Fit to see your readiness score." };
  if (score.total >= 80) return { label:"Train Hard", color:T.green, emoji:"🟢", advice:"You're well recovered. Push intensity today — go for PRs." };
  if (score.total >= 60) return { label:"Train Normal", color:T.gold, emoji:"🟡", advice:"Good to go. Stick to the program weights and focus on form." };
  if (score.total >= 40) return { label:"Go Lighter", color:T.orange, emoji:"🟠", advice:"Moderate recovery. Drop weights 10–15%, focus on quality reps." };
  return { label:"Consider Rest", color:T.red, emoji:"🔴", advice:"Poor recovery today. Consider active recovery or a rest day." };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────
function Badge({ text, color, small }) {
  return <span style={{ display:"inline-block", fontSize:small?8:9, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color, background:color+"22", padding:small?"1px 5px":"2px 7px", borderRadius:2 }}>{text}</span>;
}

function StatCard({ label, value, sub, color = T.gold, wide = false }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"13px 14px", gridColumn: wide ? "1/-1" : undefined }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:9, color:T.muted, letterSpacing:2, marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:T.sub, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function RestTimer({ seconds, onDone }) {
  const [rem, setRem] = useState(seconds);
  const ref = useRef();
  useEffect(() => {
    ref.current = setInterval(() => setRem(r => { if (r <= 1) { clearInterval(ref.current); onDone(); return 0; } return r - 1; }), 1000);
    return () => clearInterval(ref.current);
  }, []);
  const pct = ((seconds - rem) / seconds) * 100;
  return (
    <div style={{ background:"#0a0a0a", border:`1px solid ${T.gold}44`, borderRadius:8, padding:"12px 14px", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.gold, letterSpacing:2 }}>⏱ REST</span>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:rem<=10?T.red:T.text }}>{rem}s</span>
      </div>
      <div style={{ height:3, background:T.dim, borderRadius:2 }}>
        <div style={{ width:`${pct}%`, height:"100%", background:T.gold, borderRadius:2, transition:"width 1s linear" }}/>
      </div>
      <button onClick={() => { clearInterval(ref.current); onDone(); }} style={{ marginTop:8, width:"100%", background:"transparent", border:`1px solid ${T.border}`, color:T.muted, cursor:"pointer", padding:"5px 0", borderRadius:5, fontFamily:"'Bebas Neue',sans-serif", fontSize:10, letterSpacing:2 }}>SKIP REST</button>
    </div>
  );
}

function ExBlock({ ex, logSets, onChange }) {
  const [showInfo, setShowInfo] = useState(false);
  const [timer, setTimer] = useState(null);
  const ssColor = ex.superset ? SS_COLORS[ex.superset[0]] : null;
  const completed = Array.from({length:ex.sets},(_,i) => logSets[`${ex.id}_${i}`]?.done).filter(Boolean).length;
  const allDone = completed === ex.sets;

  function handleCheck(si, isDone) {
    onChange(ex.id, si, "done", isDone);
    if (isDone && ex.rest > 0) setTimer(ex.rest);
  }

  const [instrMain, instrAlt] = ex.instructions.split("\n\n🔄 ALTERNATIVE:");

  return (
    <div style={{ background:T.card, border:`1px solid ${allDone ? T.green+"55" : ssColor ? ssColor+"22" : T.border}`, borderRadius:10, marginBottom:8, overflow:"hidden", transition:"border-color 0.2s" }}>
      {ex.superset && (
        <div style={{ background:ssColor+"15", borderBottom:`1px solid ${ssColor}22`, padding:"3px 12px", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:9, color:ssColor, letterSpacing:2 }}>SUPERSET {ex.superset}</span>
          {ex.rest === 0 && <span style={{ fontSize:9, color:ssColor+"88" }}>→ GO STRAIGHT TO NEXT EXERCISE</span>}
        </div>
      )}
      <div style={{ padding:"11px 13px", borderBottom:`1px solid ${T.dim}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", marginBottom:3 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:allDone?T.green:T.text, letterSpacing:0.5 }}>{ex.name}</span>
              <Badge text={ex.machine?"MACHINE":"FREE"} color={ex.machine?T.gold:T.green} small />
              {allDone && <Badge text="✓ DONE" color={T.green} small />}
            </div>
            <div style={{ fontSize:10, color:T.muted }}>
              {ex.muscles} · <span style={{ color:T.sub }}>{ex.sets}×{ex.repsRange}</span>
              {ex.rest > 0 && <span style={{ color:T.blue }}> · {ex.rest}s rest</span>}
              {ex.rest === 0 && ex.superset && <span style={{ color:ssColor }}> · No rest</span>}
            </div>
            <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>Start: {ex.startWeight}</div>
          </div>
          <button onClick={() => setShowInfo(v => !v)} style={{ background:"none", border:`1px solid ${T.borderHi}`, color:T.sub, cursor:"pointer", fontSize:9, padding:"3px 8px", borderRadius:4, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, whiteSpace:"nowrap", flexShrink:0 }}>{showInfo?"HIDE":"HOW-TO"}</button>
        </div>
        {showInfo && (
          <div style={{ marginTop:8, borderRadius:8, overflow:"hidden" }}>
            <div style={{ padding:"9px 11px", background:"#0d0d0d", fontSize:11, color:"#888", lineHeight:1.75 }}>{instrMain.trim()}</div>
            {instrAlt && (
              <div style={{ padding:"9px 11px", background:"#0a1208", borderTop:`1px solid ${T.green}22` }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:9, color:T.green, letterSpacing:2, marginBottom:4 }}>🔄 NO MACHINE? ALTERNATIVE</div>
                <div style={{ fontSize:11, color:"#7aaa8a", lineHeight:1.75 }}>{instrAlt.trim()}</div>
              </div>
            )}
          </div>
        )}
      </div>
      {timer !== null && <RestTimer seconds={timer} onDone={() => setTimer(null)} />}
      <div style={{ padding:"9px 13px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"22px 1fr 1fr 30px", gap:4, marginBottom:4 }}>
          {["SET","WEIGHT","REPS","✓"].map((h,i) => <div key={i} style={{ fontSize:8, color:T.muted, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, textAlign:"center" }}>{h}</div>)}
        </div>
        {Array.from({length:ex.sets},(_,si) => {
          const k = `${ex.id}_${si}`, s = logSets[k]||{};
          return (
            <div key={si} style={{ display:"grid", gridTemplateColumns:"22px 1fr 1fr 30px", gap:4, marginBottom:4, alignItems:"center" }}>
              <div style={{ fontSize:10, color:T.muted, textAlign:"center", fontFamily:"'Bebas Neue',sans-serif" }}>{si+1}</div>
              <input type="text" placeholder="lbs" value={s.weight||""} onChange={e => onChange(ex.id,si,"weight",e.target.value)}
                style={{ background:"#0d0d0d", border:`1px solid ${s.done?T.green+"44":T.dim}`, borderRadius:5, color:T.text, padding:"6px 0", fontSize:12, textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box" }}/>
              <input type="text" placeholder={ex.repsRange} value={s.reps||""} onChange={e => onChange(ex.id,si,"reps",e.target.value)}
                style={{ background:"#0d0d0d", border:`1px solid ${s.done?T.green+"44":T.dim}`, borderRadius:5, color:T.text, padding:"6px 0", fontSize:12, textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box" }}/>
              <div style={{ display:"flex", justifyContent:"center" }}>
                <button onClick={() => handleCheck(si, !s.done)} style={{ width:28, height:28, borderRadius:5, border:s.done?"none":`1px solid ${T.borderHi}`, background:s.done?T.green:"#0d0d0d", cursor:"pointer", color:s.done?"#0a0a0a":T.muted, fontSize:12, transition:"all 0.15s" }}>✓</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutModal({ day, data, onClose, onSave }) {
  const [sets, setSets] = useState(() => data.logs[`w${day.weekNum}_d${day.dayOfWeek}`]?.sets || {});
  const [note, setNote] = useState(data.logs[`w${day.weekNum}_d${day.dayOfWeek}`]?.note || "");

  function handleSet(exId, si, field, val) {
    const k = `${exId}_${si}`;
    setSets(p => ({...p, [k]:{...(p[k]||{}), [field]:val}}));
  }

  const totalSets = day.exercises.reduce((a,e) => a+e.sets, 0);
  const doneSets = Object.values(sets).filter(s => s.done).length;
  const pct = totalSets ? Math.round(doneSets/totalSets*100) : 0;

  function handleSave(complete) {
    const logKey = `w${day.weekNum}_d${day.dayOfWeek}`;
    const newLogs = { ...data.logs, [logKey]:{ sets, note, completed: complete || data.logs[logKey]?.completed, date: new Date().toISOString().slice(0,10) }};
    const newPRs = { ...data.prs };
    day.exercises.forEach(ex => {
      const baseId = ex.id.replace(/^w\d+_/, "");
      Object.values(sets).forEach(s => {
        if (s.done && s.weight && s.reps) {
          const w = parseFloat(s.weight);
          if (!isNaN(w) && (!newPRs[baseId] || w > newPRs[baseId].weight))
            newPRs[baseId] = { weight:w, reps:s.reps, date:new Date().toISOString().slice(0,10), name:ex.name };
        }
      });
    });
    onSave({ ...data, logs:newLogs, prs:newPRs });
    onClose();
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.96)", zIndex:300, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
      <div style={{ maxWidth:620, margin:"0 auto", padding:"0 14px 80px" }}>
        <div style={{ position:"sticky", top:0, background:"rgba(8,8,8,0.98)", padding:"14px 0 10px", zIndex:10, borderBottom:`1px solid ${T.border}`, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:3 }}>WEEK {day.weekNum} · {(day.phase||"").toUpperCase()}</span>
                <Badge text={day.type==="gym"?"🏋️ GYM":"🏠 HOME"} color={day.color} />
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:T.text, letterSpacing:1 }}>{day.label} — {day.focus}</div>
              <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{doneSets}/{totalSets} sets · {pct}%</div>
            </div>
            <button onClick={onClose} style={{ background:T.card, border:`1px solid ${T.border}`, color:T.muted, cursor:"pointer", width:34, height:34, borderRadius:8, fontSize:16, flexShrink:0 }}>×</button>
          </div>
          <div style={{ marginTop:8, height:3, background:T.dim, borderRadius:2 }}>
            <div style={{ width:`${pct}%`, height:"100%", background:pct===100?T.green:T.gold, transition:"width 0.3s", borderRadius:2 }}/>
          </div>
        </div>
        <div style={{ background:day.weekNum<=4?T.goldDim:T.greenDim, border:`1px solid ${day.weekNum<=4?T.gold+"33":T.green+"33"}`, borderRadius:8, padding:"9px 13px", marginBottom:12 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:day.weekNum<=4?T.gold:T.green, letterSpacing:2 }}>
            {day.weekNum<=4 ? "📘 FOUNDATION — Focus on form and feel. Build the mind-muscle connection." : "🔥 INTENSITY — Progressive overload. Push to failure on your last set."}
          </div>
        </div>
        {day.exercises.map(ex => <ExBlock key={ex.id} ex={ex} logSets={sets} onChange={handleSet} />)}
        <textarea placeholder="Session notes — energy, PRs, adjustments..." value={note} onChange={e => setNote(e.target.value)}
          style={{ width:"100%", boxSizing:"border-box", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:"#999", padding:13, fontSize:12, minHeight:70, resize:"vertical", outline:"none", marginBottom:12, fontFamily:"inherit" }}/>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => handleSave(false)} style={{ flex:1, padding:13, background:T.card, border:`1px solid ${T.border}`, color:T.muted, cursor:"pointer", borderRadius:10, fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:2 }}>SAVE & EXIT</button>
          <button onClick={() => handleSave(true)} style={{ flex:2, padding:13, background:pct===100?T.green:T.gold, border:"none", color:"#080808", cursor:"pointer", borderRadius:10, fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:2, fontWeight:700 }}>
            {pct===100?"✓ COMPLETE":` SAVE (${pct}%)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: TODAY ───────────────────────────────────────────────────────────
function TodayTab({ data, fitData, onOpenDay, onSaveData }) {
  const dow = new Date().getDay();
  const weekNum = data.settings?.weekNum || 1;
  const week = ALL_WEEKS[weekNum - 1];
  const todayDay = week?.days.find(d => d.dayOfWeek === dow);
  const logKey = todayDay ? `w${weekNum}_d${dow}` : null;
  const log = logKey ? data.logs[logKey] : null;
  const todayFit = fitData?.[0];
  const readiness = calcReadiness(todayFit, fitData?.slice(1) || []);
  const rl = readinessLabel(readiness);
  const isWeekend = dow === 0 || dow === 6;

  return (
    <div>
      {/* Date */}
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, color:T.muted, letterSpacing:3, marginBottom:14 }}>
        {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase()}
      </div>

      {/* Readiness card */}
      <div style={{ background:T.card, border:`1px solid ${readiness ? rl.color+"44" : T.border}`, borderRadius:12, padding:"16px", marginBottom:14, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, right:0, width:120, height:120, borderRadius:"50%", background:readiness ? rl.color+"08" : "transparent", transform:"translate(30px,-30px)" }}/>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:3, marginBottom:8 }}>TODAY'S READINESS</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:10, marginBottom:10 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:readiness?rl.color:T.muted, lineHeight:1 }}>
            {readiness ? readiness.total : "—"}
          </div>
          <div style={{ paddingBottom:6 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:readiness?rl.color:T.muted, letterSpacing:1 }}>{rl.emoji} {rl.label}</div>
            <div style={{ fontSize:10, color:T.sub, marginTop:2 }}>/100 score</div>
          </div>
        </div>
        {readiness && (
          <div style={{ height:4, background:T.dim, borderRadius:2, marginBottom:10 }}>
            <div style={{ width:`${readiness.total}%`, height:"100%", background:rl.color, borderRadius:2, transition:"width 0.8s ease" }}/>
          </div>
        )}
        <div style={{ fontSize:11, color:T.sub, lineHeight:1.6 }}>{rl.advice}</div>

        {/* Readiness breakdown */}
        {todayFit && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:12 }}>
            {[
              { label:"SLEEP", value:`${todayFit.sleepHours}h`, sub:`${todayFit.deepSleepMin}m deep / ${todayFit.remSleepMin}m REM`, color:T.blue },
              { label:"RESTING HR", value:todayFit.restingHR?`${todayFit.restingHR} bpm`:"—", sub:"vs your baseline", color:T.red },
              { label:"STEPS", value:todayFit.steps.toLocaleString(), sub:`${todayFit.activeMin}m active`, color:T.green },
            ].map(m => (
              <div key={m.label} style={{ background:T.dim, borderRadius:8, padding:"8px 10px" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:8, color:T.muted, letterSpacing:2 }}>{m.label}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:m.color, marginTop:2 }}>{m.value}</div>
                <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's workout */}
      {isWeekend ? (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"20px", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>😴</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.text, letterSpacing:2 }}>REST DAY</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{dow===0?"Sunday":"Saturday"} — Rest, stretch, recover. Your muscles grow on rest days.</div>
        </div>
      ) : todayDay ? (
        <div style={{ background:T.card, border:`1px solid ${todayDay.color+"44"}`, borderLeft:`4px solid ${todayDay.color}`, borderRadius:12, padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                <Badge text={todayDay.type==="gym"?"🏋️ GYM":"🏠 HOME"} color={todayDay.color} />
                <Badge text={weekNum<=4?"FOUNDATION":"INTENSITY"} color={weekNum<=4?T.gold:T.green} />
                {log?.completed && <Badge text="✓ DONE TODAY" color={T.green} />}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:T.text, letterSpacing:0.5 }}>{todayDay.focus}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>{todayDay.exercises.length} exercises · {todayDay.exercises.reduce((a,e)=>a+e.sets,0)} sets</div>
            </div>
            <button onClick={() => onOpenDay({...todayDay, weekNum, phase:weekNum<=4?"Foundation":"Intensity"})}
              style={{ background:log?.completed?T.green:todayDay.color, border:"none", color:"#080808", cursor:"pointer", padding:"11px 20px", borderRadius:10, fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:2, fontWeight:700, flexShrink:0 }}>
              {log?.completed ? "EDIT →" : "START →"}
            </button>
          </div>

          {/* Superset preview */}
          <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
            {todayDay.exercises.slice(0,6).map(ex => (
              <div key={ex.id} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 8px", background:T.dim, borderRadius:6 }}>
                {ex.superset && <span style={{ width:16, height:16, borderRadius:3, background:SS_COLORS[ex.superset[0]]+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:SS_COLORS[ex.superset[0]], fontFamily:"'Bebas Neue',sans-serif", flexShrink:0 }}>{ex.superset}</span>}
                <span style={{ fontSize:9, color:T.sub }}>{ex.name.split(" ").slice(0,3).join(" ")}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Nutrition reminder */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px 15px", marginTop:12 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.purple, letterSpacing:2, marginBottom:8 }}>🍽️ DAILY NUTRITION TARGETS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { label:"PROTEIN", value:`${data.settings?.dailyProtein || 180}g`, sub:"~1g per lb bodyweight", color:T.gold },
            { label:"CALORIES", value:"~2,400", sub:"maintenance est.", color:T.green },
            { label:"WATER", value:"100+ oz", sub:"more on training days", color:T.blue },
          ].map(m => (
            <div key={m.label} style={{ background:T.dim, borderRadius:8, padding:"8px 10px" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:8, color:T.muted, letterSpacing:2 }}>{m.label}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:m.color, marginTop:2 }}>{m.value}</div>
              <div style={{ fontSize:9, color:T.muted, marginTop:1 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: PROGRAM ─────────────────────────────────────────────────────────
function ProgramTab({ data, onOpenDay }) {
  const [expandedWeek, setExpandedWeek] = useState(data.settings?.weekNum || 1);
  const weekNum = data.settings?.weekNum || 1;

  return (
    <div>
      {ALL_WEEKS.map(week => {
        const isOpen = expandedWeek === week.weekNum;
        const completed = week.days.filter(d => data.logs[`w${week.weekNum}_d${d.dayOfWeek}`]?.completed).length;
        const isCurrent = week.weekNum === weekNum;
        return (
          <div key={week.weekNum} style={{ marginBottom:8 }}>
            <div onClick={() => setExpandedWeek(isOpen ? 0 : week.weekNum)}
              style={{ background:T.card, border:`1px solid ${isCurrent ? T.gold+"44" : T.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ background:isCurrent?T.gold:T.dim, color:isCurrent?"#080808":T.muted, fontFamily:"'Bebas Neue',sans-serif", fontSize:10, letterSpacing:3, padding:"3px 10px", borderRadius:4 }}>WEEK {week.weekNum}</div>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:T.text, letterSpacing:1 }}>{week.phase.toUpperCase()} PHASE</div>
                  <div style={{ fontSize:10, color:T.muted }}>{completed}/5 days complete</div>
                </div>
              </div>
              <span style={{ color:T.muted, fontSize:16, transition:"transform 0.2s", display:"block", transform:isOpen?"rotate(90deg)":"none" }}>›</span>
            </div>
            {isOpen && (
              <div style={{ paddingTop:4, display:"flex", flexDirection:"column", gap:5 }}>
                {week.days.map(day => {
                  const log = data.logs[`w${week.weekNum}_d${day.dayOfWeek}`];
                  const done = log?.completed;
                  const inProg = log && !done && Object.keys(log.sets||{}).length > 0;
                  return (
                    <div key={day.dayOfWeek} onClick={() => onOpenDay({...day, weekNum:week.weekNum, phase:week.phase})}
                      style={{ background:T.card, border:`1px solid ${done?T.green+"44":inProg?T.gold+"44":T.border}`, borderLeft:`3px solid ${day.color}`, borderRadius:8, padding:"11px 14px", cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:3 }}>
                            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:2 }}>{day.label.toUpperCase()}</span>
                            <Badge text={day.type==="gym"?"🏋️ GYM":"🏠 HOME"} color={day.color} small />
                            {done && <Badge text="✓" color={T.green} small />}
                            {inProg && <Badge text="IN PROGRESS" color={T.gold} small />}
                          </div>
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:T.text }}>{day.focus}</div>
                          <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{day.exercises.length} exercises · {day.exercises.reduce((a,e)=>a+e.sets,0)} sets</div>
                        </div>
                        <span style={{ color:T.muted, fontSize:18 }}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TAB: HEALTH ──────────────────────────────────────────────────────────
function HealthTab({ fitData, isConnected, onConnect, onDisconnect }) {
  if (!isConnected) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🏃</div>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:T.text, letterSpacing:2, marginBottom:8 }}>CONNECT GOOGLE FIT</div>
      <div style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:300, margin:"0 auto 24px" }}>
        Connect your Google Fit account to automatically pull sleep, heart rate, steps, and active minutes to calculate your daily readiness score.
      </div>
      <button onClick={onConnect} style={{ background:T.grad1, border:"none", color:"#080808", cursor:"pointer", padding:"14px 32px", borderRadius:12, fontFamily:"'Bebas Neue',sans-serif", fontSize:14, letterSpacing:2, fontWeight:700 }}>
        CONNECT GOOGLE FIT
      </button>
      <div style={{ fontSize:10, color:T.muted, marginTop:16 }}>Your data stays on your device — never stored on any server</div>
    </div>
  );

  const days = fitData || [];
  const avg = (key) => days.length ? (days.reduce((s,d)=>s+(d[key]||0),0)/days.length).toFixed(1) : "—";

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.green, letterSpacing:2 }}>● GOOGLE FIT CONNECTED</div>
        <button onClick={onDisconnect} style={{ background:"none", border:`1px solid ${T.border}`, color:T.muted, cursor:"pointer", padding:"4px 10px", borderRadius:5, fontSize:10, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>DISCONNECT</button>
      </div>

      {/* 7-day averages */}
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:2, marginBottom:8 }}>7-DAY AVERAGES</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
        <StatCard label="AVG SLEEP" value={`${avg("sleepHours")}h`} sub="target 7.5h" color={T.blue} />
        <StatCard label="AVG RESTING HR" value={`${avg("restingHR")} bpm`} sub="lower is better" color={T.red} />
        <StatCard label="AVG STEPS" value={parseInt(avg("steps")).toLocaleString()} sub="target 8,000" color={T.green} />
        <StatCard label="AVG ACTIVE MIN" value={`${avg("activeMin")}m`} sub="target 30m" color={T.gold} />
      </div>

      {/* Daily breakdown */}
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:2, marginBottom:8 }}>DAILY BREAKDOWN</div>
      {days.map((d, i) => {
        const r = calcReadiness(d, days.slice(i+1));
        const rl = readinessLabel(r);
        return (
          <div key={d.date} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px", marginBottom:7 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.text, letterSpacing:1 }}>
                  {new Date(d.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                </div>
              </div>
              {r && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:rl.color }}>{r.total}</div>
                  <div style={{ fontSize:9, color:rl.color }}>{rl.emoji} {rl.label}</div>
                </div>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
              {[
                { label:"SLEEP", value:`${d.sleepHours}h`, color:T.blue },
                { label:"HR", value:d.restingHR?`${d.restingHR}bpm`:"—", color:T.red },
                { label:"STEPS", value:d.steps?(d.steps/1000).toFixed(1)+"k":"—", color:T.green },
                { label:"ACTIVE", value:`${d.activeMin}m`, color:T.gold },
              ].map(m => (
                <div key={m.label} style={{ background:T.dim, borderRadius:6, padding:"6px 8px" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:7, color:T.muted, letterSpacing:2 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {days.length === 0 && <div style={{ fontSize:12, color:T.muted, textAlign:"center", padding:"20px 0" }}>No Google Fit data found for the past 7 days.</div>}
    </div>
  );
}

// ─── TAB: PROGRESS ────────────────────────────────────────────────────────
function ProgressTab({ data, onSave }) {
  const [wv, setWv] = useState("");
  const [wd, setWd] = useState(new Date().toISOString().slice(0,10));
  const bw = data.bodyWeight || [];
  const logs = Object.values(data.logs || {});
  const completed = logs.filter(l => l.completed).length;

  const streak = (() => {
    const dates = logs.filter(l=>l.completed&&l.date).map(l=>l.date).sort().reverse();
    let s = 0, prev = null;
    for (const d of dates) {
      if (!prev || (new Date(prev) - new Date(d)) / 86400000 <= 7) { s++; prev = d; }
      else break;
    }
    return s;
  })();

  const totalVolume = logs.reduce((t, log) =>
    t + Object.values(log.sets||{}).reduce((s, set) =>
      s + (set.done && set.weight && set.reps ? parseFloat(set.weight||0) * parseFloat(set.reps||0) : 0), 0), 0);

  const bwChange = bw.length >= 2 ? (bw[bw.length-1].weight - bw[0].weight).toFixed(1) : null;
  const prs = Object.values(data.prs || {}).sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
        <StatCard label="WORKOUTS DONE" value={`${completed}/40`} sub="of 40 sessions" color={T.gold} />
        <StatCard label="STREAK" value={`${streak}`} sub="sessions in a row" color={T.green} />
        <StatCard label="TOTAL VOLUME" value={`${Math.round(totalVolume/1000)}k lbs`} sub="total weight lifted" color={T.purple} />
        <StatCard label="WEIGHT CHANGE" value={bwChange!=null?`${bwChange>0?"+":""}${bwChange} lbs`:"—"} sub={bw.length<2?"log 2 entries":"from first entry"} color={bwChange<0?T.green:T.gold} />
      </div>

      {/* Body weight */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:14, marginBottom:14 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.gold, letterSpacing:2, marginBottom:10 }}>⚖️ BODY WEIGHT LOG</div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <input type="date" value={wd} onChange={e=>setWd(e.target.value)}
            style={{ background:"#0d0d0d", border:`1px solid ${T.dim}`, borderRadius:7, color:T.text, padding:"8px 10px", fontSize:12, outline:"none", flex:1 }}/>
          <input type="number" placeholder="lbs" value={wv} onChange={e=>setWv(e.target.value)}
            style={{ background:"#0d0d0d", border:`1px solid ${T.dim}`, borderRadius:7, color:T.text, padding:"8px 10px", fontSize:12, outline:"none", width:75 }}/>
          <button onClick={() => { if(!wv) return; onSave({...data, bodyWeight:[...bw,{date:wd,weight:parseFloat(wv)}]}); setWv(""); }}
            style={{ background:T.gold, border:"none", color:"#080808", cursor:"pointer", padding:"8px 16px", borderRadius:7, fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:1 }}>LOG</button>
        </div>
        <div style={{ maxHeight:150, overflowY:"auto" }}>
          {[...bw].reverse().map((e,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.muted, padding:"5px 0", borderBottom:`1px solid ${T.dim}` }}>
              <span>{e.date}</span>
              <span style={{ color:T.text, fontFamily:"'Bebas Neue',sans-serif" }}>{e.weight} lbs</span>
            </div>
          ))}
          {bw.length === 0 && <div style={{ fontSize:11, color:T.muted, textAlign:"center", padding:"10px 0" }}>Log your starting weight to begin tracking</div>}
        </div>
      </div>

      {/* PRs */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:14 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.purple, letterSpacing:2, marginBottom:10 }}>🏆 PERSONAL RECORDS</div>
        {prs.length === 0 && <div style={{ fontSize:11, color:T.muted, textAlign:"center", padding:"10px 0" }}>Complete workouts to auto-track your best weight per exercise</div>}
        {prs.slice(0,15).map((pr,i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.dim}` }}>
            <div>
              <div style={{ fontSize:12, color:T.text }}>{pr.name}</div>
              <div style={{ fontSize:10, color:T.muted }}>{pr.date}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.purple }}>{pr.weight} lbs</div>
              <div style={{ fontSize:10, color:T.muted }}>{pr.reps} reps</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB: SETTINGS ────────────────────────────────────────────────────────
function SettingsTab({ data, onSave }) {
  const [weekNum, setWeekNum] = useState(data.settings?.weekNum || 1);
  const [protein, setProtein] = useState(data.settings?.dailyProtein || 180);

  function save() { onSave({ ...data, settings:{ ...data.settings, weekNum:parseInt(weekNum), dailyProtein:parseInt(protein) }}); }

  return (
    <div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16, marginBottom:12 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.gold, letterSpacing:2, marginBottom:12 }}>⚙️ PROGRAM SETTINGS</div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:2, marginBottom:6 }}>CURRENT WEEK (1–8)</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {Array.from({length:8},(_,i)=>i+1).map(w => (
              <button key={w} onClick={() => setWeekNum(w)}
                style={{ width:40, height:40, borderRadius:8, cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", fontSize:13, border:"none", background:weekNum===w?T.gold:T.dim, color:weekNum===w?"#080808":T.muted, transition:"all 0.15s" }}>
                {w}
              </button>
            ))}
          </div>
          <div style={{ fontSize:10, color:T.muted, marginTop:6 }}>{weekNum <= 4 ? `Week ${weekNum} — Foundation Phase (12–15 reps)` : `Week ${weekNum} — Intensity Phase (8–12 reps)`}</div>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10, color:T.muted, letterSpacing:2, marginBottom:6 }}>DAILY PROTEIN TARGET (g)</div>
          <input type="number" value={protein} onChange={e=>setProtein(e.target.value)}
            style={{ background:"#0d0d0d", border:`1px solid ${T.dim}`, borderRadius:7, color:T.text, padding:"9px 12px", fontSize:14, outline:"none", width:"100%" }}/>
          <div style={{ fontSize:10, color:T.muted, marginTop:4 }}>Aim for ~1g per lb of bodyweight. At 42 with your training volume, 160–200g is optimal.</div>
        </div>
        <button onClick={save} style={{ width:"100%", padding:13, background:T.gold, border:"none", color:"#080808", cursor:"pointer", borderRadius:10, fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:2, fontWeight:700 }}>SAVE SETTINGS</button>
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16, marginBottom:12 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.red, letterSpacing:2, marginBottom:10 }}>⚠️ DANGER ZONE</div>
        <button onClick={() => { if(window.confirm("Reset ALL workout data? This cannot be undone.")) { localStorage.removeItem(LS_KEY); window.location.reload(); }}}
          style={{ width:"100%", padding:12, background:"transparent", border:`1px solid ${T.red}`, color:T.red, cursor:"pointer", borderRadius:10, fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:2 }}>
          RESET ALL DATA
        </button>
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, color:T.muted, letterSpacing:2, marginBottom:8 }}>ABOUT</div>
        <div style={{ fontSize:11, color:T.muted, lineHeight:1.7 }}>
          Chris's Workout & Health Tracker · v1.0<br/>
          8-Week Body Recomposition Program<br/>
          Data stored locally on this device<br/>
          Built with React + Vite · Hosted on GitHub Pages
        </div>
      </div>
    </div>
  );
}

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────
function useGoogleAuth(savedToken, onTokenSave) {
  const [token, setToken] = useState(savedToken);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      alert("Google Client ID not configured. See the setup instructions in Settings.");
      return;
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin + window.location.pathname,
      response_type: "token",
      scope: GOOGLE_SCOPES,
      include_granted_scopes: "true",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }, []);

  const disconnect = useCallback(() => {
    setToken(null);
    onTokenSave(null);
  }, [onTokenSave]);

  // Handle OAuth redirect
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace("#","?").slice(1));
    const accessToken = hash.get("access_token");
    if (accessToken) {
      setToken(accessToken);
      onTokenSave(accessToken);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return { token, loading, connect, disconnect, isConnected: !!token };
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData());
  const [tab, setTab] = useState("today");
  const [openDay, setOpenDay] = useState(null);
  const [fitData, setFitData] = useState(null);
  const [toast, setToast] = useState(null);

  const { token, connect, disconnect, isConnected } = useGoogleAuth(
    data.googleToken,
    (t) => persist({ ...data, googleToken: t })
  );

  function persist(d) { setData(d); saveData(d); showToast("Saved"); }
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 1500); }

  // Fetch Google Fit data when connected
  useEffect(() => {
    if (!token) return;
    fetchFitData(token, 7).then(setFitData).catch(e => {
      console.error("Fit error:", e);
      if (e.message?.includes("401")) disconnect();
    });
  }, [token]);

  const TABS = [
    { id:"today",    label:"TODAY",    icon:"🏠" },
    { id:"program",  label:"PROGRAM",  icon:"📋" },
    { id:"health",   label:"HEALTH",   icon:"❤️" },
    { id:"progress", label:"PROGRESS", icon:"📈" },
    { id:"settings", label:"SETTINGS", icon:"⚙️" },
  ];

  const completedCount = Object.values(data.logs||{}).filter(l=>l.completed).length;
  const totalPct = Math.round((completedCount/40)*100);

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:T.bg, minHeight:"100vh", color:T.text, paddingBottom:80 }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${T.border}`, padding:"env(safe-area-inset-top, 14px) 16px 0 16px", position:"sticky", top:0, background:"rgba(8,8,8,0.97)", backdropFilter:"blur(10px)", zIndex:50 }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:3, background:T.grad1, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                CHRIS'S TRACKER
              </div>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:2 }}>
                WEEK {data.settings?.weekNum||1} OF 8 · {(data.settings?.weekNum||1)<=4?"FOUNDATION":"INTENSITY"}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {isConnected && <div style={{ width:7, height:7, borderRadius:"50%", background:T.green }}/>}
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.gold }}>{totalPct}%</div>
                <div style={{ fontSize:9, color:T.muted }}>DONE</div>
              </div>
            </div>
          </div>
          <div style={{ height:2, background:T.dim, borderRadius:1, margin:"8px 0 0" }}>
            <div style={{ width:`${totalPct}%`, height:"100%", background:T.grad1, borderRadius:1 }}/>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"8px 12px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", fontSize:9, letterSpacing:2, border:"none", background:"transparent", color:tab===t.id?T.gold:T.muted, borderBottom:tab===t.id?`2px solid ${T.gold}`:"2px solid transparent", whiteSpace:"nowrap", flexShrink:0 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:640, margin:"0 auto", padding:"16px 14px 20px" }}>
        {tab==="today"    && <TodayTab    data={data} fitData={fitData} onOpenDay={setOpenDay} onSaveData={persist} />}
        {tab==="program"  && <ProgramTab  data={data} onOpenDay={setOpenDay} />}
        {tab==="health"   && <HealthTab   fitData={fitData} isConnected={isConnected} onConnect={connect} onDisconnect={disconnect} />}
        {tab==="progress" && <ProgressTab data={data} onSave={persist} />}
        {tab==="settings" && <SettingsTab data={data} onSave={persist} />}
      </div>

      {/* Bottom nav (mobile) */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(8,8,8,0.97)", backdropFilter:"blur(10px)", borderTop:`1px solid ${T.border}`, padding:"8px 0 env(safe-area-inset-bottom,8px)", zIndex:50 }}>
        <div style={{ display:"flex", justifyContent:"space-around", maxWidth:500, margin:"0 auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 8px" }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:8, letterSpacing:1, color:tab===t.id?T.gold:T.muted }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", background:T.green, color:"#080808", padding:"8px 20px", borderRadius:20, fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:2, zIndex:999, pointerEvents:"none" }}>✓ {toast}</div>}

      {/* Workout modal */}
      {openDay && <WorkoutModal day={openDay} data={data} onClose={() => setOpenDay(null)} onSave={d => { persist(d); setOpenDay(null); }} />}
    </div>
  );
}
