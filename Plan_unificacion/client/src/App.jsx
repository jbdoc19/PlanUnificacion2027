import React, { useState, useEffect, useCallback } from "react";
import { C } from "./theme.js";
import { fetchMe, usePlan } from "./api.js";
import { DICHOS } from "./theme.js";
import { dueSoonCount } from "./logic.js";
import Nav from "./components/Nav.jsx";
import { Confetti, Toast } from "./components/UI.jsx";
import Landing from "./pages/Landing.jsx";
import Inicio from "./pages/Inicio.jsx";
import Tareas from "./pages/Tareas.js";
import TaskDetail from "./pages/TaskDetail.jsx";
import Documentos from "./pages/Documentos.jsx";
import Mensajes from "./pages/Mensajes.jsx";
import Nosotros from "./pages/Nosotros.jsx";

export default function App() {
  const [me, setMe] = useState(null); // null = cargando
  const [lang, setLang] = useState("es");
  const [tab, setTab] = useState("inicio");
  const [openTaskId, setOpenTaskId] = useState(null);
  const [quickMode, setQuickMode] = useState(false);
  const [burst, setBurst] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe({ authenticated: false }));
  }, []);

  const { plan, update, status, refresh } = usePlan(!!me?.authenticated);

  const celebrate = useCallback((size) => {
    setBurst(`${size}-${Date.now()}`);
    setToast(size === "big"
      ? { text: "¡FASE COMPLETA! 🏆 Qué equipo tan berraco", big: true }
      : { text: DICHOS[Math.floor(Math.random() * DICHOS.length)], big: false });
    setTimeout(() => setToast(null), size === "big" ? 3600 : 2600);
    setTimeout(() => setBurst(null), 3600);
  }, []);

  if (me === null) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.inkFaint }}>
        Cargando…
      </div>
    );
  }

  if (!me.authenticated) {
    return (
      <Landing
        lang={lang}
        setLang={setLang}
        onSuccess={(person) => setMe({ authenticated: true, person })}
      />
    );
  }

  if (!plan) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.inkFaint }}>
        Cargando el plan…
      </div>
    );
  }

  const openTask = (task) => setOpenTaskId(task.id);
  const current = openTaskId ? plan.tasks.find((t) => t.id === openTaskId) : null;

  const shared = { plan, me, update, openTask, setTab, celebrate };

  return (
    <div style={{ minHeight: "100%", background: C.cream }}>
      <Confetti burst={burst ? (burst.startsWith("big") ? "big" : "small") : null} />
      <Toast text={toast?.text} big={toast?.big} />

      {current ? (
        <TaskDetail {...shared} task={current} close={() => setOpenTaskId(null)} />
      ) : (
        <>
          <div style={{ paddingBottom: 96 }}>
            {tab === "inicio" && (
              <Inicio {...shared} quickMode={quickMode} setQuickMode={setQuickMode} />
            )}
            {tab === "tareas" && <Tareas {...shared} />}
            {tab === "documentos" && <Documentos plan={plan} update={update} celebrate={celebrate} />}
            {tab === "mensajes" && <Mensajes {...shared} />}
            {tab === "nosotros" && (
              <Nosotros plan={plan} me={me} update={update} refresh={refresh} status={status} />
            )}
          </div>
          <Nav tab={tab} setTab={setTab} badge={dueSoonCount(plan, me.person)} />
        </>
      )}
    </div>
  );
}
