import Link from "next/link";
import { Leaf, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mh-container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white">
        <Leaf className="h-7 w-7" />
      </span>
      <p className="mt-6 font-display text-6xl font-extrabold text-ink-900">404</p>
      <h1 className="mt-2 font-display text-xl font-bold text-ink-800">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        The listing or page may have moved. Let&apos;s get you back to finding a home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="mh-btn-primary">
          <Home className="h-4 w-4" /> Go home
        </Link>
        <Link href="/search?type=sale" className="mh-btn-ghost">
          <Search className="h-4 w-4" /> Search listings
        </Link>
      </div>
    </div>
  );
}
