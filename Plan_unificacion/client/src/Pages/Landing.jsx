import React, { useEffect, useState } from "react";
import {
  Plane, Building2, Stamp, DollarSign, GraduationCap, Briefcase, Home, Folder,
} from "lucide-react";
import { C, S, tintFor } from "../theme.js";

export const ICONS = {
  plane: Plane, building: Building2, stamp: Stamp, dollar: DollarSign,
  school: GraduationCap, briefcase: Briefcase, home: Home, folder: Folder,
};

export function PhaseIcon({ phase, index = 0, size = 44 }) {
  const tint = tintFor(phase.id, index);
  const Icon = ICONS[phase.icon] || Folder;
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, background: tint.bg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={size * 0.45} color={tint.fg} strokeWidth={2} />
    </div>
  );
}

export function Bar({ pct, height = 6, from = C.rose, to = C.green, track = "#EFE4D8" }) {
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: 999,
        background: `linear-gradient(90deg, ${from}, ${to})`, transition: "width 420ms ease",
      }} />
    </div>
  );
}

export function Chip({ children, color, bg, onClick, style }) {
  return (
    <button onClick={onClick} disabled={!onClick} style={{
      ...S.chip, color, background: bg, cursor: onClick ? "pointer" : "default", ...style,
    }}>
      {children}
    </button>
  );
}

export function Route({ pct }) {
  return (
    <div style={{ position: "relative", padding: "6px 0 2px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 800, color: C.ink }}>MDE</div>
          <div style={{ fontSize: 9.5, letterSpacing: "0.1em", color: C.inkFaint, fontWeight: 700 }}>MEDELLÍN</div>
        </div>
        <div style={{ flex: 1, position: "relative", height: 34, margin: "4px 12px 0" }}>
          <svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
            <path d="M2,26 C50,4 110,34 198,8" fill="none" stroke={C.rose} strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" />
          </svg>
          <div style={{
            position: "absolute", left: `calc(${Math.min(97, Math.max(2, pct))}% - 9px)`, top: 2,
            transition: "left 500ms ease",
          }}>
            <Plane size={18} color={C.roseDeep} fill={C.roseDeep} style={{ transform: "rotate(42deg)" }} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 800, color: C.ink }}>SAT</div>
          <div style={{ fontSize: 9.5, letterSpacing: "0.1em", color: C.inkFaint, fontWeight: 700 }}>SAN ANTONIO</div>
        </div>
      </div>
    </div>
  );
}

export function Confetti({ burst }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!burst) return;
    const colors = [C.gold, C.rose, C.green, C.roseDeep, C.violet];
    const n = burst === "big" ? 70 : 30;
    setPieces(Array.from({ length: n }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      dur: 1.7 + Math.random() * 1.3,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 6,
      rot: Math.random() * 360,
    })));
    const t = setTimeout(() => setPieces([]), 3400);
    return () => clearTimeout(t);
  }, [burst]);

  return (
    <>
      <style>{`@keyframes cf { 0%{transform:translateY(-12vh) rotate(0);opacity:1} 100%{transform:translateY(108vh) rotate(720deg);opacity:.15} }`}</style>
      {pieces.map((p) => (
        <span key={p.id} style={{
          position: "fixed", top: 0, left: `${p.left}vw`, width: p.size, height: p.size * 0.6,
          background: p.color, borderRadius: 2, zIndex: 900, pointerEvents: "none",
          transform: `rotate(${p.rot}deg)`, animation: `cf ${p.dur}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </>
  );
}

export function Toast({ text, big }) {
  if (!text) return null;
  return (
    <>
      <style>{`@keyframes tp { 0%{transform:translateX(-50%) scale(.75);opacity:0} 14%{transform:translateX(-50%) scale(1.04);opacity:1} 86%{opacity:1} 100%{opacity:0} }`}</style>
      <div style={{
        position: "fixed", top: 20, left: "50%", zIndex: 950,
        background: C.green, color: "#fff", borderRadius: 16,
        padding: big ? "16px 26px" : "12px 20px", fontSize: big ? 16 : 14,
        fontWeight: 800, boxShadow: "0 10px 32px rgba(23,69,60,.3)",
        maxWidth: "88vw", textAlign: "center",
        animation: `tp ${big ? 3.6 : 2.6}s ease forwards`,
      }}>
        {text}
      </div>
    </>
  );
}

export function Avatar({ person, size = 34, me }) {
  const initials = person === "carolina" ? "C" : "JB";
  const bg = person === "carolina" ? C.roseSoft : C.greenSoft;
  const fg = person === "carolina" ? C.roseDeep : C.green;
  if (me?.picture && me.person === person) {
    return <img src={me.picture} alt={initials} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.card}` }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 800, flexShrink: 0,
    }}>{initials}</div>
  );
}

export function Empty({ children }) {
  return <div style={{ fontSize: 13, color: C.inkFaint, padding: "14px 2px" }}>{children}</div>;
}
