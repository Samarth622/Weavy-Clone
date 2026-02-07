import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { extractFrameTask } from "@/trigger/tasks/extract-frame-task";
import { cropTask } from "@/trigger/tasks/crop-task";
import { llmTask } from "@/trigger/tasks/llm-task";
import { runs } from "@trigger.dev/sdk/v3";

export async function POST(req: Request) {
    try {
        const { workflowId, nodes, edges } = await req.json();

        if (!workflowId) {
            return NextResponse.json(
                { error: "Please save workflow before running." },
                { status: 400 }
            );
        }

        const workflowRun = await prisma.workflowRun.create({
            data: {
                workflowId,
                status: "running",
            },
        });

        executeWorkflow(workflowRun.id, nodes, edges);

        return NextResponse.json({
            runId: workflowRun.id,
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}


async function executeWorkflow(
    runId: string,
    nodes: any[],
    edges: any[]
) {
    const results: Record<string, any> = {};

    // Build DAG
    const incoming: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    nodes.forEach((n) => {
        incoming[n.id] = 0;
        adj[n.id] = [];
    });

    edges.forEach((e) => {
        incoming[e.target]++;
        adj[e.source].push(e.target);
    });

    const queue = Object.keys(incoming).filter(
        (id) => incoming[id] === 0
    );

    while (queue.length) {
        const nodeId = queue.shift()!;
        const node = nodes.find((n) => n.id === nodeId);

        const nodeRun = await prisma.nodeRun.create({
            data: {
                workflowRunId: runId,
                nodeId,
                status: "running",
                input: node.data || {},
            },
        });

        try {
            let output: any = null;

            if (node.type === "prompt") {
                output = node.data?.prompt || "";
            } else if (node.type === "uploadImage") {
                output = node.data?.image || null;
            }
            else if (node.type === "uploadVideo") {
                output = node.data?.video || null;
            }

            else if (node.type === "llm") {
                // Get parent results
                const parentEdges = edges.filter(
                    (e) => e.target === nodeId
                );

                const parentOutputs = parentEdges
                    .map((e) => results[e.source])
                    .filter(Boolean);

                // Separate text + image
                const textInputs: string[] = [];
                let imageInput: string | null = null;

                parentOutputs.forEach((output) => {
                    if (typeof output === "string" && output.startsWith("data:image")) {
                        imageInput = output; // image base64
                    } else if (typeof output === "string") {
                        textInputs.push(output);
                    }
                });

                const finalPrompt =
                    textInputs.join("\n") || "Describe this image.";

                const handle = await llmTask.trigger({
                    prompt: finalPrompt,
                    image: imageInput, // 🔥 now multimodal
                });

                const run = await runs.poll(handle.id);
                output = run.output;
            }


            else if (node.type === "extract") {
                const parentEdge = edges.find(
                    (e) => e.target === nodeId
                );

                const video = results[parentEdge?.source];

                const handle = await extractFrameTask.trigger({
                    video,
                    timestamp: 1,
                });

                const run = await runs.poll(handle.id);
                output = run.output;
            }

            else if (node.type === "crop") {
                const parentEdge = edges.find(
                    (e) => e.target === nodeId
                );

                const image = results[parentEdge?.source];

                const handle = await cropTask.trigger({
                    image,
                    mode: node.data?.mode || "full",
                });

                const run = await runs.poll(handle.id);
                output = run.output;
            }

            results[nodeId] = output;

            // 2️⃣ Update NodeRun to success
            await prisma.nodeRun.update({
                where: { id: nodeRun.id },
                data: {
                    status: "success",
                    output,
                    finishedAt: new Date(),
                },
            });

        } catch {
            await prisma.nodeRun.update({
                where: { id: nodeRun.id },
                data: {
                    status: "error",
                    finishedAt: new Date(),
                },
            });
        }

        // Push next nodes
        adj[nodeId].forEach((nei) => {
            incoming[nei]--;
            if (incoming[nei] === 0) queue.push(nei);
        });
    }

    // Finish workflow
    await prisma.workflowRun.update({
        where: { id: runId },
        data: {
            status: "success",
            finishedAt: new Date(),
        },
    });
}
