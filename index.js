import React, { useState } from "react";
import { Heart, FolderOpen, LogOut, RefreshCw, Trophy, Plane, CalendarHeart } from "lucide-react";
import { C, S, OWNERS, fmtDate, fmtMonth, fmtAgo } from "../theme.js";
import { Avatar, Bar } from "../components/UI.jsx";
import { stats } from "../logic.js";

export default function Nosotros({ plan, me, update, refresh, status }) {
  const [driveDraft, setDriveDraft] = useState(plan.driveUrl || "");
  const [showLog, setShowLog] = useState(false);
  const s = stats(plan);
  const log = [...(plan.openLog || [])].reverse();

  return (
    <div style={S.wrap}>
      <div style={{ padding: "20px 0 6px" }}>
        <h1 style={S.h1}>Nosotros</h1>
      </div>

      {/* Sticker */}
      <div style={{
        ...S.card, padding: 18, textAlign: "center", marginBottom: 12,
        background: `linear-gradient(180deg, ${C.card}, ${C.roseSoft})`,
      }}>
        <img src="/reinicio.jpg" alt="Nuestro reinicio" style={{
          width: "62%", maxWidth: 210, borderRadius: 18,
          boxShadow: "0 10px 30px rgba(36,49,45,.16)", transform: "rotate(-2deg)",
        }} />
        <div style={{ fontFamily: "Caveat, cursive", fontSize: 30, color: C.roseDeep, fontWeight: 700, marginTop: 12 }}>
          Nuestro reinicio
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>26 de julio de 2026</div>
      </div>

      {/* Cifras del viaje */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ ...S.label, marginBottom: 12 }}>Nuestro viaje en números</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { Icon: Plane, v: `${s.pct}%`, l: "del vuelo MDE → SAT" },
            { Icon: Trophy, v: `${s.xp}`, l: `XP · ${s.level.name}` },
            { Icon: CalendarHeart, v: plan.marriageDate ? fmtDate(plan.marriageDate) : "—", l: "fecha de la boda" },
            { Icon: Heart, v: s.days !== null ? `${s.days}` : "—", l: "días para estar juntos" },
          ].map(({ Icon, v, l }, i) => (
            <div key={i}>
              <Icon size={15} color={C.roseDeep} />
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 800, marginTop: 5 }}>{v}</div>
              <div style={{ fontSize: 11, color: C.inkFaint, lineHeight: 1.35 }}>{l}</div>
            </div>
          ))}
        </div>
        {s.range && (
          <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
            Reunificación estimada: <b style={{ textTransform: "capitalize" }}>{s.range}</b>
          </div>
        )}
      </div>

      {/* Equipo */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ ...S.label, marginBottom: 12 }}>El equipo</div>
        {["jb", "carolina"].map((who) => {
          const total = plan.tasks.filter((t) => t.status === "done" && t.doneBy === who).length;
          const open = plan.tasks.filter((t) => (t.owner === who || t.owner === "both") && t.status !== "done").length;
          return (
            <div key={who} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
              <Avatar person={who} size={40} me={me} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: OWNERS[who].color }}>
                  {OWNERS[who].label}
                  {me.person === who && <span style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 600 }}> · vos</span>}
                </div>
                <div style={{ fontSize: 11.5, color: C.inkFaint }}>{total} listas · {open} abiertas</div>
              </div>
              <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 800, color: C.ink }}>
                {s.weeklyXp[who]}
                <span style={{ fontSize: 10, color: C.inkFaint, fontWeight: 600 }}> XP/sem</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drive */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ ...S.label, marginBottom: 10 }}>Carpeta compartida de Drive</div>
        <div style={{ display: "flex", gap: 7 }}>
          <input value={driveDraft} onChange={(e) => setDriveDraft(e.target.value)}
            placeholder="https://drive.google.com/…" style={{ ...S.input, fontSize: 12.5 }} />
          <button onClick={() => update((p) => ({ ...p, driveUrl: driveDraft.trim() }))}
            style={{ ...S.btn, padding: "0 16px", fontSize: 13 }}>Guardar</button>
        </div>
        {plan.driveUrl && (
          <button onClick={() => window.open(plan.driveUrl, "_blank")} style={{
            width: "100%", marginTop: 10, border: "none", background: C.greenSoft, color: C.green,
            borderRadius: 14, padding: 12, fontSize: 13.5, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <FolderOpen size={16} /> Abrir carpeta
          </button>
        )}
      </div>

      {/* Sincronización */}
      <div style={{ ...S.card, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Sincronización</div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 2 }}>
            {status === "saving" ? "Guardando…" : status === "error" ? "Error al guardar" : "Al día con los dos teléfonos"}
          </div>
        </div>
        <button onClick={refresh} style={{
          border: `1px solid ${C.line}`, background: "#fff", borderRadius: 999,
          padding: "9px 15px", fontSize: 12.5, fontWeight: 700, color: C.green,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Registro de visitas */}
      <button onClick={() => setShowLog(!showLog)} style={{
        width: "100%", border: "none", background: "transparent", color: C.inkFaint,
        fontSize: 16, fontWeight: 800, letterSpacing: "0.25em", padding: "10px 0",
      }}>· · ·</button>

      {showLog && (
        <div style={{ ...S.card, marginBottom: 12, maxHeight: 280, overflowY: "auto" }}>
          <div style={{ ...S.label, marginBottom: 10 }}>Registro de visitas</div>
          {log.length === 0 && <div style={{ fontSize: 12.5, color: C.inkFaint }}>Sin visitas registradas.</div>}
          {log.map((e, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              padding: "6px 0", borderBottom: `1px solid ${C.line}`, fontSize: 12.5,
            }}>
              <span style={{ fontWeight: 700, color: OWNERS[e.who]?.color || C.inkSoft }}>
                {OWNERS[e.who]?.label || e.who}
              </span>
              <span style={{ fontSize: 11, color: C.inkFaint }}>
                {new Date(e.ts).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cuenta */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ ...S.label, marginBottom: 8 }}>Cuenta</div>
        <div style={{ fontSize: 13, color: C.inkSoft }}>
          Entrando como <b style={{ color: OWNERS[me.person].color }}>{OWNERS[me.person].label}</b> en este teléfono
        </div>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST", credentials: "include" });
            window.location.reload();
          }}
          style={{
            width: "100%", marginTop: 12, border: `1px solid ${C.line}`, background: "#fff",
            borderRadius: 14, padding: 12, fontSize: 13.5, fontWeight: 700, color: C.red,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>

      <p style={{ fontSize: 11, color: C.inkFaint, lineHeight: 1.55, textAlign: "center", padding: "0 10px 10px" }}>
        Las fechas y el estimado de reunificación son propuestas de trabajo. Los trámites migratorios, tarifas y tiempos
        cambian; confirmá cualquier fecha crítica con el abogado o en uscis.gov antes de actuar.
      </p>
    </div>
  );
}
