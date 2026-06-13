import { NextResponse } from "next/server";
import { runFlow } from "@/lib/agents/orchestrator";
import { agentById } from "@/lib/agents/registry";

// Runs an Autopilot flow server-side. The console runs flows client-side for
// instant feedback; this endpoint exists for programmatic use and as the seam
// where agent narration can be upgraded to Claude when ANTHROPIC_API_KEY is set.
export const runtime = "nodejs";

// Run a single agent by id with default inputs (overridable via query params).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("agent") ?? "";
  const def = agentById(id);
  if (!def) return NextResponse.json({ error: "Unknown agent." }, { status: 404 });
  const input: Record<string, string> = {};
  def.inputs.forEach((i) => (input[i.key] = searchParams.get(i.key) ?? i.default ?? i.options?.[0]?.value ?? ""));
  return NextResponse.json(def.run(input));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const goal = typeof body?.goal === "string" ? body.goal.slice(0, 400) : "";
  if (!goal.trim()) {
    return NextResponse.json({ error: "Provide a goal." }, { status: 400 });
  }
  return NextResponse.json(runFlow(goal));
}
