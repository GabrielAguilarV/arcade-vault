# 01 — MVP visual Arcade Vault

**Estado:** aprovado
**Dependencias:** Ninguna (primer spec del proyecto)
**Fecha:** 2026-07-20

## Objetivo

Implementar en Next.js App Router (TypeScript + Tailwind v4) las 5 pantallas visuales del template de referencia (`references/templates/`) — Biblioteca, Detalle, Reproductor, Salón de la Fama y Auth — con datos mock estáticos, navegación real entre rutas y persistencia ligera en localStorage, sin implementar lógica de juego real ni backend.

## Alcance

### Incluye

- **5 pantallas** migradas del template a rutas reales de Next.js App Router:
  - `/` — Biblioteca (catálogo con buscador, filtro por categoría y tarjetas con tilt 3D)
  - `/juegos/[id]` — Detalle del juego (info, tags, leaderboard lateral, botón "jugar ahora")
  - `/juegos/[id]/jugar` — Reproductor (mockup estático: HUD, área CRT, modal de fin de partida)
  - `/ranking` — Salón de la Fama (tabs por juego, podio top 3, tabla de puntuaciones)
  - `/login` — Auth (login / registro / invitado)
- **Nav global** (logo, links, contador de créditos decorativo, botón de sesión, menú móvil hamburguesa) y **footer** fijo, replicados del template.
- **Datos mock estáticos** tipados en TypeScript: catálogo `GAMES`, lista `PLAYERS`, categorías `CATS` y función determinística `seededScores`, migrados 1:1 desde `data.jsx`.
- **Sesión simulada** vía localStorage (`av_user`): login/registro/invitado escriben el usuario; el Nav refleja el estado conectado/desconectado; "cerrar sesión" limpia el storage.
- **Guardado de puntuación simulado** vía localStorage (`av_scores`) desde el modal de fin de partida del Reproductor, aunque no haya una partida real detrás.
- **Tema visual completo** migrado a tokens Tailwind v4 (`@theme` en `globals.css`): paleta neón (cyan/magenta/yellow/green/gold), grid de fondo animado, scanlines, efectos de vidrio/CRT, animaciones (`flicker`, `blink`, `pulse`, etc.).
- **Portadas de juego** como fondos CSS (gradientes/patrones por categoría), sin imágenes reales ni `next/image`.
- Arquitectura de **Server Components por defecto**, con `'use client'` solo en las islas interactivas: Nav (menú móvil + estado de sesión), buscador/filtros de Biblioteca, tilt de `GameCard`, tabs de Salón de la Fama, formulario de Auth, HUD/modal del Reproductor.

### No incluye

- **Ningún juego real ni motor de juego.** El área de juego del Reproductor es un mockup visual estático (HUD con valores fijos, sin temporizador ni pausa funcional real); no hay canvas, física, ni bucle de juego.
- **Backend ni base de datos.** No hay API routes, no hay servidor de autenticación real, no hay validación de credenciales — todo es local (localStorage) y mock.
- **Autenticación real** (OAuth con Google/GitHub, hashing de contraseñas, verificación de email). Los botones sociales del template se muestran solo como decoración visual, sin funcionalidad.
- **Protección de rutas.** Ninguna pantalla requiere sesión iniciada; el Reproductor y el Ranking son accesibles como invitado, igual que el template.
- **Persistencia real entre dispositivos/usuarios** ni sincronización — todo vive en el localStorage del navegador.
- **Tests automatizados** — no hay test runner configurado en el proyecto todavía; este spec no lo introduce.
- **Imágenes/assets reales de portada** — se difiere a un spec futuro si se decide reemplazar los fondos CSS.

## Modelo de datos

Toda la data es estática/mock, sin backend. Vive en dos módulos nuevos:

### `lib/data.ts` — catálogo y utilidades de puntuación

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export type Game = {
  id: string;          // slug, ej. "bloque-buster"
  title: string;
  short: string;       // descripción corta (card de biblioteca)
  long: string;        // descripción larga (detalle)
  cat: GameCategory;
  cover: string;       // clase CSS del fondo, ej. "cover-bricks"
  color: GameColor;
  best: number;        // mejor puntuación global (mock)
  plays: string;       // texto ya formateado, ej. "12.4K"
};

export const GAMES: Game[];                 // 8 juegos, migrados 1:1 de data.jsx
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export const PLAYERS: readonly string[];     // 18 nombres, migrados 1:1 de data.jsx

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string;        // "dd/mm/yyyy"
};

export function seededScores(seed: number, count?: number): ScoreRow[];
// función determinística (mismo algoritmo pseudo-random del template),
// usada por /juegos/[id] y /ranking para generar leaderboards reproducibles
```

### `lib/session.ts` — sesión y puntuaciones guardadas (localStorage)

```ts
export type SessionUser = { name: string };

export type SavedScoreEntry = {
  game: string;   // Game.id
  score: number;
  name: string;
  at: number;     // Date.now()
};

// claves de localStorage: "av_user" y "av_scores"
export function getSessionUser(): SessionUser | null;
export function setSessionUser(user: SessionUser | null): void;
export function clearSessionUser(): void;

export function saveScore(entry: Omit<SavedScoreEntry, "at">): void;
export function getSavedScores(): SavedScoreEntry[];
```

No se introducen otras estructuras: sin API routes, sin esquema de base de datos, sin tipos de request/response.

## Plan de implementación

1. **Tema base y efectos globales.** Extender `app/globals.css` con los tokens `@theme` (paleta neón cyan/magenta/yellow/green/gold, `--line`, etc.) y las clases globales de fondo (grid animado, scanlines, viñeta) migradas de `styles.css`, manteniendo las fuentes Geist ya cargadas en `app/layout.tsx`. El scaffold sigue arrancando y compilando igual que antes, solo con el tema disponible.

2. **Capa de datos mock.** Crear `lib/data.ts` (tipos `Game`/`ScoreRow`, `GAMES`, `CATS`, `PLAYERS`, `seededScores`) y `lib/session.ts` (`SessionUser`, `SavedScoreEntry`, helpers de `localStorage` para `av_user` y `av_scores`), migrados 1:1 desde `data.jsx` y la lógica de `app.jsx`. No hay UI nueva todavía; el build sigue pasando.

3. **Nav global y layout.** Implementar `components/Nav.tsx` (`'use client'`: menú móvil, contador de créditos decorativo, estado de sesión leído/escrito vía `lib/session.ts`) y actualizar `app/layout.tsx` para renderizar `Nav` + footer fijo en todas las rutas. La app sigue teniendo solo la página `/` por defecto del scaffold, pero ya con el chrome completo.

4. **Biblioteca (`/`).** Reemplazar `app/page.tsx` (Server Component) con el hero, buscador y grid de juegos. Extraer la interactividad a `components/LibraryFilters.tsx` (buscador + chips de categoría, `'use client'`) y `components/GameCard.tsx` (`'use client'`, con el efecto tilt 3D), consumiendo `GAMES`/`CATS` de `lib/data.ts`. Al terminar este paso, `/` es funcional y navegable visualmente.

5. **Detalle (`/juegos/[id]`).** Crear `app/juegos/[id]/page.tsx` (Server Component): busca el juego por `id` en `GAMES` (`notFound()` si no existe), muestra portada, tags, descripción, stats y leaderboard lateral vía `seededScores`, con botones "Jugar ahora" (link a `/juegos/[id]/jugar`) y "Volver al Vault".

6. **Reproductor (`/juegos/[id]/jugar`).** Crear `app/juegos/[id]/jugar/page.tsx` (`'use client'`, mockup estático): HUD con valores fijos de ejemplo, área CRT sin bucle de juego real, botones "Pausa"/"Fin" que solo cambian estado visual local, y modal de fin de partida con input de iniciales + botón "Guardar puntuación" que persiste vía `lib/session.ts` (`saveScore`).

7. **Salón de la Fama (`/ranking`).** Crear `app/ranking/page.tsx` con tabs por juego (`'use client'` para el cambio de tab), podio top 3 y tabla de puntuaciones vía `seededScores`, más la fila "tu mejor marca" cuando `getSessionUser()` devuelve un usuario.

8. **Auth (`/login`).** Crear `app/login/page.tsx` (`'use client'`): tabs de login/registro, formulario controlado, botón "Jugar como invitado" y botones sociales decorativos (sin funcionalidad). Al enviar, escribe en `lib/session.ts` (`setSessionUser`) y redirige a `/`.

9. **Verificación final.** Revisar responsive/mobile en las 5 rutas, correr `npm run lint` y `npm run build`, y navegar manualmente cada pantalla en `npm run dev` comparando contra `references/templates/` para detectar diferencias visuales.

## Criterios de aceptación

- [ ] `/` renderiza el hero, el buscador, los chips de categoría y el grid de `GameCard` con los 8 juegos de `GAMES`; filtrar por texto y por categoría actualiza el grid sin recargar la página.
- [ ] Cada `GameCard` aplica el efecto de inclinación 3D al mover el mouse encima y vuelve a su estado normal al salir.
- [ ] `/juegos/[id]` muestra la portada, tags, descripción larga, stats (partidas, mejor global, dificultad) y el leaderboard lateral con 10 filas generadas por `seededScores`; un `id` inexistente dispara `notFound()`.
- [ ] Desde `/juegos/[id]`, el botón "Jugar ahora" navega a `/juegos/[id]/jugar` y "Volver al Vault" navega a `/`.
- [ ] `/juegos/[id]/jugar` muestra el HUD (jugador, puntuación, vidas, nivel) con valores fijos, el área CRT sin ningún bucle de juego activo, y el botón "Pausa" alterna un overlay visual "EN PAUSA" sin afectar ningún temporizador real.
- [ ] Al pulsar "Fin" en el reproductor se abre el modal de fin de partida con una puntuación fija; ingresar iniciales y pulsar "Guardar puntuación" persiste un registro en `localStorage` (`av_scores`) vía `lib/session.ts` y cambia el modal al estado "PUNTUACIÓN GUARDADA_".
- [ ] `/ranking` muestra los tabs por juego, el podio (top 3) y la tabla completa de puntuaciones para el juego seleccionado, generados por `seededScores`; cambiar de tab actualiza podio y tabla.
- [ ] Si hay una sesión activa (`av_user` en `localStorage`), `/ranking` muestra la fila adicional "tu mejor marca"; si no hay sesión, esa fila no aparece.
- [ ] `/login` permite alternar entre las pestañas "Iniciar sesión" y "Crear cuenta", enviar el formulario o pulsar "Jugar como invitado" escribe la sesión en `localStorage` (`av_user`) y redirige a `/`.
- [ ] Con sesión activa, el `Nav` muestra el nombre de usuario en vez del botón "Iniciar sesión"; cerrar sesión limpia `av_user` y el `Nav` vuelve a mostrar "Iniciar sesión".
- [ ] El menú móvil (hamburguesa) del `Nav` abre y cierra el panel lateral con los mismos links que la versión de escritorio.
- [ ] Ninguna de las 5 rutas requiere sesión iniciada para ser accesible.
- [ ] `npm run lint` y `npm run build` (Turbopack) terminan sin errores.
- [ ] La paleta de colores, el grid de fondo animado, las scanlines y las animaciones (`flicker`, `blink`, `pulse`) están presentes en todas las pantallas, migradas como tokens/utilities de Tailwind v4.

## Decisiones tomadas y descartadas

- **Rutas reales de Next.js App Router** (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/ranking`, `/login`) en vez de replicar el hash-routing SPA (`location.hash` + `App.jsx`) del template. *Descartado:* mantener el enrutamiento por hash — no es idiomático en App Router y complica el uso de Server Components y `notFound()`.

- **Reproductor como mockup 100% estático** (HUD con valores fijos, sin temporizador ni pausa funcional real) en vez de replicar la simulación interactiva completa del template (score subiendo cada 220ms, niveles, pausa real). *Razón:* el spec es explícito en que no se implementa ningún juego; un bucle de puntuación automático ya cruza esa línea aunque no sea "un juego real". *Descartado:* mantener la simulación completa, y también la opción de un placeholder "PRÓXIMAMENTE" sin HUD — se prefirió conservar el HUD visual completo por fidelidad al diseño.

- **Sesión simulada con `localStorage`** (`av_user`) en vez de una pantalla de Auth puramente decorativa sin estado. *Razón:* el estado de sesión afecta visualmente al `Nav` (nombre de usuario vs. botón "Iniciar sesión"), que es parte central del "look" del MVP.

- **Persistencia real de puntuaciones guardadas** (`av_scores` en `localStorage`) desde el modal de fin de partida, aunque el reproductor sea un mockup sin juego real. *Razón:* decisión explícita del usuario — se prioriza fidelidad al comportamiento del template sobre la consistencia estricta con "solo visual".

- **Datos mock reutilizados 1:1** desde `data.jsx` (catálogo `GAMES`, `PLAYERS`, `seededScores`), solo tipados en TypeScript. *Descartado:* generar un catálogo o generador de puntuaciones distinto — no aporta valor en un MVP puramente visual.

- **Fuentes pixel-art del template** ("Press Start 2P" + "JetBrains Mono", con "Courier Prime" como fallback mono) cargadas vía `next/font/google` en `app/layout.tsx`, sustituyendo a Geist/Geist Mono del scaffold. *Descartado:* mantener Geist/Geist Mono — se prefirió fidelidad visual completa al template sobre no tocar la configuración de fuentes existente. *(Corregido post-hoc: esta decisión ya estaba implementada en el commit `04765fb` antes de iniciar `/spec-impl`; el spec originalmente documentaba lo contrario por error.)*

- **CSS del template traducido a tokens Tailwind v4 (`@theme` en `globals.css`)** en vez de importar `styles.css` casi tal cual como hoja global adicional. *Razón:* sigue la convención ya establecida en el proyecto (Tailwind v4 sin `tailwind.config.js`, tokens vía `@theme inline`) documentada en `CLAUDE.md`.

- **Server Components por defecto, `'use client'` solo en islas interactivas** (Nav, filtros de Biblioteca, tilt de `GameCard`, tabs de Ranking, formulario de Auth, HUD del Reproductor). *Descartado:* marcar toda la app como Client Components — sería más fiel al modelo SPA original pero renuncia a las ventajas de Server Components que ofrece Next 16 App Router.

- **Sin protección de rutas.** Todas las pantallas son accesibles sin sesión iniciada, igual que el template (el Reproductor usa "INVITADO" por defecto). *Descartado:* añadir un gate de autenticación a `/ranking` o `/juegos/[id]/jugar` — ampliaría el alcance sin que el usuario lo pidiera.

- **Portadas de juego como fondos CSS** (gradientes/patrones por categoría) en vez de imágenes reales. *Razón:* evita introducir assets y mantiene fidelidad exacta al template, que tampoco usa imágenes.

- **Sin tests automatizados.** No se introduce ningún test runner en este spec — el proyecto no tiene uno configurado y no se pidió agregarlo.
