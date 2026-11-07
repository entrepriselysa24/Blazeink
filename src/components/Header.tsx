"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { homePath, locales, type Dictionary, type Locale } from "@/lib/i18n";

export default function Header({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: "#work", label: t.work },
    { href: "#artist", label: t.artist },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "border-b border-white/[0.06] bg-ink/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 px-[var(--gutter)]">
        <Link href={homePath(lang)} className="group flex items-center gap-3" aria-label="Blaze Ink — home">
          <Image src="/brand/blaze-ink-monogram.png" alt="" width={256} height={316} className="h-9 w-auto mix-blend-screen transition-transform duration-700 group-hover:rotate-[-6deg]" priority />
          <span className="font-display text-[0.82rem] tracking-[0.3em] text-silver">BLAZE INK</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="link-line pb-1 text-[0.7rem] uppercase tracking-[0.26em] text-ash hover:text-bone">
              {l.label}
            </a>
          ))}
          <LangSwitch lang={lang} label={t.language} />
          <a href="#booking" className="btn !px-5 !py-3">
            {t.book}
          </a>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-bone md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.close : t.menu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.25} /> : <Menu size={22} strokeWidth={1.25} />}
        </button>
      </div>

      <div id="mobile-menu" hidden={!open} className="border-t border-white/[0.06] px-[var(--gutter)] pb-8 pt-4 md:hidden">
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 font-display text-2xl tracking-[0.12em] text-silver">
              {l.label}
            </a>
          ))}
          <a href="#booking" onClick={() => setOpen(false)} className="btn mt-4 justify-center">
            {t.book}
          </a>
          <div className="mt-6">
            <LangSwitch lang={lang} label={t.language} />
          </div>
        </nav>
      </div>
    </header>
  );
}

function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-3 text-[0.68rem] tracking-[0.2em]">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-3">
          {i > 0 && <span className="h-3 w-px bg-graphite" aria-hidden="true" />}
          <Link
            href={homePath(l)}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            className={l === lang ? "text-bone" : "text-ash transition-colors hover:text-bone"}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
