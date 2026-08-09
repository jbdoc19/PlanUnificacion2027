# Plan de Unificación — Nuestro reinicio

App web compartida para JB y Carolina. MDE → SAT.
React + Express + Replit Auth + Replit Database. Funciona igual en Android y iPhone.

---

## Puesta en marcha (una sola vez, ~15 minutos)

### 1. Crear el proyecto en Replit
1. Entrá a replit.com → **Create App** → **Import from folder** (o creá un Node.js Repl vacío)
2. Subí todos los archivos de esta carpeta, respetando la estructura
3. Replit detecta el `.replit` y usa Node 20

### 2. Instalar
En el Shell del proyecto:
```bash
npm install
```

### 3. Poner las claves
En **Tools → Secrets**, agregá estas cuatro:

| Clave | Valor |
|---|---|
| `JB_CODE` | la clave que vas a usar vos |
| `CAROLINA_CODE` | la clave de Carolina |
| `SESSION_SECRET` | cualquier texto largo y aleatorio |

Sin cuentas, sin correos: la clave dice quién es quién. Si entrás con `JB_CODE`, la app te firma como JB; con `CAROLINA_CODE`, como Carolina.

Si no ponés los Secrets, funciona con las claves de prueba `jb2026` y `cami2026`. Cambialas antes de publicar.

### 4. Probar
Botón **Run**. En la vista previa, escribí tu clave y entrá.

### 5. Publicar
Botón **Deploy** → Autoscale. Replit devuelve una URL `.replit.app`.

### 6. Instalar en los dos teléfonos
- **Android (vos):** abrí la URL en Chrome → menú ⋮ → *Agregar a pantalla principal*
- **iPhone (Carolina):** abrí la URL en Safari → botón Compartir → *Añadir a pantalla de inicio*

Queda con ícono propio y se abre en pantalla completa, como una app nativa.
Pineá la misma URL en el chat de WhatsApp como ya lo venían haciendo.

---

## Cómo está armado

```
server/
  index.js         Express: API + sirve el cliente compilado
  auth.js          Entrada con clave personal (sin cuentas)
  storage.js       Un solo documento compartido en Replit DB + datos iniciales
client/src/
  App.jsx          Rutas, sesión, confeti y toasts
  theme.js         Paleta, tipografías, chips (crema, verde profundo, rosa)
  api.js           Carga, guardado con debounce y sondeo cada 12 s
  logic.js         Progreso, XP, niveles, marcador semanal, próxima acción
  pages/           Landing · Inicio · Tareas · TaskDetail · Documentos · Mensajes · Nosotros
  components/      Nav (5 pestañas), UI (ruta del vuelo, barras, confeti, avatares)
```

**Sincronización:** los dos escriben sobre el mismo documento. Los cambios se guardan solos ~0.7 s después de tocar algo, y cada teléfono consulta el servidor cada 12 segundos. El botón *Actualizar* en Nosotros fuerza la consulta.

---

## Qué trae adentro

- **38 tareas** en 7 categorías, auditadas contra el plan real: etapa NVC completa, permisos de salida separados por papá, discrepancia del pasaporte de Martina, fecha de boda vs. entrada, y la categoría Finanzas
- **Subtareas** dentro de cada tarea, con contador
- **Categorías propias**: botón "Agregar categoría" al final de Tareas
- **Bóveda de 10 documentos** con etapas pendiente → obtenido → apostillado → traducido → en Drive, cada uno con su link
- **Modo TDAH**: tarjeta de "Tu próxima acción" arriba de todo, atajo "¿Solo tenés 5 minutos?", y estimado de esfuerzo por tarea
- **Juego**: vuelo MDE→SAT, niveles de XP, desafío semanal en pareja, confeti con dichos paisas, cartas que se abren al 20/40/60/80/100%
- **Notas firmadas** con autor y hora, y un feed unificado en Mensajes
- **Registro de visitas** detrás del botón "· · ·" en Nosotros
- **Recordatorios** al calendario del teléfono desde cualquier tarea con fecha

---

## Notas técnicas

- La sesión dura un año y vive en una cookie: cada teléfono escribe la clave una sola vez. Si Replit reinicia el servidor puede pedirla de nuevo; el plan **no** se pierde porque vive en Replit DB.
- Para empezar de cero: `POST /api/plan/reset` (conserva la fecha de la boda, el link de Drive y el registro de visitas).
- Notificaciones push reales quedan pendientes; hoy el recordatorio pasa por Google Calendar y por la tarjeta de próxima acción al abrir la app.

---

Las fechas y el estimado de reunificación son propuestas de planeación. Los trámites migratorios, tarifas y tiempos cambian; confirmá cualquier fecha crítica con el abogado o en uscis.gov antes de actuar.