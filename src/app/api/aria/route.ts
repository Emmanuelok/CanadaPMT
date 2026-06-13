import { NextResponse } from "next/server";
import { askAria } from "@/lib/ai/aria";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    const messages: ChatMessage[] = incoming
      .filter(
        (m: unknown): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
          typeof (m as ChatMessage).content === "string",
      )
      .slice(-10)
      .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!messages.length) {
      return NextResponse.json({
        answer: "Ask me to find a home, value a property, or check what you can afford.",
        usedAI: false,
      });
    }

    const result = await askAria(messages);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { answer: "Something went wrong on my end. Please try again.", usedAI: false },
      { status: 200 },
    );
  }
}
