import { Radar, Gavel, ShieldCheck, Calculator, Compass, PenLine, LineChart, Brush, MessageSquare, Receipt, Scale, GitCompare, TrendingUp, Bot } from "lucide-react";

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
  GitCompare,
  TrendingUp,
};

export function AgentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Bot;
  return <Icon className={className} />;
}
