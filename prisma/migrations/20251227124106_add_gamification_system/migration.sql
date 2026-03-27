-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "Achievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "materialsRead" INTEGER NOT NULL DEFAULT 0,
    "studyTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "streakMaintained" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DailyActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeatureUnlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "gradeLevel" INTEGER,
    "schoolName" TEXT,
    "interests" TEXT,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "coursesCompleted" INTEGER NOT NULL DEFAULT 0,
    "quizzesTaken" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL DEFAULT 0.0,
    "lastActivity" DATETIME,
    "aiInsights" TEXT,
    "lastInsightUpdate" DATETIME,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDate" DATETIME,
    "unlockedThemes" TEXT NOT NULL DEFAULT 'default',
    "unlockedFeatures" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentProfile" ("aiInsights", "averageScore", "coursesCompleted", "createdAt", "gradeLevel", "id", "interests", "lastActivity", "lastInsightUpdate", "quizzesTaken", "schoolName", "studentId", "totalStudyTime", "updatedAt") SELECT "aiInsights", "averageScore", "coursesCompleted", "createdAt", "gradeLevel", "id", "interests", "lastActivity", "lastInsightUpdate", "quizzesTaken", "schoolName", "studentId", "totalStudyTime", "updatedAt" FROM "StudentProfile";
DROP TABLE "StudentProfile";
ALTER TABLE "new_StudentProfile" RENAME TO "StudentProfile";
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_studentId_type_title_key" ON "Achievement"("studentId", "type", "title");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_studentId_date_key" ON "DailyActivity"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureUnlock_name_key" ON "FeatureUnlock"("name");
