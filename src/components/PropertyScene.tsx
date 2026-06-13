import { cn } from "@/lib/cn";

// Self-contained, deterministic SVG "photography". Looks like designed listing
// imagery, never breaks, and needs no external CDN. A real photo CDN can be
// swapped in behind this same component later.

export type Kind = "exterior" | "living" | "kitchen" | "bedroom" | "land" | "commercial";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function sceneFor(label: string | undefined, index: number): Kind {
  const l = (label ?? "").toLowerCase();
  if (/aerial|frontage|parcel|acre|\bland\b|\blot\b|plot|survey/.test(l)) return "land";
  if (/storefront|retail|signage|\bunit\b|\bbay\b|commercial|warehouse|tenant/.test(l)) return "commercial";
  if (/kitchen/.test(l)) return "kitchen";
  if (/bedroom|suite|sleeping/.test(l)) return "bedroom";
  if (/living|dining|lounge|loft|open|view|amenit|lobby|rooftop/.test(l)) return "living";
  if (/exterior|front|backyard|yard|garden|building|tower|street|rendering|site|exec/.test(l)) return "exterior";
  return index === 0 ? "exterior" : index % 2 === 1 ? "living" : "kitchen";
}

const SKIES: { from: string; to: string; sun: string }[] = [
  { from: "#bfe3f5", to: "#eef7fc", sun: "#ffe6a1" },
  { from: "#ffd2ab", to: "#ffeede", sun: "#ff9d63" },
  { from: "#c2cdec", to: "#e6ecf7", sun: "#f7d6a6" },
  { from: "#aee0d4", to: "#eaf7f2", sun: "#fce5a8" },
];
const WALLS = ["#efe6d9", "#e8d9c6", "#e2e8ec", "#dfeae3", "#ece2ea"];
const FLOORS = ["#c79a67", "#b98a58", "#caa982", "#9c8f7e"];
const SOFAS = ["#6b8f7d", "#3c4654", "#c07b5b", "#7d6f8f"];

export function PropertyScene({
  seedKey,
  label,
  kind,
  className,
}: {
  seedKey: string;
  label?: string;
  kind?: Kind;
  className?: string;
}) {
  const h = hash(seedKey);
  const uid = `s${h % 100000}`;
  const resolved: Kind = kind ?? sceneFor(label, h % 5 === 0 ? 1 : (label ? 0 : h % 3));
  const sky = SKIES[h % SKIES.length];
  const wall = WALLS[h % WALLS.length];
  const floor = FLOORS[(h >> 3) % FLOORS.length];
  const sofa = SOFAS[(h >> 5) % SOFAS.length];

  return (
    <div className={cn("relative overflow-hidden bg-ink-100", className)}>
      <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        {resolved === "exterior" && <Exterior uid={uid} sky={sky} />}
        {resolved === "living" && <Interior uid={uid} wall={wall} floor={floor} accent={sofa} variant="living" />}
        {resolved === "kitchen" && <Kitchen uid={uid} wall={wall} floor={floor} />}
        {resolved === "bedroom" && <Interior uid={uid} wall={wall} floor={floor} accent={sofa} variant="bedroom" />}
        {resolved === "land" && <Land uid={uid} sky={sky} />}
        {resolved === "commercial" && <Commercial uid={uid} sky={sky} />}
      </svg>
      {label && (
        <span className="absolute bottom-2 left-2 rounded-md bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}

function Exterior({ uid, sky }: { uid: string; sky: { from: string; to: string; sun: string } }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.from} />
          <stop offset="100%" stopColor={sky.to} />
        </linearGradient>
        <linearGradient id={`${uid}-lawn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9cc08b" />
          <stop offset="100%" stopColor="#7fae6f" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cfe5ef" />
          <stop offset="100%" stopColor="#8fb6c7" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill={`url(#${uid}-sky)`} />
      <circle cx="320" cy="58" r="26" fill={sky.sun} opacity="0.85" />
      {/* distant treeline */}
      <path d="M0 168 Q60 150 120 166 T260 162 T400 168 V210 H0 Z" fill="#cdddc0" opacity="0.7" />
      {/* lawn */}
      <rect x="0" y="198" width="400" height="82" fill={`url(#${uid}-lawn)`} />
      {/* shadow */}
      <ellipse cx="210" cy="214" rx="150" ry="14" fill="#0a3a2e" opacity="0.12" />
      {/* driveway */}
      <polygon points="150,280 250,280 220,214 180,214" fill="#cfcabb" />
      {/* dark accent volume */}
      <rect x="246" y="96" width="86" height="120" fill="#3a4250" />
      <rect x="258" y="112" width="62" height="78" fill={`url(#${uid}-glass)`} />
      <line x1="289" y1="112" x2="289" y2="190" stroke="#3a4250" strokeWidth="2" />
      <line x1="258" y1="151" x2="320" y2="151" stroke="#3a4250" strokeWidth="2" />
      {/* main light volume */}
      <rect x="96" y="124" width="156" height="92" fill="#f4efe6" />
      <rect x="96" y="118" width="156" height="10" fill="#e2dccf" />
      {/* windows with warm glow */}
      <rect x="112" y="140" width="40" height="34" fill="#ffe6a1" stroke="#cdb98a" strokeWidth="2" />
      <rect x="166" y="140" width="40" height="34" fill="#ffe6a1" stroke="#cdb98a" strokeWidth="2" />
      <line x1="132" y1="140" x2="132" y2="174" stroke="#cdb98a" strokeWidth="1.5" />
      <line x1="186" y1="140" x2="186" y2="174" stroke="#cdb98a" strokeWidth="1.5" />
      {/* garage / door */}
      <rect x="112" y="184" width="56" height="32" fill="#d9d2c4" stroke="#c3bba9" strokeWidth="2" />
      <rect x="200" y="178" width="22" height="38" fill="#7a5a3c" />
      {/* tree */}
      <rect x="56" y="170" width="8" height="46" fill="#7a5a3c" />
      <circle cx="60" cy="158" r="26" fill="#6fa05f" />
      <circle cx="40" cy="170" r="18" fill="#5f9050" />
      <circle cx="80" cy="170" r="18" fill="#79ab68" />
    </g>
  );
}

function Interior({
  uid,
  wall,
  floor,
  accent,
  variant,
}: {
  uid: string;
  wall: string;
  floor: string;
  accent: string;
  variant: "living" | "bedroom";
}) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-day`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf6e8" />
          <stop offset="100%" stopColor="#dcebf2" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill={wall} />
      {/* window */}
      <rect x="276" y="44" width="96" height="120" fill={`url(#${uid}-day)`} stroke="#cbbfa9" strokeWidth="4" />
      <line x1="324" y1="44" x2="324" y2="164" stroke="#cbbfa9" strokeWidth="3" />
      <line x1="276" y1="104" x2="372" y2="104" stroke="#cbbfa9" strokeWidth="3" />
      {/* floor */}
      <rect x="0" y="206" width="400" height="74" fill={floor} />
      <rect x="0" y="206" width="400" height="4" fill="#00000018" />
      {/* rug */}
      <ellipse cx="150" cy="250" rx="140" ry="22" fill="#00000012" />
      {variant === "living" ? (
        <>
          {/* sofa */}
          <rect x="40" y="176" width="150" height="40" rx="10" fill={accent} />
          <rect x="40" y="150" width="150" height="34" rx="10" fill={accent} opacity="0.9" />
          <rect x="56" y="172" width="52" height="22" rx="6" fill="#ffffff" opacity="0.22" />
          <rect x="118" y="172" width="52" height="22" rx="6" fill="#ffffff" opacity="0.22" />
          {/* coffee table */}
          <rect x="74" y="222" width="86" height="12" rx="4" fill="#8a6a48" />
          <rect x="80" y="234" width="6" height="16" fill="#6f5439" />
          <rect x="148" y="234" width="6" height="16" fill="#6f5439" />
          {/* floor lamp */}
          <rect x="220" y="150" width="4" height="66" fill="#5b6472" />
          <path d="M210 150 H234 L228 132 H216 Z" fill="#e9d9a8" />
        </>
      ) : (
        <>
          {/* bed */}
          <rect x="40" y="150" width="36" height="68" rx="6" fill="#5b6472" />
          <rect x="40" y="186" width="200" height="34" rx="8" fill="#e7dccb" />
          <rect x="48" y="160" width="70" height="30" rx="8" fill="#ffffff" />
          <rect x="124" y="160" width="70" height="30" rx="8" fill="#f3ece0" />
          <rect x="40" y="208" width="200" height="12" rx="4" fill={accent} opacity="0.85" />
          {/* nightstand + lamp */}
          <rect x="250" y="190" width="34" height="28" fill="#8a6a48" />
          <rect x="263" y="168" width="6" height="22" fill="#5b6472" />
          <path d="M254 168 H278 L272 152 H260 Z" fill="#e9d9a8" />
        </>
      )}
      {/* wall art */}
      <rect x="120" y="70" width="60" height="44" fill="#ffffff" stroke="#cdbfa6" strokeWidth="3" />
      <path d="M126 108 L146 84 L160 100 L174 88 V108 Z" fill={accent} opacity="0.7" />
      {/* plant */}
      <rect x="356" y="196" width="22" height="22" fill="#b9744f" />
      <path d="M367 196 C355 176 360 160 367 150 C374 160 379 176 367 196" fill="#5f9050" />
      <path d="M367 196 C380 182 388 178 392 174 C386 188 380 196 367 196" fill="#6fa05f" />
    </g>
  );
}

function Kitchen({ uid, wall, floor }: { uid: string; wall: string; floor: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f1ec" />
          <stop offset="100%" stopColor="#dcd8cf" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill={wall} />
      <rect x="0" y="214" width="400" height="66" fill={floor} />
      {/* upper cabinets */}
      <rect x="24" y="52" width="150" height="44" fill="#3a4250" />
      <rect x="24" y="52" width="72" height="44" fill="#434c5c" />
      <line x1="96" y1="52" x2="96" y2="96" stroke="#2c333f" strokeWidth="2" />
      {/* range hood */}
      <path d="M196 52 H252 L240 92 H208 Z" fill="#9aa3ad" />
      {/* backsplash */}
      <rect x="24" y="120" width="248" height="30" fill="#e9e4da" />
      {/* lower cabinets + counter */}
      <rect x="24" y="150" width="248" height="14" fill={`url(#${uid}-stone)`} />
      <rect x="24" y="164" width="248" height="58" fill="#cdbfa6" />
      <line x1="104" y1="164" x2="104" y2="222" stroke="#b6a98f" strokeWidth="2" />
      <line x1="184" y1="164" x2="184" y2="222" stroke="#b6a98f" strokeWidth="2" />
      <rect x="60" y="184" width="14" height="4" fill="#8a7a5c" />
      <rect x="140" y="184" width="14" height="4" fill="#8a7a5c" />
      <rect x="220" y="184" width="14" height="4" fill="#8a7a5c" />
      {/* island */}
      <rect x="120" y="206" width="180" height="14" fill={`url(#${uid}-stone)`} />
      <rect x="120" y="220" width="180" height="44" fill="#3a4250" />
      {/* stools */}
      <circle cx="150" cy="236" r="9" fill="#b9744f" />
      <rect x="148" y="244" width="4" height="20" fill="#5b6472" />
      <circle cx="200" cy="236" r="9" fill="#b9744f" />
      <rect x="198" y="244" width="4" height="20" fill="#5b6472" />
      {/* pendant lights */}
      <line x1="170" y1="96" x2="170" y2="150" stroke="#5b6472" strokeWidth="2" />
      <path d="M160 150 H180 L176 136 H164 Z" fill="#ffe6a1" />
      <line x1="230" y1="96" x2="230" y2="150" stroke="#5b6472" strokeWidth="2" />
      <path d="M220 150 H240 L236 136 H224 Z" fill="#ffe6a1" />
      {/* window */}
      <rect x="300" y="60" width="76" height="92" fill="#dcebf2" stroke="#cbbfa9" strokeWidth="4" />
      <line x1="338" y1="60" x2="338" y2="152" stroke="#cbbfa9" strokeWidth="3" />
    </g>
  );
}

function Land({ uid, sky }: { uid: string; sky: { from: string; to: string; sun: string } }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.from} />
          <stop offset="100%" stopColor={sky.to} />
        </linearGradient>
        <linearGradient id={`${uid}-field`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9cb91" />
          <stop offset="100%" stopColor="#7ba861" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill={`url(#${uid}-sky)`} />
      <circle cx="318" cy="54" r="24" fill={sky.sun} opacity="0.85" />
      <path d="M0 150 Q70 138 140 150 T280 146 T400 152 V190 H0 Z" fill="#cbdcbd" opacity="0.7" />
      <rect x="0" y="150" width="400" height="130" fill={`url(#${uid}-field)`} />
      <path d="M0 196 Q200 188 400 198" stroke="#ffffff" strokeWidth="2" opacity="0.18" fill="none" />
      <path d="M0 224 Q200 216 400 226" stroke="#ffffff" strokeWidth="2" opacity="0.14" fill="none" />
      {/* dirt access path */}
      <polygon points="172,280 232,280 214,176 186,176" fill="#cabfa2" />
      {/* trees */}
      <rect x="52" y="138" width="6" height="20" fill="#7a5a3c" />
      <circle cx="55" cy="134" r="14" fill="#6fa05f" />
      <rect x="350" y="140" width="6" height="18" fill="#7a5a3c" />
      <circle cx="353" cy="136" r="12" fill="#79ab68" />
      {/* FOR SALE sign */}
      <rect x="250" y="146" width="6" height="58" fill="#6f5439" />
      <rect x="226" y="120" width="74" height="38" fill="#ffffff" stroke="#d8cfbf" strokeWidth="2" />
      <rect x="226" y="120" width="74" height="13" fill="#7e2239" />
      <rect x="234" y="139" width="58" height="5" fill="#c9cfd8" />
      <rect x="234" y="148" width="40" height="5" fill="#c9cfd8" />
      {/* survey stake */}
      <line x1="120" y1="204" x2="120" y2="178" stroke="#5b6472" strokeWidth="2" />
      <path d="M120 178 L134 182 L120 187 Z" fill="#ee5140" />
    </g>
  );
}

function Commercial({ uid, sky }: { uid: string; sky: { from: string; to: string; sun: string } }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d3e6ef" />
          <stop offset="100%" stopColor="#9bbccb" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="#e9e7e1" />
      <rect width="400" height="60" fill={sky.to} opacity="0.6" />
      {/* facade */}
      <rect x="36" y="38" width="328" height="174" fill="#d7d0c4" />
      <rect x="36" y="38" width="328" height="8" fill="#c5bdaf" />
      {/* upper office windows */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={56 + i * 60} y={62} width={40} height={56} fill={`url(#${uid}-glass)`} stroke="#b7afa0" strokeWidth="2" />
      ))}
      {/* signage band */}
      <rect x="36" y="150" width="328" height="22" fill="#7e2239" />
      <rect x="52" y="153" width="16" height="16" rx="3" fill="#ffffff" />
      <rect x="78" y="157" width="96" height="8" rx="2" fill="#ffffff" opacity="0.85" />
      {/* awning */}
      <polygon points="40,150 360,150 344,140 56,140" fill="#9d3349" />
      {/* storefront */}
      <rect x="52" y="176" width="118" height="36" fill={`url(#${uid}-glass)`} stroke="#3a4250" strokeWidth="2" />
      <rect x="230" y="176" width="118" height="36" fill={`url(#${uid}-glass)`} stroke="#3a4250" strokeWidth="2" />
      <line x1="111" y1="176" x2="111" y2="212" stroke="#3a4250" strokeWidth="1.5" />
      <line x1="289" y1="176" x2="289" y2="212" stroke="#3a4250" strokeWidth="1.5" />
      {/* entrance */}
      <rect x="176" y="176" width="48" height="36" fill="#7f9aa6" stroke="#3a4250" strokeWidth="2" />
      <line x1="200" y1="176" x2="200" y2="212" stroke="#3a4250" strokeWidth="2" />
      {/* sidewalk */}
      <rect x="0" y="212" width="400" height="68" fill="#cdc8bd" />
      <line x1="0" y1="212" x2="400" y2="212" stroke="#b7b2a6" strokeWidth="2" />
      {/* streetlight */}
      <rect x="70" y="150" width="4" height="62" fill="#5b6472" />
      <rect x="60" y="146" width="24" height="8" rx="3" fill="#3a4250" />
      {/* planter */}
      <rect x="320" y="222" width="24" height="16" fill="#8a6a48" />
      <circle cx="332" cy="214" r="12" fill="#6fa05f" />
    </g>
  );
}
