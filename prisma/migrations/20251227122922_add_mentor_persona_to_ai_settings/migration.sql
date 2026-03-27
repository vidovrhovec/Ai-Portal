-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AISettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "enableWebTTS" BOOLEAN NOT NULL DEFAULT false,
    "ttsProvider" TEXT NOT NULL DEFAULT 'web',
    "ttsModel" TEXT,
    "enableWebSTT" BOOLEAN NOT NULL DEFAULT false,
    "sttProvider" TEXT NOT NULL DEFAULT 'web',
    "sttModel" TEXT,
    "enableInternetSearch" BOOLEAN NOT NULL DEFAULT false,
    "searchProvider" TEXT NOT NULL DEFAULT 'serpapi',
    "searchApiKey" TEXT,
    "userLanguage" TEXT NOT NULL DEFAULT 'sl',
    "userCountry" TEXT NOT NULL DEFAULT 'SI',
    "educationLevel" TEXT NOT NULL DEFAULT 'secondary',
    "mentorPersona" TEXT NOT NULL DEFAULT 'friendly',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AISettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AISettings" ("apiKey", "baseUrl", "createdAt", "educationLevel", "enableInternetSearch", "enableWebSTT", "enableWebTTS", "id", "model", "provider", "searchApiKey", "searchProvider", "sttModel", "sttProvider", "ttsModel", "ttsProvider", "updatedAt", "userCountry", "userId", "userLanguage") SELECT "apiKey", "baseUrl", "createdAt", "educationLevel", "enableInternetSearch", "enableWebSTT", "enableWebTTS", "id", "model", "provider", "searchApiKey", "searchProvider", "sttModel", "sttProvider", "ttsModel", "ttsProvider", "updatedAt", "userCountry", "userId", "userLanguage" FROM "AISettings";
DROP TABLE "AISettings";
ALTER TABLE "new_AISettings" RENAME TO "AISettings";
CREATE UNIQUE INDEX "AISettings_userId_key" ON "AISettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
