export type SessionUser = { name: string };

export type SavedScoreEntry = {
  game: string;
  score: number;
  name: string;
  at: number;
};

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";
const SESSION_EVENT = "av-session-changed";

// Cachea el snapshot para que getSessionUser devuelva la misma referencia
// mientras el valor crudo en localStorage no cambie. Es imprescindible para
// useSyncExternalStore: si cada llamada devolviera un objeto nuevo (por el
// JSON.parse), React vería "cambios" en cada render y entraría en loop.
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function setSessionUser(user: SessionUser | null): void {
  if (typeof window === "undefined") return;
  if (user === null) {
    window.localStorage.removeItem(USER_KEY);
  } else {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}

// Para uso con useSyncExternalStore: notifica cambios de sesión tanto en la
// misma pestaña (evento propio) como entre pestañas (evento "storage").
export function subscribeSessionUser(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === USER_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

export function clearSessionUser(): void {
  setSessionUser(null);
}

export function saveScore(entry: Omit<SavedScoreEntry, "at">): void {
  if (typeof window === "undefined") return;
  try {
    const all = getSavedScores();
    all.push({ ...entry, at: Date.now() });
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // localStorage no disponible o cuota excedida: se ignora, es persistencia mock.
  }
}

export function getSavedScores(): SavedScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SCORES_KEY) || "[]");
  } catch {
    return [];
  }
}
