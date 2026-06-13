// Fixed, animated gradient-mesh backdrop that sits behind all content.
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night-950">
      <div className="absolute inset-0 mh-grid-bg opacity-70" />
      <div className="absolute -top-48 left-1/3 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[130px] animate-aurora" />
      <div
        className="absolute top-1/4 -right-20 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/20 blur-[130px] animate-aurora"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute -bottom-32 left-0 h-[38rem] w-[38rem] rounded-full bg-cyan-500/15 blur-[140px] animate-aurora"
        style={{ animationDelay: "-13s" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/0 via-night-950/30 to-night-950" />
    </div>
  );
}
