import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-8 px-[var(--gutter)] text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-[clamp(2rem,5vw,3.4rem)] uppercase tracking-[0.06em] text-silver">This page left no mark.</h1>
      <Link href="/" className="btn btn-ghost">
        Back to Blaze Ink
      </Link>
    </main>
  );
}
