-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/areas/default-area.svg',
    "parentAreaId" INTEGER,
    "type" TEXT NOT NULL,
    CONSTRAINT "Area_parentAreaId_fkey" FOREIGN KEY ("parentAreaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Area" ("description", "id", "name", "parentAreaId", "type") SELECT "description", "id", "name", "parentAreaId", "type" FROM "Area";
DROP TABLE "Area";
ALTER TABLE "new_Area" RENAME TO "Area";
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    CONSTRAINT "Event_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("areaId", "createdAt", "description", "endTime", "id", "maxParticipants", "numberOfParticipants", "organizer", "startTime", "title") SELECT "areaId", "createdAt", "description", "endTime", "id", "maxParticipants", "numberOfParticipants", "organizer", "startTime", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_IoTDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uniqueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/devices/default-device.png',
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "areaId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "IoTDevice_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IoTDevice" ("areaId", "brand", "createdAt", "description", "id", "model", "name", "status", "type", "uniqueName") SELECT "areaId", "brand", "createdAt", "description", "id", "model", "name", "status", "type", "uniqueName" FROM "IoTDevice";
DROP TABLE "IoTDevice";
ALTER TABLE "new_IoTDevice" RENAME TO "IoTDevice";
CREATE UNIQUE INDEX "IoTDevice_uniqueName_key" ON "IoTDevice"("uniqueName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
