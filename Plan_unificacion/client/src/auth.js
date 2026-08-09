import React, { useState } from "react";
import { Lock, Unlock, Heart, MessageCircle } from "lucide-react";
import { C, S, OWNERS, fmtAgo } from "../theme.js";
import { Avatar, Empty, Bar } from "../components/UI.jsx";
import { stats, allNotes } from "../logic.js";

const MILESTONES = [20, 40, 60, 80, 100];

export default function Mensajes({ plan, me, update, openTask }) {
  const [tab, setTab] = useState("feed");
  const [drafts, setDrafts] = useState({});
  const s = stats(plan);
  const notes = allNotes(plan);
  const partner = me.person === "jb" ? "carolina" : "jb";
  const forMe = plan.messages?.[partner] || {};
  const mine = plan.messages?.[me.person] || {};

  const saveMsg = (m) => {
    const text = (drafts[m] || "").trim();
    if (!text) return;
    update((p) => ({
      ...p,
      messages: { ...p.messages, [me.person]: { ...(p.messages?.[me.person] || {}), [m]: text } },
    }));
    setDrafts((d) => ({ ...d, [m]: "" }));
  };

  return (
    <div style={S.wrap}>
      <div style={{ padding: "20px 0 14px" }}>
        <h1 style={S.h1}>Mensajes</h1>
      </div>

      <div style={{ display: "flex", background: C.card, borderRadius: 999, padding: 4, marginBottom: 16, border: `1px solid ${C.line}` }}>
        {[["feed", "Notas del plan"], ["hitos", "Mensajes del viaje"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, border: "none", borderRadius: 999, padding: "9px 6px", fontSize: 12.5, fontWeight: 700,
            background: tab === k ? C.roseSoft : "transparent",
            color: tab === k ? C.roseDeep : C.inkSoft,
          }}>{label}</button>
        ))}
      </div>

      {tab === "feed" ? (
        <>
          {notes.length === 0 && <Empty>Todavía no hay notas. Abrí una tarea y escribí la primera.</Empty>}
          {notes.map((n, i) => {
            const task = plan.tasks.find((t) => t.id === n.taskId);
            return (
              <div key={i} style={{ ...S.card, marginBottom: 9, padding: 14 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <Avatar person={n.author} size={32} me={me} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: OWNERS[n.author]?.color }}>
                        {OWNERS[n.author]?.label}
                      </span>
                      <span style={{ fontSize: 10.5, color: C.inkFaint }}>{fmtAgo(n.ts)}</span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.45, margin: "3px 0 7px", whiteSpace: "pre-wrap" }}>
                      {n.text}
                    </div>
                    <button onClick={() => task && openTask(task)} style={{
                      border: "none", background: C.creamDeep, borderRadius: 999,
                      padding: "5px 11px", fontSize: 11, fontWeight: 700, color: C.inkSoft,
                      display: "flex", alignItems: "center", gap: 5, maxWidth: "100%",
                    }}>
                      <MessageCircle size={11} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.taskTitle}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          <div style={{ ...S.card, marginBottom: 16, background: C.roseSoft, border: `1px solid ${C.rose}` }}>
            <div style={{ fontFamily: "Caveat, cursive", fontSize: 24, color: C.roseDeep, fontWeight: 700 }}>
              Cartas del vuelo <Heart size={15} fill={C.rose} color={C.rose} style={{ verticalAlign: "middle" }} />
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5, marginTop: 5 }}>
              Escribí ahora, se abren solas cuando el plan llegue a cada porcentaje. Van {s.pct}%.
            </div>
            <div style={{ marginTop: 10 }}><Bar pct={s.pct} height={5} /></div>
          </div>

          <div style={{ ...S.label, marginBottom: 9 }}>De {OWNERS[partner].label} para vos</div>
          {MILESTONES.map((m) => {
            const open = s.pct >= m;
            const msg = forMe[m];
            return (
              <div key={`r${m}`} style={{
                ...S.card, padding: 13, marginBottom: 8,
                display: "flex", gap: 11, alignItems: "flex-start",
                background: open && msg ? C.card : "transparent",
                border: open && msg ? `1px solid ${C.rose}` : `1px dashed ${C.line}`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                  background: open ? C.roseSoft : C.creamDeep,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: open ? C.roseDeep : C.inkFaint,
                }}>{m}%</div>
                <div style={{ flex: 1, paddingTop: 3 }}>
                  {open ? (
                    msg ? (
                      <>
                        <Unlock size={12} color={C.roseDeep} style={{ verticalAlign: "-1px", marginRight: 5 }} />
                        <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{msg}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 12.5, color: C.inkFaint }}>Desbloqueado, sin mensaje aquí.</span>
                    )
                  ) : (
                    <span style={{ fontSize: 12.5, color: C.inkFaint }}>
                      <Lock size={12} style={{ verticalAlign: "-1px", marginRight: 5 }} />
                      Se abre al {m}% del vuelo
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ ...S.label, margin: "20px 0 9px" }}>Los que vos dejás para {OWNERS[partner].label}</div>
          {MILESTONES.map((m) => (
            <div key={`w${m}`} style={{ ...S.card, padding: 13, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: C.greenSoft,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: C.green,
                }}>{m}%</div>
                {mine[m] ? (
                  <span style={{ flex: 1, fontSize: 13, color: C.inkSoft }}>✓ {mine[m]}</span>
                ) : (
                  <div style={{ display: "flex", gap: 7, flex: 1 }}>
                    <input value={drafts[m] || ""} onChange={(e) => setDrafts((d) => ({ ...d, [m]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && saveMsg(m)}
                      placeholder="Escribí algo bonito…" style={{ ...S.input, fontSize: 12.5 }} />
                    <button onClick={() => saveMsg(m)} style={{ ...S.btn, padding: "0 14px", fontSize: 15 }}>💌</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
