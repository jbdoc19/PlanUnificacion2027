import { useState, useEffect, useRef, useCallback } from "react";

const json = async (res) => {
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

export const fetchMe = () => fetch("/api/me", { credentials: "include" }).then(json);
export const fetchPlan = () => fetch("/api/plan", { credentials: "include" }).then(json);
export const pushPlan = (plan) =>
  fetch("/api/plan", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan),
  }).then(json);

/**
 * Estado del plan compartido.
 * Escribe optimista (la UI responde ya), guarda con debounce,
 * y consulta cada 12 s para traer los cambios del otro.
 */
export function usePlan(authenticated) {
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const dirty = useRef(false);
  const timer = useRef(null);
  const planRef = useRef(null);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  // Carga inicial
  useEffect(() => {
    if (!authenticated) return;
    fetchPlan()
      .then(setPlan)
      .catch(() => setStatus("error"));
  }, [authenticated]);

  // Sondeo: solo cuando no hay cambios locales sin guardar
  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(async () => {
      if (dirty.current || document.hidden) return;
      try {
        const fresh = await fetchPlan();
        if (!planRef.current || fresh.updatedAt !== planRef.current.updatedAt) setPlan(fresh);
      } catch (e) {
        /* silencioso */
      }
    }, 12000);
    return () => clearInterval(id);
  }, [authenticated]);

  const update = useCallback((mutator) => {
    setPlan((prev) => {
      if (!prev) return prev;
      const next = typeof mutator === "function" ? mutator(prev) : mutator;
      dirty.current = true;
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          const saved = await pushPlan(planRef.current);
          dirty.current = false;
          setStatus("saved");
          setPlan((cur) => ({ ...cur, updatedAt: saved.updatedAt }));
          setTimeout(() => setStatus("idle"), 1400);
        } catch (e) {
          setStatus("error");
        }
      }, 700);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      setPlan(await fetchPlan());
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    } catch (e) {
      setStatus("error");
    }
  }, []);

  return { plan, setPlan, update, status, refresh };
}
