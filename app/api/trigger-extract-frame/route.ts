import { NextResponse } from "next/server";
import { extractFrameTask } from "@/trigger/tasks/extract-frame-task";
import { runs } from "@trigger.dev/sdk/v3"; 

export async function POST(req: Request) {
    try {
        const { video, timestamp } = await req.json();

        const handle = await extractFrameTask.trigger({
            video,
            timestamp,
        });

        const run = await runs.poll(handle.id, {
            pollIntervalMs: 1000,
        });

        return NextResponse.json(run.output);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
