-- CreateTable
CREATE TABLE "CurriculumSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CurriculumGradeLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CurriculumTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "CurriculumCompetency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gradeLevelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CurriculumCompetency_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "CurriculumGradeLevel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CurriculumResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedTime" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CurriculumResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CurriculumTopic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CurriculumGradeLevelToCurriculumSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CurriculumGradeLevelToCurriculumSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "CurriculumGradeLevel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CurriculumGradeLevelToCurriculumSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "CurriculumSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumSubject_code_key" ON "CurriculumSubject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumCompetency_code_key" ON "CurriculumCompetency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_CurriculumGradeLevelToCurriculumSubject_AB_unique" ON "_CurriculumGradeLevelToCurriculumSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_CurriculumGradeLevelToCurriculumSubject_B_index" ON "_CurriculumGradeLevelToCurriculumSubject"("B");
