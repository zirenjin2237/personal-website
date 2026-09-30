import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">404</p>
      <h1 className="mt-3 font-mono text-3xl font-extrabold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">This page does not exist or has moved.</p>
      <Link href="/" className="mt-8 text-accent underline-offset-4 hover:underline">
        ← Back to the homepage
      </Link>
    </main>
  );
}
