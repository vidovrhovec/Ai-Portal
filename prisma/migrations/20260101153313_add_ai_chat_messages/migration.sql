-- AlterTable
ALTER TABLE "CurriculumTopic" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "CurriculumTopic" ADD COLUMN "startDate" DATETIME;

-- CreateTable
CREATE TABLE "ObserverLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "ObserverLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObserverLink_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ObserverLink_token_key" ON "ObserverLink"("token");

-- CreateIndex
CREATE INDEX "ObserverLink_studentId_idx" ON "ObserverLink"("studentId");

-- CreateIndex
CREATE INDEX "ObserverLink_createdBy_idx" ON "ObserverLink"("createdBy");

-- CreateIndex
CREATE INDEX "AIChatMessage_userId_idx" ON "AIChatMessage"("userId");

-- CreateIndex
CREATE INDEX "AIChatMessage_createdAt_idx" ON "AIChatMessage"("createdAt");
