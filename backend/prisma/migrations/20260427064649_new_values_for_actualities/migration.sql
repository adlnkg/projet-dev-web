-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Actuality" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/actualities/default-actuality.png',
    "type" TEXT NOT NULL DEFAULT 'NEWS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    CONSTRAINT "Actuality_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Actuality" ("content", "createdAt", "id", "imageUrl", "ownerId", "title") SELECT "content", "createdAt", "id", "imageUrl", "ownerId", "title" FROM "Actuality";
DROP TABLE "Actuality";
ALTER TABLE "new_Actuality" RENAME TO "Actuality";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
