import React, { useState } from "react";
import { Search, SlidersHorizontal, ChevronRight, Plus, X, ArrowLeft, Bookmark, Check, Circle, Clock, AlertTriangle } from "lucide-react";
import { C, S, OWNERS, EFFORTS, fmtShort } from "../theme.js";
import { PhaseIcon, Bar, Chip, Empty } from "../components/UI.jsx";
import { phaseStats, isOverdue } from "../logic.js";

const FILTERS = [
  ["todas", "Todas"],
  ["pendientes", "Pendientes"],
  ["completadas", "Completadas"],
];

export default function Tareas({ plan, me, update, openTask }) {
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState("todas");
  const [mine, setMine] = useState(false);
  const [inPhase, setInPhase] = useState(null);
  const [catForm, setCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSub, setCatSub] = useState("");
  const [adding, setAdding] = useState(false);
  const [nt, setNt] = useState({ title: "", owner: "both", due: "", effort: "" });

  const match = (t) => {
    if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "pendientes" && t.status === "done") return false;
    if (filter === "completadas" && t.status !== "done") return false;
    if (mine && t.owner !== me.person && t.owner !== "both") return false;
    return true;
  };

  const addCategory = () => {
    if (!catName.trim()) return;
    update((p) => ({
      ...p,
      phases: [...p.phases, { id: `cat-${Date.now()}`, name: catName.trim(), sub: catSub.trim(), xp: 15, icon: "folder" }],
    }));
    setCatName(""); setCatSub(""); setCatForm(false);
  };

  const addTask = () => {
    if (!nt.title.trim() || !inPhase) return;
    update((p) => ({
      ...p,
      tasks: [...p.tasks, {
        id: `u-${Date.now()}`, phase: inPhase.id, owner: nt.owner, title: nt.title.trim(),
        due: nt.due, effort: nt.effort, status: "pending", notes: [], subtasks: [],
        critical: false, bookmarked: false,
      }],
    }));
    setNt({ title: "", owner: "both", due: "", effort: "" });
    setAdding(false);
  };

  const cycleStatus = (task) => {
    const order = ["pending", "progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % 3];
    update((p) => ({
      ...p,
      tasks: p.tasks.map((t) => t.id === task.id
        ? { ...t, status: next, ...(next === "done" ? { doneBy: me.person, doneAt: new Date().toISOString() } : {}) }
        : t),
    }));
  };

  // ---------- Vista de una categoría ----------
  if (inPhase) {
    const ps = phaseStats(plan, inPhase.id);
    const list = ps.all.filter(match).sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    return (
      <div style={S.wrap}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 0 10px" }}>
          <button onClick={() => { setInPhase(null); setAdding(false); }} style={{ border: "none", background: "transparent", padding: 0 }}>
            <ArrowLeft size={20} color={C.ink} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 800 }}>{inPhase.name}</div>
            <div style={{ fontSize: 11.5, color: C.inkFaint }}>{inPhase.sub}</div>
          </div>
          <PhaseIcon phase={inPhase} size={38} />
        </div>

        <div style={{ marginBottom: 4 }}><Bar pct={ps.pct} /></div>
        <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 14 }}>
          {ps.done}/{ps.total} listas · +{inPhase.xp} XP c/u
        </div>

        {list.length === 0 && <Empty>Nada por aquí todavía.</Empty>}

        {list.map((task) => {
          const o = OWNERS[task.owner];
          const subs = task.subtasks || [];
          const subsDone = subs.filter((x) => x.done).length;
          const Icon = task.status === "done" ? Check : task.status === "progress" ? Clock : Circle;
          return (
            <div key={task.id} style={{
              ...S.card, padding: 14, marginBottom: 9, display: "flex", gap: 12,
              alignItems: "flex-start", opacity: task.status === "done" ? 0.6 : 1,
            }}>
              <button onClick={() => cycleStatus(task)} style={{
                width: 25, height: 25, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                border: `1.6px solid ${task.status === "done" ? C.green : C.line}`,
                background: task.status === "done" ? C.green : task.status === "progress" ? C.goldSoft : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={13} strokeWidth={2.6} color={task.status === "done" ? "#fff" : C.inkSoft} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => openTask(task)}>
                <div style={{
                  fontSize: 14, fontWeight: 600, lineHeight: 1.35,
                  textDecoration: task.status === "done" ? "line-through" : "none",
                }}>
                  {task.critical && task.status !== "done" && (
                    <AlertTriangle size={13} color={C.red} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                  )}
                  {task.title}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  <Chip color={o.color} bg={o.bg}>{o.label}</Chip>
                  {task.due && (
                    <Chip color={isOverdue(task) ? "#fff" : C.inkSoft} bg={isOverdue(task) ? C.red : C.creamDeep}>
                      {isOverdue(task) ? "Vencida" : fmtShort(task.due)}
                    </Chip>
                  )}
                  {task.effort && <Chip color={C.violet} bg={C.violetSoft}>⏱ {task.effort}</Chip>}
                  {subs.length > 0 && <Chip color={C.green} bg={C.greenSoft}>☑ {subsDone}/{subs.length}</Chip>}
                  {(task.notes || []).length > 0 && <Chip color={C.roseDeep} bg={C.roseSoft}>💬 {task.notes.length}</Chip>}
                </div>
              </div>
              {task.bookmarked && <Bookmark size={15} fill={C.gold} color={C.gold} style={{ flexShrink: 0 }} />}
            </div>
          );
        })}

        {adding ? (
          <div style={{ ...S.card, marginTop: 6 }}>
            <input autoFocus value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })}
              placeholder="¿Qué hay que hacer?" style={S.input} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
              {Object.entries(OWNERS).map(([k, o]) => (
                <Chip key={k} color={o.color} bg={o.bg} onClick={() => setNt({ ...nt, owner: k })}
                  style={{ outline: nt.owner === k ? `2px solid ${o.color}` : "none" }}>{o.label}</Chip>
              ))}
              <input type="date" value={nt.due} onChange={(e) => setNt({ ...nt, due: e.target.value })}
                style={{ ...S.input, width: "auto", padding: "6px 9px", fontSize: 12 }} />
              <select value={nt.effort} onChange={(e) => setNt({ ...nt, effort: e.target.value })}
                style={{ ...S.input, width: "auto", padding: "6px 9px", fontSize: 12 }}>
                <option value="">esfuerzo…</option>
                {EFFORTS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setAdding(false)} style={{ border: "none", background: "transparent", color: C.inkFaint, fontWeight: 600 }}>
                <X size={16} />
              </button>
              <button onClick={addTask} style={{ ...S.btn, padding: "9px 18px", fontSize: 13.5 }}>Agregar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            width: "100%", marginTop: 8, border: `1px dashed ${C.line}`, background: "transparent",
            borderRadius: 18, padding: 14, color: C.roseDeep, fontWeight: 700, fontSize: 13.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Plus size={15} /> Agregar tarea
          </button>
        )}
      </div>
    );
  }

  // ---------- Lista de categorías ----------
  const results = q ? plan.tasks.filter(match) : [];

  return (
    <div style={S.wrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 14px" }}>
        <h1 style={S.h1}>Tareas</h1>
        <div style={{ display: "flex", gap: 14 }}>
          <button onClick={() => setSearching(!searching)} style={{ border: "none", background: "transparent", padding: 0 }}>
            <Search size={19} color={C.ink} />
          </button>
          <button onClick={() => setMine(!mine)} title="Solo las mías" style={{ border: "none", background: "transparent", padding: 0 }}>
            <SlidersHorizontal size={19} color={mine ? C.red : C.ink} />
          </button>
        </div>
      </div>

      {searching && (
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar una tarea…" style={{ ...S.input, marginBottom: 12 }} />
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {FILTERS.map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 12.5, fontWeight: 700,
            whiteSpace: "nowrap",
            background: filter === k ? C.roseSoft : C.card,
            color: filter === k ? C.roseDeep : C.inkSoft,
            boxShadow: filter === k ? "none" : `inset 0 0 0 1px ${C.line}`,
          }}>{label}</button>
        ))}
        {mine && (
          <button onClick={() => setMine(false)} style={{
            border: "none", borderRadius: 999, padding: "8px 14px", fontSize: 12.5,
            fontWeight: 700, background: C.green, color: "#fff", whiteSpace: "nowrap",
          }}>Solo mías ✕</button>
        )}
      </div>

      {q ? (
        <>
          <div style={{ ...S.label, marginBottom: 10 }}>{results.length} resultados</div>
          {results.map((t) => (
            <button key={t.id} onClick={() => openTask(t)} style={{
              ...S.card, width: "100%", textAlign: "left", marginBottom: 8, padding: 13,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.title}</span>
              <ChevronRight size={16} color={C.inkFaint} style={{ flexShrink: 0 }} />
            </button>
          ))}
          {results.length === 0 && <Empty>Sin resultados.</Empty>}
        </>
      ) : (
        <>
          {plan.phases.map((phase, i) => {
            const ps = phaseStats(plan, phase.id);
            const xpTotal = ps.total * phase.xp;
            return (
              <button key={phase.id} onClick={() => setInPhase(phase)} style={{
                ...S.card, width: "100%", textAlign: "left", marginBottom: 10, padding: 14,
                display: "flex", alignItems: "center", gap: 13,
              }}>
                <PhaseIcon phase={phase} index={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{phase.name}</span>
                    {ps.total > 0 && ps.done === ps.total && <span>🏆</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.inkFaint, margin: "3px 0 8px" }}>
                    {ps.done}/{ps.total} tareas · +{xpTotal} XP
                  </div>
                  <Bar pct={ps.pct} height={5} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{ps.pct}%</div>
                  <ChevronRight size={16} color={C.inkFaint} />
                </div>
              </button>
            );
          })}

          {catForm ? (
            <div style={{ ...S.card, marginTop: 4 }}>
              <input autoFocus value={catName} onChange={(e) => setCatName(e.target.value)}
                placeholder="Nombre de la categoría…" style={S.input} />
              <input value={catSub} onChange={(e) => setCatSub(e.target.value)}
                placeholder="Subtítulo (opcional)…" style={{ ...S.input, marginTop: 8 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button onClick={() => setCatForm(false)} style={{ border: "none", background: "transparent", color: C.inkFaint }}>
                  <X size={16} />
                </button>
                <button onClick={addCategory} style={{ ...S.btn, padding: "9px 18px", fontSize: 13.5 }}>Crear</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCatForm(true)} style={{
              width: "100%", border: `1px dashed ${C.rose}`, background: C.roseSoft,
              borderRadius: 20, padding: 15, color: C.roseDeep, fontWeight: 700, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 4,
            }}>
              <Plus size={16} /> Agregar categoría
            </button>
          )}
        </>
      )}
    </div>
  );
}
