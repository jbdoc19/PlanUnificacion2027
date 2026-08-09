import React, { useState } from "react";
import { Plus, X, FileText, FolderOpen, Link2, Trash2, ShieldCheck } from "lucide-react";
import { C, S, STAGES } from "../theme.js";
import { Bar, Chip, Empty } from "../components/UI.jsx";

export default function Documentos({ plan, update, celebrate }) {
  const [tab, setTab] = useState("mios");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [linkFor, setLinkFor] = useState(null);
  const [linkText, setLinkText] = useState("");

  const docs = plan.docs || [];
  const done = docs.filter((d) => d.stage === "drive").length;
  const pct = docs.length ? Math.round((done / docs.length) * 100) : 0;

  const shown = tab === "mios" ? docs : docs.filter((d) => d.link);

  const cycleStage = (doc) => {
    const i = STAGES.findIndex((s) => s.id === doc.stage);
    const next = STAGES[(i + 1) % STAGES.length].id;
    update((p) => ({ ...p, docs: p.docs.map((d) => (d.id === doc.id ? { ...d, stage: next } : d)) }));
    if (next === "drive") celebrate("small");
  };

  const saveLink = (id) => {
    update((p) => ({ ...p, docs: p.docs.map((d) => (d.id === id ? { ...d, link: linkText.trim() } : d)) }));
    setLinkFor(null);
    setLinkText("");
  };

  const addDoc = () => {
    if (!name.trim()) return;
    update((p) => ({ ...p, docs: [...p.docs, { id: `d-${Date.now()}`, name: name.trim(), stage: "pendiente", link: "" }] }));
    setName("");
    setAdding(false);
  };

  return (
    <div style={S.wrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 14px" }}>
        <h1 style={S.h1}>Documentos</h1>
        <button onClick={() => setAdding(true)} style={{
          width: 34, height: 34, borderRadius: "50%", border: "none", background: C.rose,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Plus size={18} color="#fff" strokeWidth={2.6} />
        </button>
      </div>

      <div style={{ display: "flex", background: C.card, borderRadius: 999, padding: 4, marginBottom: 14, border: `1px solid ${C.line}` }}>
        {[["mios", "Todos"], ["drive", "Con link"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, border: "none", borderRadius: 999, padding: "9px 6px", fontSize: 12.5, fontWeight: 700,
            background: tab === k ? C.roseSoft : "transparent",
            color: tab === k ? C.roseDeep : C.inkSoft,
          }}>{label}</button>
        ))}
      </div>

      {/* Resumen */}
      <div style={{ ...S.card, marginBottom: 16, display: "flex", gap: 13, alignItems: "center" }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, background: C.roseSoft, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ShieldCheck size={20} color={C.roseDeep} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Los {docs.length} documentos clave</div>
          <div style={{ fontSize: 11.5, color: C.inkFaint, margin: "3px 0 8px" }}>
            Cada uno avanza hasta llegar a Drive · {done} listos
          </div>
          <Bar pct={pct} height={5} />
        </div>
      </div>

      {plan.driveUrl && (
        <button onClick={() => window.open(plan.driveUrl, "_blank")} style={{
          width: "100%", marginBottom: 14, border: "none", background: C.greenSoft, color: C.green,
          borderRadius: 16, padding: 13, fontSize: 13.5, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <FolderOpen size={16} /> Abrir la carpeta compartida
        </button>
      )}

      {adding && (
        <div style={{ ...S.card, marginBottom: 12 }}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDoc()}
            placeholder="Nombre del documento…" style={S.input} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button onClick={() => setAdding(false)} style={{ border: "none", background: "transparent", color: C.inkFaint }}>
              <X size={16} />
            </button>
            <button onClick={addDoc} style={{ ...S.btn, padding: "9px 18px", fontSize: 13.5 }}>Agregar</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", ...S.label, marginBottom: 8, padding: "0 4px" }}>
        <span>Documento</span>
        <span>Estado · Drive</span>
      </div>

      {shown.length === 0 && <Empty>Nada aquí todavía.</Empty>}

      {shown.map((doc) => {
        const stage = STAGES.find((s) => s.id === doc.stage) || STAGES[0];
        return (
          <div key={doc.id} style={{ ...S.card, padding: 13, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={16} color={C.inkFaint} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{doc.name}</span>
              <Chip color={stage.color} bg={stage.bg} onClick={() => cycleStage(doc)}>{stage.label}</Chip>
              {doc.link ? (
                <button onClick={() => window.open(doc.link, "_blank")} style={{
                  border: "none", background: C.greenSoft, borderRadius: 9, padding: 6, flexShrink: 0,
                }}>
                  <FolderOpen size={14} color={C.green} />
                </button>
              ) : (
                <button onClick={() => { setLinkFor(doc.id); setLinkText(""); }} style={{
                  border: "none", background: C.creamDeep, borderRadius: 9, padding: 6, flexShrink: 0,
                }}>
                  <Link2 size={14} color={C.inkFaint} />
                </button>
              )}
            </div>

            {linkFor === doc.id && (
              <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                <input autoFocus value={linkText} onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveLink(doc.id)}
                  placeholder="Pegá el link del archivo en Drive…" style={{ ...S.input, fontSize: 12.5 }} />
                <button onClick={() => saveLink(doc.id)} style={{ ...S.btn, padding: "0 15px", fontSize: 13 }}>OK</button>
                <button onClick={() => update((p) => ({ ...p, docs: p.docs.filter((d) => d.id !== doc.id) }))}
                  style={{ border: "none", background: "transparent", padding: 6 }}>
                  <Trash2 size={14} color={C.red} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
