import { NextResponse } from "next/server";
import { llmTask } from "@/trigger/tasks/llm-task";
import { runs } from "@trigger.dev/sdk";

export async function POST(req: Request) {
  try {
    const { prompt, image } = await req.json();

    const handle = await llmTask.trigger({
      prompt,
      image,
    });

    const run = await runs.poll(handle.id, {
      pollIntervalMs: 1000,
    });

    return NextResponse.json(run.output);

  } catch (error: any) {
    console.error("Trigger error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
