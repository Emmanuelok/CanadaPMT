import Link from "next/link";
import { Leaf } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Search",
    links: [
      { label: "Homes for sale", href: "/search?type=sale" },
      { label: "Rentals", href: "/search?type=rent" },
      { label: "Pre-construction", href: "/search?type=preconstruction" },
      { label: "Recently sold", href: "/search?type=sold" },
    ],
  },
  {
    title: "AI tools",
    links: [
      { label: "TrueValue valuation", href: "/valuation" },
      { label: "AffordIQ calculator", href: "/affordability" },
      { label: "Newcomer Pathway", href: "/newcomers" },
      { label: "Find an agent", href: "/agents" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why MapleHaus", href: "/about" },
      { label: "Pricing & plans", href: "/pricing" },
      { label: "For agents & brokerages", href: "/pricing" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-50/60">
      <div className="mh-container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Leaf className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
              Maple<span className="text-brand-700">Haus</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
            Canada&apos;s AI-powered real estate platform — built to fix the transparency, trust and
            affordability gaps the big portals leave behind. Bilingual, coast to coast.
          </p>
          <p className="mt-4 text-xs text-ink-400">
            Listings shown are illustrative sample data for demonstration purposes.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-ink-900">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-ink-600 transition hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100">
        <div className="mh-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} MapleHaus Technologies Inc. Made in Canada.</p>
          <p className="flex items-center gap-3">
            <span>English</span>
            <span className="text-ink-300">·</span>
            <span>Français</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
