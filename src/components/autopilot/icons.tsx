import { Radar, Gavel, ShieldCheck, Calculator, Compass, PenLine, LineChart, Brush, MessageSquare, Receipt, Scale, Bot } from "lucide-react";

const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Radar,
  Gavel,
  ShieldCheck,
  Calculator,
  Compass,
  PenLine,
  LineChart,
  Brush,
  MessageSquare,
  Receipt,
  Scale,
};

export function AgentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Bot;
  return <Icon className={className} />;
}
