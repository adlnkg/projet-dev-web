-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Actuality" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/actualities/default-actuality.png',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    CONSTRAINT "Actuality_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Actuality" ("content", "createdAt", "id", "imageUrl", "title") SELECT "content", "createdAt", "id", "imageUrl", "title" FROM "Actuality";
DROP TABLE "Actuality";
ALTER TABLE "new_Actuality" RENAME TO "Actuality";
CREATE TABLE "new_Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/areas/default-area.svg',
    "parentAreaId" INTEGER,
    "ownerId" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "Area_parentAreaId_fkey" FOREIGN KEY ("parentAreaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Area_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Area" ("description", "id", "imageUrl", "name", "parentAreaId", "type") SELECT "description", "id", "imageUrl", "name", "parentAreaId", "type" FROM "Area";
DROP TABLE "Area";
ALTER TABLE "new_Area" RENAME TO "Area";
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
    "ownerId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'WORKSHOP',
    CONSTRAINT "Event_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("areaId", "createdAt", "description", "endTime", "id", "imageUrl", "maxParticipants", "numberOfParticipants", "organizer", "price", "startTime", "title", "type") SELECT "areaId", "createdAt", "description", "endTime", "id", "imageUrl", "maxParticipants", "numberOfParticipants", "organizer", "price", "startTime", "title", "type" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_IoTDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uniqueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/devices/default-device.png',
    "electricityConsumption" REAL NOT NULL DEFAULT 0,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "areaId" INTEGER NOT NULL,
    "ownerId" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "IoTDevice_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IoTDevice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_IoTDevice" ("active", "areaId", "brand", "createdAt", "description", "electricityConsumption", "id", "imageUrl", "lastUpdated", "model", "name", "status", "type", "uniqueName") SELECT "active", "areaId", "brand", "createdAt", "description", "electricityConsumption", "id", "imageUrl", "lastUpdated", "model", "name", "status", "type", "uniqueName" FROM "IoTDevice";
DROP TABLE "IoTDevice";
ALTER TABLE "new_IoTDevice" RENAME TO "IoTDevice";
CREATE UNIQUE INDEX "IoTDevice_uniqueName_key" ON "IoTDevice"("uniqueName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
