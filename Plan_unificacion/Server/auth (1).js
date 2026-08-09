// ------------------------------------------------------------------
// Entrada con clave personal. Sin cuentas, sin correos.
// Cada quien tiene su propia clave: la clave dice quién sos.
// ------------------------------------------------------------------
import session from "express-session";
import MemoryStoreFactory from "memorystore";

const MemoryStore = MemoryStoreFactory(session);
const YEAR = 365 * 24 * 60 * 60 * 1000;

// Claves por defecto para poder probar antes de configurar los Secrets.
const CODES = () => ({
  jb: (process.env.JB_CODE || "jb2026").trim().toLowerCase(),
  carolina: (process.env.CAROLINA_CODE || "cami2026").trim().toLowerCase(),
});

export async function setupAuth(app) {
  app.set("trust proxy", 1);

  app.use(
    session({
      name: "unificacion.sid",
      secret: process.env.SESSION_SECRET || "cambia-esto-en-secrets",
      store: new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: YEAR, // un año: entran una sola vez por teléfono
        sameSite: "lax",
      },
    })
  );

  // Entrar con la clave
  app.post("/api/login", (req, res) => {
    const code = String(req.body?.code || "").trim().toLowerCase();
    const codes = CODES();

    let person = null;
    if (code && code === codes.jb) person = "jb";
    else if (code && code === codes.carolina) person = "carolina";

    if (!person) {
      return res.status(401).json({ ok: false, error: "clave-incorrecta" });
    }

    req.session.person = person;
    req.session.save(() => res.json({ ok: true, person }));
  });

  // Salir
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("unificacion.sid");
      res.json({ ok: true });
    });
  });
}

export function requireAuth(req, res, next) {
  if (req.session?.person) return next();
  return res.status(401).json({ error: "no-autenticado" });
}

export function personFor(req) {
  return req.session?.person || "jb";
}
