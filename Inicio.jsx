import React from "react";
import { Home, ClipboardList, FileText, MessageCircle, Heart } from "lucide-react";
import { C } from "../theme.js";

const TABS = [
  { id: "inicio", label: "Inicio", Icon: Home },
  { id: "tareas", label: "Tareas", Icon: ClipboardList },
  { id: "documentos", label: "Documentos", Icon: FileText },
  { id: "mensajes", label: "Mensajes", Icon: MessageCircle },
  { id: "nosotros", label: "Nosotros", Icon: Heart },
];

export default function Nav({ tab, setTab, badge = 0 }) {
  return (
    <nav style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 500,
      background: "rgba(250,243,236,0.94)", backdropFilter: "blur(14px)",
      borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex" }}>
        {TABS.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, border: "none", background: "transparent",
              padding: "10px 2px 12px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4, position: "relative",
            }}>
              <div style={{ position: "relative" }}>
                <Icon size={20} color={on ? C.red : C.inkFaint} strokeWidth={on ? 2.4 : 1.8}
                  fill={on && id === "nosotros" ? C.red : "none"} />
                {id === "tareas" && badge > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -7, minWidth: 15, height: 15,
                    borderRadius: 999, background: C.red, color: "#fff", fontSize: 9.5,
                    fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                  }}>{badge}</span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: on ? 800 : 600, color: on ? C.red : C.inkFaint }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
