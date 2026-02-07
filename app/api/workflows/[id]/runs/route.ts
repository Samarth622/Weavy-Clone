import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ UNWRAP params properly
    const { id: workflowId } = await context.params;

    // Make sure workflow belongs to user
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const runs = await prisma.workflowRun.findMany({
      where: { workflowId },
      orderBy: { createdAt: "desc" },
      include: {
        nodeRuns: true,
      },
    });

    return NextResponse.json(runs);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
