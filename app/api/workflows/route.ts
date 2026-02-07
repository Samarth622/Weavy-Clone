import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { name, nodes, edges } = await req.json();

        const workflow = await prisma.workflow.create({
            data: {
                name,
                nodes,
                edges,
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
    const workflows = await prisma.workflow.findMany({
        orderBy: { createdAt: "desc" },
    });

    return Response.json(workflows);
}
