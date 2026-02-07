import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const run = await prisma.workflowRun.findUnique({
    where: { id },
    include: {
      nodeRuns: true,
    },
  });

  if (!run) {
    return NextResponse.json(
      { error: "Run not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(run);
}