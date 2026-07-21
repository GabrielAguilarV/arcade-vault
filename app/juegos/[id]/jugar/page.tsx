"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { GAMES } from "@/lib/data";
import { getSessionUser, saveScore } from "@/lib/session";

// HUD estático: no hay bucle de juego real, la puntuación es un valor de
// ejemplo fijo (ver decisiones del spec 01-mvp-visual: "Reproductor como
// mockup 100% estático").
const FIXED_SCORE = 47280;
const FIXED_LIVES = 3;
const FIXED_LEVEL = 1;

export default function GamePlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [name, setName] = useState(() => getSessionUser()?.name ?? "INVITADO");
  const [saved, setSaved] = useState(false);

  const restart = () => {
    setPaused(false);
    setOver(false);
    setSaved(false);
  };

  const handleSaveScore = () => {
    saveScore({ game: game.id, score: FIXED_SCORE, name });
    setSaved(true);
  };

  return (
    <main className="av-main">
      <div className="av-player fade-in">
        <div className="player-hud">
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div className="hud-stat">
              <div className="l">Jugador</div>
              <div className="v" style={{ color: "var(--ink)" }}>
                {name}
              </div>
            </div>
            <div className="hud-stat">
              <div className="l">Puntuación</div>
              <div className="v">{FIXED_SCORE.toLocaleString("es-ES")}</div>
            </div>
            <div className="hud-stat lives">
              <div className="l">Vidas</div>
              <div className="v">{"♥ ".repeat(FIXED_LIVES).trim()}</div>
            </div>
            <div className="hud-stat level">
              <div className="l">Nivel</div>
              <div className="v">{String(FIXED_LEVEL).padStart(2, "0")}</div>
            </div>
          </div>
          <div className="hud-actions">
            <button className="btn yellow" onClick={() => setPaused((p) => !p)}>
              {paused ? "REANUDAR" : "PAUSA"}
            </button>
            <button className="btn magenta" onClick={() => setOver(true)}>
              FIN
            </button>
            <button className="btn ghost" onClick={() => router.push(`/juegos/${game.id}`)}>
              SALIR
            </button>
          </div>
        </div>

        <div className="crt">
          <div className="crt-screen">
            <div className="game-arena">
              <div className="grid-floor" />
              <div className="enemy e1" />
              <div className="enemy e2" />
              <div className="enemy e3" />
              <div className="player-ship" />
            </div>
            {paused && (
              <div className="crt-content" style={{ background: "rgba(0,0,0,0.6)", zIndex: 5 }}>
                <div>
                  <div className="pixel neon-yellow" style={{ fontSize: 22 }}>
                    EN PAUSA
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 10, letterSpacing: "0.16em" }}
                  >
                    PULSA REANUDAR PARA CONTINUAR
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="crt-bottom">
            <span className="led">SEÑAL OK</span>
            <span>
              {game.title} · CRT-83 · 60 HZ
            </span>
            <span>CARGA · 1MB</span>
          </div>
        </div>

        {over && (
          <div className="modal-bd">
            <div className="modal">
              <h2>FIN DEL JUEGO</h2>
              <div className="final-label">PUNTUACIÓN FINAL</div>
              <div className="final">{FIXED_SCORE.toLocaleString("es-ES")}</div>
              {!saved ? (
                <div className="input-row">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="TUS INICIALES"
                  />
                  <button className="btn yellow" onClick={handleSaveScore}>
                    GUARDAR PUNTUACIÓN
                  </button>
                </div>
              ) : (
                <div className="toast-saved">▸ PUNTUACIÓN GUARDADA_</div>
              )}
              <div className="actions">
                <button className="btn" onClick={restart}>
                  JUGAR DE NUEVO
                </button>
                <Link href="/" className="btn magenta">
                  VOLVER AL VAULT
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
