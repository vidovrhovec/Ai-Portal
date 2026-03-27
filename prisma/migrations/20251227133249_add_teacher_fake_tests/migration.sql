-- CreateTable
CREATE TABLE "FakeTestAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FakeTestAssignment_testId_fkey" FOREIGN KEY ("testId") REFERENCES "FakeTest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FakeTestAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FakeTestAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FakeTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "questions" TEXT NOT NULL,
    "assignedStudents" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FakeTest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FakeTest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FakeTest" ("createdAt", "difficulty", "grade", "id", "questions", "studentId", "subject", "topic", "updatedAt") SELECT "createdAt", "difficulty", "grade", "id", "questions", "studentId", "subject", "topic", "updatedAt" FROM "FakeTest";
DROP TABLE "FakeTest";
ALTER TABLE "new_FakeTest" RENAME TO "FakeTest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "FakeTestAssignment_testId_studentId_key" ON "FakeTestAssignment"("testId", "studentId");
