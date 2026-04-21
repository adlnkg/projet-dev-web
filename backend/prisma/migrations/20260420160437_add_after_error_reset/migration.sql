/*
  Warnings:

  - You are about to drop the column `name` on the `Building` table. All the data in the column will be lost.
  - You are about to drop the column `floorId` on the `Classroom` table. All the data in the column will be lost.
  - You are about to drop the column `buildingId` on the `Floor` table. All the data in the column will be lost.
  - You are about to drop the column `isConnected` on the `IoTDevice` table. All the data in the column will be lost.
  - You are about to drop the column `floorId` on the `TechnicalRoom` table. All the data in the column will be lost.
  - Made the column `description` on table `Area` required. This step will fail if there are existing NULL values in that column.
  - Made the column `brand` on table `IoTDevice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `IoTDevice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model` on table `IoTDevice` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Thermostat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'OFF',
    CONSTRAINT "Thermostat_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizer" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "numberOfParticipants" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Event_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Actuality" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentAreaId" INTEGER,
    "type" TEXT NOT NULL,
    CONSTRAINT "Area_parentAreaId_fkey" FOREIGN KEY ("parentAreaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Area" ("description", "id", "name", "type") SELECT "description", "id", "name", "type" FROM "Area";
DROP TABLE "Area";
ALTER TABLE "new_Area" RENAME TO "Area";
CREATE TABLE "new_Building" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Building_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Building" ("address", "areaId", "id") SELECT "address", "areaId", "id" FROM "Building";
DROP TABLE "Building";
ALTER TABLE "new_Building" RENAME TO "Building";
CREATE UNIQUE INDEX "Building_areaId_key" ON "Building"("areaId");
CREATE TABLE "new_Classroom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classroomNumber" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Classroom_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Classroom" ("areaId", "classroomNumber", "id") SELECT "areaId", "classroomNumber", "id" FROM "Classroom";
DROP TABLE "Classroom";
ALTER TABLE "new_Classroom" RENAME TO "Classroom";
CREATE UNIQUE INDEX "Classroom_areaId_key" ON "Classroom"("areaId");
CREATE TABLE "new_Floor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorNumber" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Floor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Floor" ("areaId", "floorNumber", "id") SELECT "areaId", "floorNumber", "id" FROM "Floor";
DROP TABLE "Floor";
ALTER TABLE "new_Floor" RENAME TO "Floor";
CREATE UNIQUE INDEX "Floor_areaId_key" ON "Floor"("areaId");
CREATE TABLE "new_IoTDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uniqueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE "new_TechnicalRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomNumber" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "TechnicalRoom_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TechnicalRoom" ("areaId", "id", "roomNumber") SELECT "areaId", "id", "roomNumber" FROM "TechnicalRoom";
DROP TABLE "TechnicalRoom";
ALTER TABLE "new_TechnicalRoom" RENAME TO "TechnicalRoom";
CREATE UNIQUE INDEX "TechnicalRoom_areaId_key" ON "TechnicalRoom"("areaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Thermostat_deviceId_key" ON "Thermostat"("deviceId");
