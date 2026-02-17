import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { extractFrameTask } from "@/trigger/tasks/extract-frame-task";
import { cropTask } from "@/trigger/tasks/crop-task";
import { llmTask } from "@/trigger/tasks/llm-task";
import { runs } from "@trigger.dev/sdk/v3";

/**
 * POST /api/run-workflow
 */
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

    // 🔥 Run in background
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

/**
 * 🔥 PARALLEL DAG EXECUTION ENGINE
 */
async function executeWorkflow(
  runId: string,
  nodes: any[],
  edges: any[]
) {
  const results: Record<string, any> = {};

  // -----------------------------
  // 1️⃣ Build DAG
  // -----------------------------
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

  // -----------------------------
  // 🔥 2️⃣ CYCLE DETECTION
  // -----------------------------
  const tempIncoming = { ...incoming };
  const queue = Object.keys(tempIncoming).filter(
    (id) => tempIncoming[id] === 0
  );

  let processedCount = 0;

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    processedCount++;

    adj[nodeId].forEach((child) => {
      tempIncoming[child]--;
      if (tempIncoming[child] === 0) {
        queue.push(child);
      }
    });
  }

  if (processedCount !== nodes.length) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: "error",
        finishedAt: new Date(),
      },
    });

    console.error("Workflow contains a cycle. Execution aborted.");
    return;
  }

  // -----------------------------
  // 3️⃣ First Level
  // -----------------------------
  let currentLevel = Object.keys(incoming).filter(
    (id) => incoming[id] === 0
  );

  // -----------------------------
  // 4️⃣ Process Levels
  // -----------------------------
  while (currentLevel.length > 0) {
    await Promise.all(
      currentLevel.map(async (nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const nodeRun = await prisma.nodeRun.create({
          data: {
            workflowRunId: runId,
            nodeId,
            status: "running",
            input: node.data || {},
          },
        });

        try {
          const output = await executeSingleNode(
            node,
            results,
            edges
          );

          results[nodeId] = output;

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
              status: "success",
              output,
              finishedAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Node execution error:", error);

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
              status: "error",
              finishedAt: new Date(),
            },
          });
        }
      })
    );

    // -----------------------------
    // Prepare Next Level
    // -----------------------------
    const nextLevel: string[] = [];

    currentLevel.forEach((nodeId) => {
      adj[nodeId].forEach((child) => {
        incoming[child]--;
        if (incoming[child] === 0) {
          nextLevel.push(child);
        }
      });
    });

    currentLevel = nextLevel;
  }

  // -----------------------------
  // 5️⃣ Finish Workflow
  // -----------------------------
  await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status: "success",
      finishedAt: new Date(),
    },
  });
}

/**
 * 🔥 Single Node Execution Logic
 */
async function executeSingleNode(
  node: any,
  results: Record<string, any>,
  edges: any[]
) {
  if (node.type === "prompt") {
    return node.data?.prompt || "";
  }

  if (node.type === "uploadImage") {
    return node.data?.image || null;
  }

  if (node.type === "uploadVideo") {
    return node.data?.video || null;
  }

  if (node.type === "llm") {
    const parentEdges = edges.filter(
      (e) => e.target === node.id
    );

    const parentOutputs = parentEdges
      .map((e) => results[e.source])
      .filter(Boolean);

    const textInputs: string[] = [];
    let imageInput: string | null = null;

    parentOutputs.forEach((output) => {
      if (
        typeof output === "string" &&
        output.startsWith("data:image")
      ) {
        imageInput = output;
      } else if (typeof output === "string") {
        textInputs.push(output);
      }
    });

    const finalPrompt =
      textInputs.join("\n") || "Describe this image.";

    const handle = await llmTask.trigger({
      prompt: finalPrompt,
      image: imageInput,
    });

    const run = await runs.poll(handle.id);

    if (!run.isSuccess) {
      throw new Error("LLM task failed");
    }

    return run.output;
  }

  if (node.type === "extract") {
    const parentEdge = edges.find(
      (e) => e.target === node.id
    );

    const video = results[parentEdge?.source!];

    const handle = await extractFrameTask.trigger({
      video,
      timestamp: node.data?.timestamp ?? 1,
    });

    const run = await runs.poll(handle.id);

    if (!run.isSuccess) {
      throw new Error("Extract frame task failed");
    }

    return run.output;
  }

  if (node.type === "crop") {
    const parentEdge = edges.find(
      (e) => e.target === node.id
    );

    const image = results[parentEdge?.source!];

    const handle = await cropTask.trigger({
      image,
      mode: node.data?.mode || "full",
    });

    const run = await runs.poll(handle.id);

    if (!run.isSuccess) {
      throw new Error("Crop task failed");
    }

    return run.output;
  }

  return null;
}
