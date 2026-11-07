import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function Footer({ lang, t }: { lang: Locale; t: Dictionary["footer"] }) {
  return (
    <footer className="border-t border-white/[0.06] bg-void" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-[var(--gutter)] py-14 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <Image src="/brand/blaze-ink-monogram.png" alt="" width={256} height={316} className="h-12 w-auto mix-blend-screen" />
          <div>
            <p className="font-display text-sm tracking-[0.3em] text-silver">BLAZE INK</p>
            <p className="mt-1 font-script text-lg italic text-ash">{site.concept}</p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.66rem] uppercase tracking-[0.24em] text-ash">
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="link-line hover:text-bone">
            Instagram
          </a>
          {site.contactEmail && (
            <a href={`mailto:${site.contactEmail}`} className="link-line hover:text-bone">
              Email
            </a>
          )}
          <Link href={`/${lang}/privacy`} className="link-line hover:text-bone">
            {t.privacy}
          </Link>
          <a href="#top" className="link-line hover:text-bone">
            {t.top}
          </a>
        </nav>
      </div>
      <p className="mx-auto max-w-[1400px] px-[var(--gutter)] pb-10 text-[0.68rem] tracking-[0.12em] text-graphite">
        © {new Date().getFullYear()} Blaze Ink · {t.rights}
      </p>
    </footer>
  );
}
