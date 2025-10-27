// Basic, local rule-based coach for running guidance.
// No network calls; safe to run in-browser only.

function estimateMaxHr(age) {
  if (!age || age <= 0) return 200; // fallback
  // Common formulae: 220-age; Tanaka: 208 - 0.7*age. Use Tanaka as a middle ground.
  return Math.round(208 - 0.7 * age);
}

function hrZone(avgHr, maxHr) {
  if (!avgHr || !maxHr) return { zone: "unknown", pct: null };
  const pct = (avgHr / maxHr) * 100;
  let zone = "Z1";
  if (pct < 60) zone = "Z1 (very easy / recovery)";
  else if (pct < 70) zone = "Z2 (easy / aerobic)";
  else if (pct < 80) zone = "Z3 (tempo / steady)";
  else if (pct < 90) zone = "Z4 (threshold)";
  else zone = "Z5 (VO2 / intervals)";
  return { zone, pct: Math.round(pct) };
}

function paceFromDistanceAndDuration(distanceKm, durationMin) {
  if (!distanceKm || !durationMin || distanceKm <= 0) return null;
  const paceMinPerKm = durationMin / distanceKm;
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return { paceMinPerKm, label: `${min}:${sec.toString().padStart(2, "0")}/km` };
}

function analyzeRun(run) {
  const recs = [];
  const age = toNum(run.age);
  const maxHr = estimateMaxHr(age);
  const avgHr = toNum(run.avgHr);
  const distanceKm = toNum(run.distance);
  const durationMin = toNum(run.duration);
  const notes = (run.notes || "").toLowerCase();

  const p = paceFromDistanceAndDuration(distanceKm, durationMin);
  if (p) recs.push(`Your average pace is ${p.label}.`);

  if (avgHr) {
    const z = hrZone(avgHr, maxHr);
    if (z.pct) {
      recs.push(`Avg HR ${avgHr} bpm ≈ ${z.pct}% of max → ${z.zone}.`);
      if (z.pct >= 88) recs.push("High intensity. Keep reps short, increase recovery, monitor form and breathing.");
      else if (z.pct >= 80) recs.push("Near threshold. Consider 10–20 min blocks with 2–3 min easy between.");
      else if (z.pct >= 70) recs.push("Steady aerobic. Good for building endurance. Keep conversation pace.");
      else recs.push("Easy zone. Great for recovery or warm-up/cool-down.");
    }
  }

  if (distanceKm && distanceKm >= 10 && (!durationMin || durationMin > distanceKm * 7)) {
    recs.push("Longer effort detected. Consider fueling (30–60g carbs/hr) and hydration (400–800ml/hr).");
  }

  if (notes.includes("hot") || notes.includes("heat")) {
    recs.push("Heat noted. Slow pace 10–20s/km, increase fluids and electrolytes.");
  }
  if (notes.includes("hill") || notes.includes("hills") || notes.includes("elevation")) {
    recs.push("Hills detected. Shorten stride on climbs, quick cadence; lean slightly from ankles.");
  }

  if (p && p.paceMinPerKm <= 4.5) recs.push("Fast session. Prioritize cooldown and light stretching after.");
  if (p && p.paceMinPerKm >= 7.5) recs.push("Easy day pace—great for recovery. Keep effort conversational.");

  if (!distanceKm && !durationMin && !avgHr) {
    recs.push("Add distance, duration, or heart rate to get tailored tips.");
  }

  return recs;
}

function respondToMessage(message, run) {
  const m = (message || "").toLowerCase();
  const tips = analyzeRun(run);

  // Quick intents
  if (/pace/.test(m)) {
    const p = paceFromDistanceAndDuration(toNum(run.distance), toNum(run.duration));
    return p ? `Your avg pace is ${p.label}. ${attachTopTip(tips)}`
             : `I need distance and duration to compute pace. ${attachTopTip(tips)}`;
  }
  if (/(hr|heart).*(zone|rate)|zone/.test(m)) {
    const maxHr = estimateMaxHr(toNum(run.age));
    const z = hrZone(toNum(run.avgHr), maxHr);
    return z.pct ? `With avg HR ${run.avgHr} bpm, that’s ~${z.pct}% of max (${maxHr}). Zone: ${z.zone}. ${attachTopTip(tips)}`
                 : `Provide age (optional) and avg HR for zone guidance. ${attachTopTip(tips)}`;
  }
  if (/hydrate|water|drink/.test(m)) {
    return "Hydration: ~400–800ml/hour; in heat, add electrolytes. Sip steadily, don’t chug.";
  }
  if (/fuel|carb|nutrition/.test(m)) {
    return "For runs >60 min: ~30–60g carbs/hour. Practice what you’ll use on race day.";
  }
  if (/warm.?up/.test(m)) {
    return "Warm-up: 5–10 min easy jog + 3–4 strides. Mobilize ankles/hips; ease into target pace.";
  }
  if (/cool.?down/.test(m)) {
    return "Cool-down: 5–10 min easy jog. Light mobility for calves/hips; hydrate and refuel within 30–60 min.";
  }
  if (/injur|pain|hurt/.test(m)) {
    return "If pain changes your gait or persists, stop and consult a professional. Don’t push through sharp pain.";
  }

  // Default: summarize top suggestions and reflect user message
  const summary = tips.length ? `Here’s a tip: ${tips[0]}` : "Tell me distance, time, and HR for tailored advice.";
  return `${reflect(m)} ${summary}`.trim();
}

function attachTopTip(tips) {
  return tips && tips.length ? `Tip: ${tips[0]}` : "";
}

function reflect(m) {
  if (!m) return "Got it.";
  if (m.length < 50) return `Noted: "${capitalize(m)}".`;
  return "I hear you.";
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

window.LocalCoach = { analyzeRun, respondToMessage };

