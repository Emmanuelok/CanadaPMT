"use client";

import { useRouter } from "next/navigation";

export function PropertyPicker({
  options,
  value,
  basePath,
}: {
  options: { slug: string; label: string }[];
  value: string;
  basePath: string;
}) {
  const router = useRouter();
  return (
    <select
      value={value}
      onChange={(e) => router.push(`${basePath}?slug=${e.target.value}`)}
      className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-800 outline-none focus:border-brand-400 sm:w-auto"
      aria-label="Choose a property to value"
    >
      {options.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
