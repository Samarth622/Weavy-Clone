import { cropTask } from "@/trigger/tasks/crop-task";
import { runs } from "@trigger.dev/sdk/v3";

export async function POST(req: Request) {
  try {
    const { image, mode } = await req.json();

    const handle = await cropTask.trigger({
      image,
      mode,
    });

    const run = await runs.poll(handle.id, {
      pollIntervalMs: 500,
    });

    return Response.json(run.output);
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
