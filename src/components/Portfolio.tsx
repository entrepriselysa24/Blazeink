"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { portfolio, type PortfolioCategory, type PortfolioItem } from "@/content/portfolio";
import { site } from "@/lib/site";
import type { Dictionary, Locale } from "@/lib/i18n";

type Filter = "all" | PortfolioCategory;

export default function Portfolio({ lang, t }: { lang: Locale; t: Dictionary["portfolio"] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const categories = useMemo(() => Array.from(new Set(portfolio.map((p) => p.category))), []);
  const items = useMemo(() => portfolio.filter((p) => filter === "all" || p.category === filter), [filter]);

  const open = (i: number, el: HTMLElement) => {
    openerRef.current = el;
    setActive(i);
  };
  const close = useCallback(() => {
    setActive(null);
    openerRef.current?.focus();
  }, []);

  return (
    <section id="work" aria-labelledby="work-title" className="relative bg-ink py-[clamp(96px,13vw,180px)]">
      <div className="mx-auto max-w-[1400px] px-[var(--gutter)]">
        <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow reveal">{t.eyebrow}</p>
            <h2 id="work-title" className="reveal mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-none tracking-[0.06em] text-silver">
              {t.title}
            </h2>
            <p className="reveal mt-6 text-[0.98rem] leading-relaxed text-ash" style={{ ["--reveal-delay" as string]: "0.1s" }}>
              {t.lead}
            </p>
          </div>
          {categories.length > 1 && (
            <div role="group" aria-label={t.eyebrow} className="reveal flex flex-wrap gap-2">
              {(["all", ...categories] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`border px-4 py-2.5 text-[0.66rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                    filter === f ? "border-silver text-bone" : "border-graphite text-ash hover:border-ash hover:text-bone"
                  }`}
                >
                  {t.filters[f]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editorial grid: one tall piece and standard tiles, always full; the lightbox shows each photo whole */}
        <ul className="grid grid-flow-dense grid-cols-2 gap-2 [grid-auto-rows:clamp(200px,56vw,360px)] md:grid-cols-3 md:gap-3 md:[grid-auto-rows:clamp(300px,36vw,560px)]">
          {items.map((item, i) => (
            <li key={item.id} className={`${item.layout === "tall" ? "row-span-2" : ""} min-w-0`}>
              <Tile item={item} lang={lang} index={i} label={item.type === "video" ? t.video : t.open} onOpen={(el) => open(i, el)} />
            </li>
          ))}
        </ul>

        <div className="reveal mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/[0.07] pt-8">
          <p className="text-sm text-ash">{t.more}</p>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            {t.follow} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>

      {active !== null && <Lightbox items={items} index={active} setIndex={setActive} onClose={close} lang={lang} t={t.lightbox} />}
    </section>
  );
}

function Tile({ item, lang, index, label, onOpen }: { item: PortfolioItem; lang: Locale; index: number; label: string; onOpen: (el: HTMLElement) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tileRef = useRef<HTMLButtonElement>(null);

  // Each tile reveals itself, so tiles that re-appear after a filter change are revealed too.
  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Videos play silently only while visible, and never with reduced motion.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={tileRef}
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`${label}: ${item.title[lang]}`}
      className="tile-reveal group relative block h-full w-full overflow-hidden bg-smoke text-left"
      style={{ ["--reveal-delay" as string]: `${(index % 3) * 0.08}s` }}
    >
      <div className="absolute inset-0 transition-transform duration-[1.6s] ease-[var(--ease-cine)] group-hover:scale-[1.045]">
        {item.type === "video" ? (
          <video ref={videoRef} src={item.src} poster={item.poster} muted loop playsInline preload="metadata" className="h-full w-full object-cover" style={{ objectPosition: item.focus }} aria-hidden="true" />
        ) : (
          <Image src={item.src} alt={item.alt[lang]} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" style={{ objectPosition: item.focus }} />
        )}
      </div>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
        <span className="translate-y-1 text-[0.64rem] uppercase tracking-[0.22em] text-bone/90 transition-transform duration-500 group-hover:translate-y-0">{item.title[lang]}</span>
        {item.type === "video" && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-bone" aria-hidden="true">
            <Play size={12} strokeWidth={1.5} />
          </span>
        )}
      </span>
    </button>
  );
}

function Lightbox({
  items,
  index,
  setIndex,
  onClose,
  lang,
  t,
}: {
  items: PortfolioItem[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  lang: Locale;
  t: Dictionary["portfolio"]["lightbox"];
}) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const prev = useCallback(() => setIndex((index - 1 + items.length) % items.length), [index, items.length, setIndex]);
  const next = useCallback(() => setIndex((index + 1) % items.length), [index, items.length, setIndex]);

  useEffect(() => {
    closeRef.current?.focus();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title[lang]}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-[var(--gutter)] py-4" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <span className="text-[0.66rem] uppercase tracking-[0.24em] text-ash tabular-nums">
          {index + 1} {t.of} {items.length}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="flex h-11 w-11 items-center justify-center text-bone transition-transform duration-500 hover:rotate-90">
          <X size={22} strokeWidth={1.25} />
        </button>
      </div>

      <div className="relative flex min-h-0 items-center justify-center px-[var(--gutter)]" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <figure key={item.id} className="lightbox-media relative flex h-full max-h-[78vh] w-full max-w-[1100px] items-center justify-center">
          {item.type === "video" ? (
            <video src={item.src} poster={item.poster} controls autoPlay muted loop playsInline className="max-h-full max-w-full object-contain" aria-label={item.alt[lang]} />
          ) : (
            <Image src={item.src} alt={item.alt[lang]} width={item.width} height={item.height} sizes="(min-width: 1100px) 1100px, 100vw" className="h-auto max-h-[78vh] w-auto max-w-full object-contain" />
          )}
        </figure>
        {items.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label={t.prev} className="absolute left-[var(--gutter)] top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/15 text-bone transition-colors hover:border-silver md:flex">
              <ChevronLeft size={20} strokeWidth={1.25} />
            </button>
            <button type="button" onClick={next} aria-label={t.next} className="absolute right-[var(--gutter)] top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/15 text-bone transition-colors hover:border-silver md:flex">
              <ChevronRight size={20} strokeWidth={1.25} />
            </button>
          </>
        )}
      </div>

      <p className="px-[var(--gutter)] py-5 text-center text-[0.7rem] uppercase tracking-[0.22em] text-silver" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}>
        {item.title[lang]}
      </p>
    </div>
  );
}
