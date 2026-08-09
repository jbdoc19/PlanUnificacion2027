import { LEVELS, EFFORT_MIN, addMonths, fmtMonth, todayISO } from "../theme.js";

export function stats(plan) {
  const tasks = plan?.tasks || [];
  const docs = plan?.docs || [];
  const phases = plan?.phases || [];

  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const docsDone = docs.filter((d) => d.stage === "drive").length;
  const total = tasks.length + docs.length;
  const pct = total ? Math.round(((tasksDone + docsDone) / total) * 100) : 0;

  const xp =
    tasks.filter((t) => t.status === "done").reduce((s, t) => s + (phases.find((p) => p.id === t.phase)?.xp || 10), 0) +
    docsDone * 10;

  let level = LEVELS[0];
  let next = null;
  LEVELS.forEach((l, i) => {
    if (xp >= l.xp) {
      level = l;
      next = LEVELS[i + 1] || null;
    }
  });
  const levelIndex = LEVELS.indexOf(level) + 1;
  const levelPct = next ? Math.round(((xp - level.xp) / (next.xp - level.xp)) * 100) : 100;
  const levelCap = next ? next.xp : LEVELS[LEVELS.length - 1].xp;

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const weekly = { jb: 0, carolina: 0 };
  const weeklyXp = { jb: 0, carolina: 0 };
  tasks.forEach((t) => {
    if (t.status === "done" && t.doneAt && new Date(t.doneAt).getTime() > weekAgo && weekly[t.doneBy] !== undefined) {
      weekly[t.doneBy] += 1;
      weeklyXp[t.doneBy] += phases.find((p) => p.id === t.phase)?.xp || 10;
    }
  });
  const leader = weeklyXp.jb === weeklyXp.carolina ? null : weeklyXp.jb > weeklyXp.carolina ? "jb" : "carolina";

  let days = null;
  let range = null;
  let arrival = null;
  let daysToWedding = null;
  if (plan?.marriageDate) {
    const mid = addMonths(plan.marriageDate, 15);
    arrival = mid;
    days = Math.max(0, Math.ceil((mid.getTime() - Date.now()) / 86400000));
    range = `${fmtMonth(addMonths(plan.marriageDate, 12))} – ${fmtMonth(addMonths(plan.marriageDate, 18))}`;
    daysToWedding = Math.max(
      0,
      Math.ceil((new Date(plan.marriageDate + "T12:00:00").getTime() - Date.now()) / 86400000)
    );
  }

  return {
    tasksDone, docsDone, total, pct, xp, level, next, levelPct, levelIndex, levelCap,
    weekly, weeklyXp, leader, days, range, arrival, daysToWedding,
  };
}

export function phaseStats(plan, phaseId) {
  const all = (plan?.tasks || []).filter((t) => t.phase === phaseId);
  const done = all.filter((t) => t.status === "done").length;
  return { all, done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
}

export function myOpenTasks(plan, person) {
  return (plan?.tasks || []).filter(
    (t) => (t.owner === person || t.owner === "both") && t.status !== "done"
  );
}

export function nextAction(plan, person) {
  const open = myOpenTasks(plan, person);
  const dated = open.filter((t) => t.due).sort((a, b) => a.due.localeCompare(b.due));
  return dated[0] || open.find((t) => t.critical) || open[0] || null;
}

export function quickWin(plan, person) {
  const open = myOpenTasks(plan, person);
  return [...open].sort((a, b) => (EFFORT_MIN[a.effort] || 9999) - (EFFORT_MIN[b.effort] || 9999))[0] || null;
}

export function dueSoonCount(plan, person) {
  const limit = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return myOpenTasks(plan, person).filter((t) => t.due && t.due <= limit).length;
}

export function isOverdue(task) {
  return task.due && task.due < todayISO() && task.status !== "done";
}

export function allNotes(plan) {
  const out = [];
  (plan?.tasks || []).forEach((t) => {
    (t.notes || []).forEach((n) => out.push({ ...n, taskId: t.id, taskTitle: t.title, phase: t.phase }));
  });
  return out.sort((a, b) => new Date(b.ts) - new Date(a.ts));
}
