import React from "react";
import { Star, Zap, Heart, Timer, Crown, ChevronRight, Settings, FolderOpen } from "lucide-react";
import { C, S, OWNERS, fmtDate, fmtShort, fmtMonth } from "../theme.js";
import { Route, Bar, Avatar, Chip } from "../components/UI.js";
import { stats, nextAction, quickWin, dueSoonCount, isOverdue } from "../logic.js";

export default function Inicio({ plan, me, update, openTask, setTab, quickMode, setQuickMode }) {
  const s = stats(plan);
  const na = nextAction(plan, me.person);
  const qw = quickWin(plan, me.person);
  const shown = quickMode && qw ? qw : na;
  const soon = dueSoonCount(plan, me.person);

  return (
    <div style={S.wrap}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 14 }}>
        <button onClick={() => setTab("nosotros")} style={{ border: "none", background: "transparent", padding: 4 }}>
          <Settings size={19} color={C.inkFaint} />
        </button>
      </div>

      <Route pct={s.pct} />

      <div style={{ textAlign: "center", margin: "10px 0 18px" }}>
        <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>
          Avance del plan <b style={{ color: C.ink, fontSize: 15 }}>{s.pct}%</b>
        </div>
        <div style={{ marginTop: 8 }}><Bar pct={s.pct} height={7} /></div>
        <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 6 }}>
          {s.tasksDone} tareas · {s.docsDone} documentos en Drive
        </div>
      </div>

      {/* Próxima acción */}
      {shown && (
        <div style={{ ...S.card, background: C.green, border: "none", color: "#fff", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            {quickMode ? <Zap size={13} color={C.gold} fill={C.gold} /> : <Star size={13} color={C.gold} fill={C.gold} />}
            <span style={{ ...S.label, color: "rgba(255,255,255,.72)" }}>
              {quickMode ? "Tu victoria rápida" : "Tu próxima acción"}
            </span>
          </div>
          <div onClick={() => openTask(shown)} style={{
            fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 700, lineHeight: 1.25, cursor: "pointer",
          }}>
            {shown.title}
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 13 }}>
            {shown.due && (
              <Chip color={isOverdue(shown) ? "#fff" : C.roseDeep} bg={isOverdue(shown) ? C.red : "rgba(255,255,255,.92)"}>
                {isOverdue(shown) ? "Vencida" : `Vence: ${fmtShort(shown.due)}`}
              </Chip>
            )}
            {shown.effort && <Chip color="#fff" bg="rgba(255,255,255,.16)">⏱ {shown.effort}</Chip>}
            <Chip color={OWNERS[shown.owner].color} bg={OWNERS[shown.owner].bg}>{OWNERS[shown.owner].label}</Chip>
          </div>
          {qw && na && qw.id !== na.id && (
            <button onClick={() => setQuickMode(!quickMode)} style={{
              border: "none", background: "transparent", color: C.gold, fontWeight: 700,
              fontSize: 13, display: "flex", alignItems: "center", gap: 6,
              padding: "13px 0 0", width: "100%", justifyContent: "space-between",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Zap size={13} /> {quickMode ? "Volver a la próxima acción" : "¿Solo tenés 5 minutos?"}
              </span>
              <ChevronRight size={15} />
            </button>
          )}
          {soon > 1 && !quickMode && (
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)", marginTop: 10 }}>
              y {soon - 1} más con fecha esta semana
            </div>
          )}
        </div>
      )}

      {/* Cuenta regresiva + boda */}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ ...S.card, flex: 1, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <Heart size={12} fill={C.rose} color={C.rose} />
            <span style={S.label}>Días para estar juntos</span>
          </div>
          {s.days !== null ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontFamily: "Fraunces, serif", fontSize: 34, fontWeight: 800, color: C.red, lineHeight: 1 }}>{s.days}</span>
                <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>días</span>
              </div>
              <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 6 }}>
                Estimado: <b style={{ color: C.inkSoft, textTransform: "capitalize" }}>{fmtMonth(s.arrival)}</b>
              </div>
              <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 3 }}>Rango: {s.range}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: C.inkFaint }}>Poné la fecha de la boda →</div>
          )}
        </div>

        <div style={{ ...S.card, flex: 1, padding: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <Timer size={12} color={C.green} />
            <span style={S.label}>Fecha de la boda</span>
          </div>
          <input
            type="date"
            value={plan.marriageDate || ""}
            onChange={(e) => update((p) => ({ ...p, marriageDate: e.target.value }))}
            style={{
              border: "none", background: "transparent", padding: 0,
              fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 800, color: C.green, width: "100%",
            }}
          />
          {s.daysToWedding !== null && (
            <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 8 }}>
              {s.daysToWedding > 0 ? `Faltan ${s.daysToWedding} días` : "¡Ya se casaron! 💍"}
            </div>
          )}
        </div>
      </div>

      {/* Nivel */}
      <div style={{ ...S.card, marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={S.label}>Nivel de unificación</div>
          <div style={{ margin: "9px 0 7px" }}>
            <Bar pct={s.levelPct} height={7} from={C.gold} to={C.rose} />
          </div>
          <div style={{ fontSize: 11.5, color: C.inkSoft }}>
            Nivel {s.levelIndex} · <b>{s.level.name}</b>
          </div>
        </div>
        <div style={{
          width: 58, height: 58, borderRadius: "50%", flexShrink: 0,
          background: `conic-gradient(${C.red} ${s.levelPct * 3.6}deg, ${C.roseSoft} 0)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: C.card,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 800, color: C.red, lineHeight: 1 }}>
              {s.levelIndex}
            </span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 10.5, color: C.inkFaint, marginTop: 5, paddingRight: 4 }}>
        {s.xp} / {s.levelCap} XP {s.next ? `· faltan ${s.next.xp - s.xp} para "${s.next.name}"` : "· máximo 🏆"}
      </div>

      {/* Desafío en pareja */}
      <div style={{ ...S.card, marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span style={S.label}>Esta semana</span>
          <button onClick={() => setTab("tareas")} style={{
            border: "none", background: "transparent", color: C.roseDeep, fontSize: 11.5, fontWeight: 700,
          }}>Ver tareas</button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Desafío en pareja</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {["jb", "carolina"].map((who, i) => (
            <React.Fragment key={who}>
              {i === 1 && (
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: C.roseSoft,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Heart size={17} fill={C.rose} color={C.rose} />
                </div>
              )}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                  <Avatar person={who} size={44} me={me} />
                  {s.leader === who && (
                    <Crown size={15} fill={C.gold} color={C.gold} style={{ position: "absolute", top: -9, right: "26%" }} />
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: OWNERS[who].color }}>
                  {OWNERS[who].label}
                </div>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>
                  {s.weeklyXp[who]}
                </div>
                <div style={{ fontSize: 10, color: C.inkFaint }}>XP · {s.weekly[who]} tareas</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Drive */}
      {plan.driveUrl ? (
        <button onClick={() => window.open(plan.driveUrl, "_blank")} style={{
          ...S.card, width: "100%", marginTop: 12, display: "flex", alignItems: "center",
          gap: 10, background: C.greenSoft, border: "none", color: C.green, fontWeight: 700, fontSize: 14,
        }}>
          <FolderOpen size={17} /> Abrir nuestro Drive
        </button>
      ) : (
        <button onClick={() => setTab("nosotros")} style={{
          ...S.card, width: "100%", marginTop: 12, border: `1px dashed ${C.line}`,
          background: "transparent", color: C.inkFaint, fontSize: 13, fontWeight: 600,
        }}>
          + Conectar la carpeta de Drive
        </button>
      )}
    </div>
  );
}
