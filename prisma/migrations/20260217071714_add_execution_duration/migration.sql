-- AlterTable
ALTER TABLE "NodeRun" ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkflowRun" ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3);
