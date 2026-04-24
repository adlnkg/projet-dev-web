-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" REAL NOT NULL DEFAULT 0.0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizer" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/events/default-event.png',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "numberOfParticipants" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORKSHOP',
    CONSTRAINT "Event_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("areaId", "createdAt", "description", "endTime", "id", "imageUrl", "maxParticipants", "numberOfParticipants", "organizer", "startTime", "title") SELECT "areaId", "createdAt", "description", "endTime", "id", "imageUrl", "maxParticipants", "numberOfParticipants", "organizer", "startTime", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
