import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runFlow } from "@/lib/agents/orchestrator";
import { agentById } from "@/lib/agents/registry";

// Runs an Autopilot flow server-side. The console runs flows client-side for
// instant feedback; this endpoint is the programmatic path and the seam where
// the flow's narration upgrades to Claude when ANTHROPIC_API_KEY is set. The
// agents' computed numbers are identical either way.
export const runtime = "nodejs";
export const maxDuration = 30;

async function narrate(goal: string, summary: string, facts: string): Promise<{ summary: string; usedAI: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { summary, usedAI: false };
  try {
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: process.env.ARIA_MODEL || "claude-opus-4-8",
      max_tokens: 320,
      system:
        "You are MapleHaus Autopilot, narrating what a fleet of AI real-estate agents just accomplished for a user in Canada. Be concise and concrete, use the real figures provided, and wrap key numbers in **bold**. 2-3 sentences. Do not invent numbers.",
      messages: [{ role: "user", content: `User goal: ${goal}\n\nAgents ran:\n${facts}\n\nWrite the summary.` }],
    });
    const text = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    return text ? { summary: text, usedAI: true } : { summary, usedAI: false };
  } catch {
    return { summary, usedAI: false };
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const goal = typeof body?.goal === "string" ? body.goal.slice(0, 400) : "";
  if (!goal.trim()) {
    return NextResponse.json({ error: "Provide a goal." }, { status: 400 });
  }
  const result = runFlow(goal);
  const facts = result.runs
    .map((r) => `- ${r.title}: ${r.summary} [${(r.metrics ?? []).map((m) => `${m.label}=${m.value}`).join(", ")}]`)
    .join("\n");
  const { summary, usedAI } = await narrate(goal, result.summary, facts);
  return NextResponse.json({ ...result, summary, usedAI });
}

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
