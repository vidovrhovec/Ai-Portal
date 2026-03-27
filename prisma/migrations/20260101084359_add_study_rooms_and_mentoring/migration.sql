-- CreateTable
CREATE TABLE "StudyRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudyRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyRoomParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studyRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyRoomParticipant_studyRoomId_fkey" FOREIGN KEY ("studyRoomId") REFERENCES "StudyRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudyRoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentoringSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MentoringSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MentoringSession_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subjects" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "bio" TEXT,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "availability" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StudyRoom_isActive_idx" ON "StudyRoom"("isActive");

-- CreateIndex
CREATE INDEX "StudyRoom_subject_idx" ON "StudyRoom"("subject");

-- CreateIndex
CREATE INDEX "StudyRoomParticipant_studyRoomId_idx" ON "StudyRoomParticipant"("studyRoomId");

-- CreateIndex
CREATE INDEX "StudyRoomParticipant_userId_idx" ON "StudyRoomParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyRoomParticipant_studyRoomId_userId_key" ON "StudyRoomParticipant"("studyRoomId", "userId");

-- CreateIndex
CREATE INDEX "MentoringSession_mentorId_idx" ON "MentoringSession"("mentorId");

-- CreateIndex
CREATE INDEX "MentoringSession_menteeId_idx" ON "MentoringSession"("menteeId");

-- CreateIndex
CREATE INDEX "MentoringSession_status_idx" ON "MentoringSession"("status");

-- CreateIndex
CREATE INDEX "MentoringSession_scheduledAt_idx" ON "MentoringSession"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");
