/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `CurriculumTopic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CurriculumTopic_code_key" ON "CurriculumTopic"("code");
