"use client";

function openAria() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-aria"));
}

export function AriaButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button onClick={openAria} className={className}>
      {children}
    </button>
  );
}
