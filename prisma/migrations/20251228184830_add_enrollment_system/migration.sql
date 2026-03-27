-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "enrolledBy" TEXT,
    "notes" TEXT,
    CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    CONSTRAINT "MaterialAssignment_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "score" REAL,
    "timeSpent" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastAccessed" DATETIME,
    CONSTRAINT "MaterialProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialProgress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CourseEnrollment_studentId_idx" ON "CourseEnrollment"("studentId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_status_idx" ON "CourseEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseId_studentId_key" ON "CourseEnrollment"("courseId", "studentId");

-- CreateIndex
CREATE INDEX "MaterialAssignment_studentId_idx" ON "MaterialAssignment"("studentId");

-- CreateIndex
CREATE INDEX "MaterialAssignment_status_idx" ON "MaterialAssignment"("status");

-- CreateIndex
CREATE INDEX "MaterialAssignment_dueDate_idx" ON "MaterialAssignment"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialAssignment_materialId_studentId_key" ON "MaterialAssignment"("materialId", "studentId");

-- CreateIndex
CREATE INDEX "MaterialProgress_studentId_idx" ON "MaterialProgress"("studentId");

-- CreateIndex
CREATE INDEX "MaterialProgress_completed_idx" ON "MaterialProgress"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialProgress_studentId_materialId_key" ON "MaterialProgress"("studentId", "materialId");
