/*
  Warnings:

  - You are about to drop the column `code` on the `CurriculumTopic` table. All the data in the column will be lost.
  - You are about to drop the column `studyTimeMinutes` on the `DailyActivity` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `MaterialAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `QuizSubmission` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `QuizSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QuizSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CourseForum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseForum_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseForumMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseForumMessage_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "CourseForum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseForumMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CurriculumTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "competencies" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "prerequisites" TEXT NOT NULL,
    "learningObjectives" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CurriculumTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CurriculumSubject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CurriculumTopic_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "CurriculumGradeLevel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CurriculumTopic" ("competencies", "createdAt", "description", "difficulty", "gradeLevelId", "id", "keywords", "learningObjectives", "name", "prerequisites", "subjectId", "updatedAt") SELECT "competencies", "createdAt", "description", "difficulty", "gradeLevelId", "id", "keywords", "learningObjectives", "name", "prerequisites", "subjectId", "updatedAt" FROM "CurriculumTopic";
DROP TABLE "CurriculumTopic";
ALTER TABLE "new_CurriculumTopic" RENAME TO "CurriculumTopic";
CREATE INDEX "CurriculumTopic_subjectId_idx" ON "CurriculumTopic"("subjectId");
CREATE INDEX "CurriculumTopic_gradeLevelId_idx" ON "CurriculumTopic"("gradeLevelId");
CREATE INDEX "CurriculumTopic_gradeLevelId_difficulty_idx" ON "CurriculumTopic"("gradeLevelId", "difficulty");
CREATE INDEX "CurriculumTopic_keywords_idx" ON "CurriculumTopic"("keywords");
CREATE TABLE "new_DailyActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "materialsRead" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "streakMaintained" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DailyActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DailyActivity" ("date", "id", "materialsRead", "pointsEarned", "quizzesCompleted", "streakMaintained", "studentId") SELECT "date", "id", "materialsRead", "pointsEarned", "quizzesCompleted", "streakMaintained", "studentId" FROM "DailyActivity";
DROP TABLE "DailyActivity";
ALTER TABLE "new_DailyActivity" RENAME TO "DailyActivity";
CREATE INDEX "DailyActivity_studentId_idx" ON "DailyActivity"("studentId");
CREATE INDEX "DailyActivity_date_idx" ON "DailyActivity"("date");
CREATE UNIQUE INDEX "DailyActivity_studentId_date_key" ON "DailyActivity"("studentId", "date");
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
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FakeTest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FakeTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FakeTest" ("assignedStudents", "createdAt", "createdById", "difficulty", "grade", "id", "questions", "studentId", "subject", "topic", "updatedAt") SELECT "assignedStudents", "createdAt", "createdById", "difficulty", "grade", "id", "questions", "studentId", "subject", "topic", "updatedAt" FROM "FakeTest";
DROP TABLE "FakeTest";
ALTER TABLE "new_FakeTest" RENAME TO "FakeTest";
CREATE TABLE "new_MaterialAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    CONSTRAINT "MaterialAssignment_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MaterialAssignment" ("dueDate", "id", "materialId", "priority", "status", "studentId") SELECT "dueDate", "id", "materialId", "priority", "status", "studentId" FROM "MaterialAssignment";
DROP TABLE "MaterialAssignment";
ALTER TABLE "new_MaterialAssignment" RENAME TO "MaterialAssignment";
CREATE INDEX "MaterialAssignment_studentId_idx" ON "MaterialAssignment"("studentId");
CREATE INDEX "MaterialAssignment_status_idx" ON "MaterialAssignment"("status");
CREATE INDEX "MaterialAssignment_dueDate_idx" ON "MaterialAssignment"("dueDate");
CREATE UNIQUE INDEX "MaterialAssignment_materialId_studentId_key" ON "MaterialAssignment"("materialId", "studentId");
CREATE TABLE "new_QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_QuizAttempt" ("difficulty", "id", "maxScore", "quizId", "score", "timeSpent", "timestamp", "topics", "userId") SELECT "difficulty", "id", "maxScore", "quizId", "score", "timeSpent", "timestamp", "topics", "userId" FROM "QuizAttempt";
DROP TABLE "QuizAttempt";
ALTER TABLE "new_QuizAttempt" RENAME TO "QuizAttempt";
CREATE INDEX "QuizAttempt_userId_timestamp_idx" ON "QuizAttempt"("userId", "timestamp");
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");
CREATE TABLE "new_QuizSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "score" INTEGER NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizSubmission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuizSubmission_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_QuizSubmission" ("id", "quizId", "score", "studentId", "submittedAt") SELECT "id", "quizId", "score", "studentId", "submittedAt" FROM "QuizSubmission";
DROP TABLE "QuizSubmission";
ALTER TABLE "new_QuizSubmission" RENAME TO "QuizSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CourseForum_courseId_key" ON "CourseForum"("courseId");
