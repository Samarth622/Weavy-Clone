import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { name, nodes, edges } = await req.json();

        const workflow = await prisma.workflow.create({
            data: {
                name,
                nodes,
                edges,
                userId
            },
        });

        return Response.json(workflow);
    } catch (error: any) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workflows);
}
