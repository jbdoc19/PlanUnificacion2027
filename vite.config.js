import React, { useState } from "react";
import { ArrowLeft, Bookmark, MoreHorizontal, Check, ChevronDown, Plus, X, Bell, Trash2, Calendar } from "lucide-react";
import { C, S, OWNERS, EFFORTS, DICHOS, fmtShort, fmtAgo } from "../theme.js";
import { PhaseIcon, Avatar, Chip } from "../components/UI.jsx";
import { isOverdue } from "../logic.js";

export default function TaskDetail({ plan, task, me, update, close, celebrate }) {
  const [noteText, setNoteText] = useState("");
  const [subText, setSubText] = useState("");
  const [addingSub, setAddingSub] = useState(false);
  const [showSubs, setShowSubs] = useState(true);
  const [menu, setMenu] = useState(false);
  const [dicho] = useState(() => DICHOS[Math.floor(Math.random() * DICHOS.length)]);

  const phase = plan.phases.find((p) => p.id === task.phase) || { name: "", icon: "folder", id: "x" };
  const idx = plan.phases.findIndex((p) => p.id === task.phase);
  const o = OWNERS[task.owner];
  const subs = task.subtasks || [];
  const subsDone = subs.filter((s) => s.done).length;
  const notes = task.notes || [];

  const patch = (changes) =>
    update((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === task.id ? { ...t, ...changes } : t)) }));

  const cycleStatus = () => {
    const order = ["pending", "progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % 3];
    patch({ status: next, ...(next === "done" ? { doneBy: me.person, doneAt: new Date().toISOString() } : {}) });
    if (next === "done") {
      const rest = plan.tasks.filter((t) => t.phase === task.phase && t.id !== task.id);
      celebrate(rest.every((t) => t.status === "done") ? "big" : "small");
    }
  };

  const cycleOwner = () => {
    const order = ["jb", "carolina", "both"];
    patch({ owner: order[(order.indexOf(task.owner) + 1) % 3] });
  };

  const cycleEffort = () => {
    const i = EFFORTS.indexOf(task.effort);
    patch({ effort: EFFORTS[(i + 1) % EFFORTS.length] });
  };

  const toggleSub = (id) => {
    const next = subs.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    patch({ subtasks: next });
    if (next.length && next.every((s) => s.done) && task.status !== "done") celebrate("small");
  };

  const addSub = () => {
    if (!subText.trim()) return;
    patch({ subtasks: [...subs, { id: `s-${Date.now()}`, text: subText.trim(), done: false }] });
    setSubText("");
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    patch({ notes: [...notes, { author: me.person, text: noteText.trim(), ts: new Date().toISOString() }] });
    setNoteText("");
  };

  const remind = () => {
    if (!task.due) return;
    const d = task.due.replace(/-/g, "");
    const title = encodeURIComponent(`Plan de Unificación: ${task.title}`);
    const details = encodeURIComponent(`Responsable: ${o.label}. Marcala como lista en la app cuando termine.`);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${d}/${d}&details=${details}`, "_blank");
  };

  const removeTask = () => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    update((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== task.id) }));
    close();
  };

  return (
    <div style={{ ...S.screen, background: C.roseSoft }}>
      {/* Barra superior rosada */}
      <div style={{ background: C.rose, paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ ...S.wrap, display: "flex", alignItems: "center", gap: 12, padding: "16px 18px" }}>
          <button onClick={close} style={{ border: "none", background: "transparent", padding: 0 }}>
            <ArrowLeft size={20} color="#fff" />
          </button>
          <div style={{ flex: 1, textAlign: "center", color: "#fff", fontSize: 13.5, fontWeight: 700 }}>
            {String(idx + 1).padStart(2, "0")} {phase.name}
          </div>
          <button onClick={() => setMenu(!menu)} style={{ border: "none", background: "transparent", padding: 0 }}>
            <MoreHorizontal size={20} color="#fff" />
          </button>
        </div>
      </div>

      <div style={{ ...S.wrap, paddingTop: 14 }}>
        {menu && (
          <div style={{ ...S.card, marginBottom: 12, padding: 10 }}>
            <button onClick={removeTask} style={{
              display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent",
              color: C.red, fontWeight: 700, fontSize: 13.5, padding: 6, width: "100%",
            }}>
              <Trash2 size={15} /> Eliminar tarea
            </button>
          </div>
        )}

        {/* Encabezado */}
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <PhaseIcon phase={phase} index={idx} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 800, lineHeight: 1.28 }}>
                {task.title}
              </div>
            </div>
            <button onClick={() => patch({ bookmarked: !task.bookmarked })} style={{ border: "none", background: "transparent", padding: 0 }}>
              <Bookmark size={18} color={task.bookmarked ? C.gold : C.inkFaint} fill={task.bookmarked ? C.gold : "none"} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 13 }}>
            <Chip color={isOverdue(task) ? "#fff" : C.roseDeep} bg={isOverdue(task) ? C.red : C.roseSoft}>
              {task.due ? (isOverdue(task) ? `Vencida ${fmtShort(task.due)}` : `Vence: ${fmtShort(task.due)}`) : "Sin fecha"}
            </Chip>
            <Chip color={C.violet} bg={C.violetSoft} onClick={cycleEffort}>⏱ {task.effort || "esfuerzo"}</Chip>
            <Chip color={o.color} bg={o.bg} onClick={cycleOwner}>{o.label}</Chip>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 13, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.inkSoft,
              background: C.creamDeep, borderRadius: 999, padding: "6px 12px",
            }}>
              <Calendar size={13} />
              <input type="date" value={task.due || ""} onChange={(e) => patch({ due: e.target.value })}
                style={{ border: "none", background: "transparent", fontSize: 12, color: C.ink, padding: 0 }} />
            </label>
            {task.due && (
              <button onClick={remind} style={{
                display: "flex", alignItems: "center", gap: 6, border: "none",
                background: C.goldSoft, color: "#8A6D1F", borderRadius: 999,
                padding: "7px 13px", fontSize: 12, fontWeight: 700,
              }}>
                <Bell size={13} /> Recordarme
              </button>
            )}
          </div>

          <button onClick={cycleStatus} style={{
            ...S.btn, width: "100%", marginTop: 14, padding: "13px",
            background: task.status === "done" ? C.greenSoft : C.green,
            color: task.status === "done" ? C.green : "#fff", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {task.status === "done" ? <><Check size={16} /> Lista ✓ (tocá para reabrir)</>
              : task.status === "progress" ? "En curso · marcar como lista"
              : "Marcar en curso"}
          </button>
        </div>

        {/* Subtareas */}
        <div style={{ ...S.card, marginBottom: 12 }}>
          <button onClick={() => setShowSubs(!showSubs)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", border: "none", background: "transparent", padding: 0,
          }}>
            <span style={S.label}>Subtareas</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>
                {subsDone}/{subs.length} completadas
              </span>
              <ChevronDown size={16} color={C.inkFaint} style={{
                transform: showSubs ? "rotate(180deg)" : "none", transition: "transform 200ms",
              }} />
            </span>
          </button>

          {showSubs && (
            <div style={{ marginTop: 12 }}>
              {subs.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                  <button onClick={() => toggleSub(s.id)} style={{
                    width: 20, height: 20, borderRadius: 7, flexShrink: 0,
                    border: `1.6px solid ${s.done ? C.green : C.line}`,
                    background: s.done ? C.green : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {s.done && <Check size={12} strokeWidth={3} color="#fff" />}
                  </button>
                  <span style={{
                    flex: 1, fontSize: 13.5,
                    color: s.done ? C.inkFaint : C.ink,
                    textDecoration: s.done ? "line-through" : "none",
                  }}>{s.text}</span>
                  <button onClick={() => patch({ subtasks: subs.filter((x) => x.id !== s.id) })}
                    style={{ border: "none", background: "transparent", padding: 3 }}>
                    <X size={13} color={C.inkFaint} />
                  </button>
                </div>
              ))}

              {addingSub ? (
                <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
                  <input autoFocus value={subText} onChange={(e) => setSubText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSub()}
                    placeholder="Nueva subtarea…" style={S.input} />
                  <button onClick={addSub} style={{ ...S.btn, padding: "0 16px", fontSize: 13 }}>+</button>
                </div>
              ) : (
                <button onClick={() => setAddingSub(true)} style={{
                  border: "none", background: "transparent", color: C.roseDeep, fontWeight: 700,
                  fontSize: 12.5, display: "flex", alignItems: "center", gap: 5, padding: "9px 0 0",
                }}>
                  <Plus size={13} /> Agregar subtarea
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notas */}
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={S.label}>Notas</span>
            <span style={{ fontSize: 11.5, color: C.roseDeep, fontWeight: 700 }}>{notes.length}</span>
          </div>

          {notes.map((n, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 13 }}>
              <Avatar person={n.author} size={30} me={me} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: OWNERS[n.author]?.color }}>
                    {OWNERS[n.author]?.label || n.author}
                  </span>
                  <span style={{ fontSize: 10.5, color: C.inkFaint }}>{fmtAgo(n.ts)}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 2, whiteSpace: "pre-wrap" }}>{n.text}</div>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 7 }}>
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder={`Nota de ${OWNERS[me.person].label}…`} style={S.input} />
            <button onClick={addNote} style={{ ...S.btn, padding: "0 16px", fontSize: 13 }}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Dicho */}
        <div style={{
          background: C.roseSoft, border: `1px solid ${C.rose}`, borderRadius: 22,
          padding: 16, textAlign: "center", marginBottom: 12,
        }}>
          <div style={{ fontFamily: "Caveat, cursive", fontSize: 22, color: C.roseDeep, fontWeight: 700 }}>
            ¡Vamos equipo!
          </div>
          <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 5, fontStyle: "italic" }}>{dicho}</div>
        </div>
      </div>
    </div>
  );
}
