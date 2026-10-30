"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number; // depth layer 0.3..1.0
  radius: number;
  isHub: boolean;
  pulsePhase: number;
  ringRotation: number;
  ringSpeed: number;
}

interface SignalPulse {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

/**
 * Анимированный научный фон: молекулярная решетка, гексагональные кольца
 * и биолюминесцентные сигнальные импульсы между узлами.
 * Полностью учитывает `prefers-reduced-motion` и оптимизирован по DPI.
 */
function MolecularFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = 0;
    let nodes: ParticleNode[] = [];
    let pulses: SignalPulse[] = [];

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
    };

    const createScene = () => {
      const area = width * height;
      const count = Math.max(26, Math.min(68, Math.floor(area / 24000)));
      nodes = [];
      pulses = [];

      for (let i = 0; i < count; i++) {
        const z = 0.35 + (i % 7) * 0.1;
        const isHub = i % 6 === 0;
        const speedBase = (0.12 + z * 0.16) * (isHub ? 0.75 : 1);
        const angle = (i * 2.39996) % (Math.PI * 2);

        nodes.push({
          x: ((i * 137.5) % 100) * 0.01 * width,
          y: ((i * 293.7) % 100) * 0.01 * height,
          vx: Math.cos(angle) * speedBase,
          vy: Math.sin(angle) * speedBase,
          z,
          radius: isHub ? 2.6 * z + 0.8 : 1.35 * z + 0.4,
          isHub,
          pulsePhase: (i * 0.9) % (Math.PI * 2),
          ringRotation: (i * 0.5) % (Math.PI * 2),
          ringSpeed: (i % 2 === 0 ? 1 : -1) * 0.0025,
        });
      }
    };

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createScene();
    };

    const drawHexagonRing = (
      cx: number,
      cy: number,
      radius: number,
      rotation: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let side = 0; side < 6; side++) {
        const theta = (side * Math.PI) / 3;
        const px = Math.cos(theta) * radius;
        const py = Math.sin(theta) * radius;
        if (side === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(45, 212, 191, ${alpha})`;
      ctx.lineWidth = 0.85;
      ctx.stroke();

      // Внутренние двойные связи ароматического кольца
      ctx.beginPath();
      for (let side = 0; side < 6; side += 2) {
        const theta1 = (side * Math.PI) / 3;
        const theta2 = ((side + 1) * Math.PI) / 3;
        const innerR = radius * 0.72;
        ctx.moveTo(Math.cos(theta1) * innerR, Math.sin(theta1) * innerR);
        ctx.lineTo(Math.cos(theta2) * innerR, Math.sin(theta2) * innerR);
      }
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.65})`;
      ctx.lineWidth = 0.65;
      ctx.stroke();
      ctx.restore();
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Плавное сглаживание параллакса от курсора
      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;

      const maxLinkDistance = Math.min(210, Math.max(135, width * 0.13));

      // Обновление координат узлов
      if (!prefersReducedMotion) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;
          node.pulsePhase += 0.016;
          node.ringRotation += node.ringSpeed;

          const margin = 48;
          if (node.x < -margin) node.x = width + margin;
          if (node.x > width + margin) node.x = -margin;
          if (node.y < -margin) node.y = height + margin;
          if (node.y > height + margin) node.y = -margin;
        }
      }

      // Координаты с учетом глубины и легкого параллакса
      const projected = nodes.map((node) => ({
        x: node.x + pointer.x * (node.z - 0.5) * 22,
        y: node.y + pointer.y * (node.z - 0.5) * 22,
      }));

      // Отрисовка межмолекулярных связей
      for (let i = 0; i < nodes.length; i++) {
        const p1 = projected[i];
        const n1 = nodes[i];
        if (!p1 || !n1) continue;

        for (let j = i + 1; j < nodes.length; j++) {
          const p2 = projected[j];
          const n2 = nodes[j];
          if (!p2 || !n2) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;
          const limitSq = maxLinkDistance * maxLinkDistance;

          if (distSq < limitSq) {
            const dist = Math.sqrt(distSq);
            const proximity = 1 - dist / maxLinkDistance;
            const depthFactor = (n1.z + n2.z) * 0.5;
            const alpha = proximity * depthFactor * 0.24;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle =
              n1.isHub || n2.isHub
                ? `rgba(45, 212, 191, ${alpha * 1.15})`
                : `rgba(148, 163, 184, ${alpha * 0.75})`;
            ctx.lineWidth = n1.isHub && n2.isHub ? 1.05 : 0.7;
            ctx.stroke();

            // Периодический запуск сигнальных импульсов вдоль активных связей
            if (
              !prefersReducedMotion &&
              pulses.length < 14 &&
              (n1.isHub || n2.isHub) &&
              proximity > 0.45 &&
              Math.sin(time * 0.001 + i * 3.1 + j) > 0.996
            ) {
              pulses.push({
                fromIndex: i,
                toIndex: j,
                progress: 0,
                speed: 0.008 + (i % 3) * 0.003,
              });
            }
          }
        }
      }

      // Отрисовка движущихся сигнальных импульсов (лиганд-рецепторная передача)
      if (!prefersReducedMotion) {
        for (let k = pulses.length - 1; k >= 0; k--) {
          const pulse = pulses[k];
          if (!pulse) continue;
          pulse.progress += pulse.speed;
          if (pulse.progress >= 1) {
            pulses.splice(k, 1);
            continue;
          }

          const from = projected[pulse.fromIndex];
          const to = projected[pulse.toIndex];
          if (!from || !to) continue;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxLinkDistance * 1.15) {
            pulses.splice(k, 1);
            continue;
          }

          const px = from.x + dx * pulse.progress;
          const py = from.y + dy * pulse.progress;
          const env = Math.sin(pulse.progress * Math.PI);

          const glow = ctx.createRadialGradient(px, py, 0, px, py, 8);
          glow.addColorStop(0, `rgba(94, 234, 212, ${0.85 * env})`);
          glow.addColorStop(0.5, `rgba(20, 184, 166, ${0.3 * env})`);
          glow.addColorStop(1, "rgba(20, 184, 166, 0)");

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Отрисовка узлов и молекулярных колец
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pos = projected[i];
        if (!node || !pos) continue;

        const pulse = 0.75 + 0.25 * Math.sin(node.pulsePhase);

        if (node.isHub) {
          // Гексагональное фармакофорное кольцо вокруг ключевых узлов
          drawHexagonRing(
            pos.x,
            pos.y,
            13 * node.z + 4,
            node.ringRotation,
            0.16 * node.z * pulse
          );

          // Мягкий биолюминесцентный ореол
          const haloRadius = 14 * node.z;
          const halo = ctx.createRadialGradient(
            pos.x,
            pos.y,
            0,
            pos.x,
            pos.y,
            haloRadius
          );
          halo.addColorStop(0, `rgba(45, 212, 191, ${0.38 * node.z * pulse})`);
          halo.addColorStop(0.55, `rgba(14, 165, 233, ${0.12 * node.z})`);
          halo.addColorStop(1, "rgba(14, 165, 233, 0)");

          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ядро узла
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isHub
          ? `rgba(153, 246, 228, ${0.85 * node.z})`
          : `rgba(203, 213, 225, ${0.42 * node.z * pulse})`;
        ctx.fill();
      }
    };

    const loop = (timestamp: number) => {
      if (document.visibilityState === "visible") {
        renderFrame(timestamp);
      }
      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(loop);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (prefersReducedMotion) return;
      pointer.active = true;
      pointer.targetX = (event.clientX / Math.max(1, width) - 0.5) * 2;
      pointer.targetY = (event.clientY / Math.max(1, height) - 0.5) * 2;
    };

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      window.cancelAnimationFrame(animationFrameId);
      renderFrame(performance.now());
      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(loop);
      }
    };

    handleResize();
    renderFrame(performance.now());

    if (!prefersReducedMotion) {
      animationFrameId = window.requestAnimationFrame(loop);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/**
 * Минималистичная презентационная главная страница PharmaSphere (`/`).
 * Концепция: Premium Scientific / Cinematic Minimalism.
 */
export function ScientificLanding() {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#040814] text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Многослойная световая атмосфера и научная сетка */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Глубокие радиальные световые поля */}
        <div
          className="absolute left-1/2 top-[38%] h-[560px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[135px] sm:h-[680px] sm:w-[980px]"
          style={{
            background:
              "radial-gradient(circle, rgba(13,148,136,0.28) 0%, rgba(14,116,144,0.14) 42%, rgba(4,8,20,0) 75%)",
          }}
        />
        <div
          className="absolute -top-32 left-1/4 h-[380px] w-[520px] rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(15,23,42,0) 70%)",
          }}
        />

        {/* Тонкая координатная сетка */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148, 163, 184, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.35) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 100%)",
          }}
        />

        {/* Интерактивное молекулярное поле */}
        <MolecularFieldCanvas />

        {/* Мягкая кинематографическая виньетка по краям */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, transparent 35%, rgba(4, 8, 20, 0.72) 100%)",
          }}
        />
      </div>

      {/* Верхняя минимальная панель с логотипом */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <Link
          href="/"
          aria-label="PharmaSphere — Главная страница"
          className="group inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 rounded-lg"
        >
          {/* Молекулярный логотип-эмблема */}
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-teal-400/25 bg-slate-900/80 shadow-[0_0_25px_-5px_rgba(20,184,166,0.45)] backdrop-blur-md transition-colors group-hover:border-teal-400/50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-teal-300"
              aria-hidden="true"
            >
              <polygon
                points="12,2.75 19.8,7.25 19.8,16.75 12,21.25 4.2,16.75 4.2,7.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.4" fill="currentColor" />
              <line
                x1="12"
                y1="2.75"
                x2="12"
                y2="9.6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
              <line
                x1="19.8"
                y1="16.75"
                x2="14.1"
                y2="13.2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
              <line
                x1="4.2"
                y1="16.75"
                x2="9.9"
                y2="13.2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
            </svg>
          </span>

          <div className="flex flex-col">
            <span className="text-[15px] font-semibold tracking-tight text-white">
              PharmaSphere
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-400/80">
              Clinical Pharmacology
            </span>
          </div>
        </Link>

        <nav aria-label="Быстрый вход">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full border border-slate-800/90 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-all hover:border-teal-500/40 hover:bg-slate-900/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span>Войти в среду</span>
            <ArrowRight
              className="h-3.5 w-3.5 text-teal-400"
              aria-hidden="true"
            />
          </Link>
        </nav>
      </header>

      {/* Центральная композиция первого экрана */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
        {/* Тонкий научный маркер над заголовком */}
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-teal-500/20 bg-teal-950/25 px-3.5 py-1 backdrop-blur-md">
          <span
            className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-teal-300/90">
            Научно-образовательная платформа
          </span>
        </div>

        {/* Крупная выразительная надпись */}
        <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl md:text-6xl md:leading-[1.08]">
          Фармакология на уровне{" "}
          <span className="bg-gradient-to-r from-teal-200 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            молекулярных мишеней
          </span>{" "}
          и клинической логики
        </h1>

        {/* Короткий подзаголовок, объясняющий назначение проекта */}
        <p className="mt-6 max-w-xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-base sm:leading-relaxed">
          Структурированная цифровая среда для изучения механизмов действия
          лекарственных средств, рецепторной трансдукции и клинической
          фармакокинетики.
        </p>

        {/* Единственная главная кнопка действия */}
        <div className="mt-10 flex flex-col items-center">
          <Link
            href="/app"
            className="group relative inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-full border border-teal-400/40 bg-gradient-to-b from-teal-500/90 to-teal-700/95 px-8 text-sm font-medium tracking-wide text-white shadow-[0_0_40px_-8px_rgba(20,184,166,0.65)] transition-all duration-300 hover:border-teal-300/70 hover:shadow-[0_0_55px_-6px_rgba(45,212,191,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040814]"
          >
            <span className="relative z-10">Открыть приложение</span>
            <ArrowRight
              className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </main>

      {/* Сдержанный нижний контур без лишнего информационного шума */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 border-t border-slate-800/40 px-6 py-5 text-[11px] text-slate-500 sm:flex-row sm:px-10">
        <span className="font-mono tracking-wider uppercase text-slate-500/90">
          PharmaSphere • Система клинической фармакологии
        </span>
        <span className="text-slate-500/80">
          Образовательная среда для студентов медицинских вузов и врачей
        </span>
      </footer>
    </div>
  );
}
