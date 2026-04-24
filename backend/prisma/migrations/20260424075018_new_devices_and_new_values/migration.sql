/*
  Warnings:

  - Added the required column `targetTemp` to the `Thermostat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Camera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "frameRate" REAL NOT NULL,
    CONSTRAINT "Camera_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessControl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "AccessControl_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "type" TEXT NOT NULL,
    CONSTRAINT "IoTDevice_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IoTDevice" ("areaId", "brand", "createdAt", "description", "id", "imageUrl", "model", "name", "status", "type", "uniqueName") SELECT "areaId", "brand", "createdAt", "description", "id", "imageUrl", "model", "name", "status", "type", "uniqueName" FROM "IoTDevice";
DROP TABLE "IoTDevice";
ALTER TABLE "new_IoTDevice" RENAME TO "IoTDevice";
CREATE UNIQUE INDEX "IoTDevice_uniqueName_key" ON "IoTDevice"("uniqueName");
CREATE TABLE "new_Thermostat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "targetTemp" REAL NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'OFF',
    CONSTRAINT "Thermostat_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Thermostat" ("deviceId", "id", "mode", "temperature") SELECT "deviceId", "id", "mode", "temperature" FROM "Thermostat";
DROP TABLE "Thermostat";
ALTER TABLE "new_Thermostat" RENAME TO "Thermostat";
CREATE UNIQUE INDEX "Thermostat_deviceId_key" ON "Thermostat"("deviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Camera_deviceId_key" ON "Camera"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessControl_deviceId_key" ON "AccessControl"("deviceId");
