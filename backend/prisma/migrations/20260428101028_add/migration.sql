-- CreateTable
CREATE TABLE "IoTDeviceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "previousValue" TEXT,
    "currentValue" TEXT,
    "numericValue" REAL,
    "unit" TEXT,
    "note" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IoTDeviceHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessControl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "powerWatts" REAL NOT NULL DEFAULT 0,
    "lastOpenedAt" DATETIME,
    "lastClosedAt" DATETIME,
    CONSTRAINT "AccessControl_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AccessControl" ("deviceId", "id", "status") SELECT "deviceId", "id", "status" FROM "AccessControl";
DROP TABLE "AccessControl";
ALTER TABLE "new_AccessControl" RENAME TO "AccessControl";
CREATE UNIQUE INDEX "AccessControl_deviceId_key" ON "AccessControl"("deviceId");
CREATE TABLE "new_Camera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "frameRate" REAL NOT NULL,
    "powerWatts" REAL NOT NULL DEFAULT 0,
    "streamingBitrateKbps" INTEGER NOT NULL DEFAULT 0,
    "lastRecordingStartedAt" DATETIME,
    "lastRecordingStoppedAt" DATETIME,
    CONSTRAINT "Camera_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Camera" ("deviceId", "frameRate", "id", "resolution") SELECT "deviceId", "frameRate", "id", "resolution" FROM "Camera";
DROP TABLE "Camera";
ALTER TABLE "new_Camera" RENAME TO "Camera";
CREATE UNIQUE INDEX "Camera_deviceId_key" ON "Camera"("deviceId");
CREATE TABLE "new_InteractiveWhiteboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "screenSize" REAL NOT NULL,
    "powerWatts" REAL NOT NULL DEFAULT 0,
    "lastSwitchedOnAt" DATETIME,
    "lastSwitchedOffAt" DATETIME,
    CONSTRAINT "InteractiveWhiteboard_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InteractiveWhiteboard" ("deviceId", "id", "resolution", "screenSize") SELECT "deviceId", "id", "resolution", "screenSize" FROM "InteractiveWhiteboard";
DROP TABLE "InteractiveWhiteboard";
ALTER TABLE "new_InteractiveWhiteboard" RENAME TO "InteractiveWhiteboard";
CREATE UNIQUE INDEX "InteractiveWhiteboard_deviceId_key" ON "InteractiveWhiteboard"("deviceId");
CREATE TABLE "new_IoTDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uniqueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT NOT NULL DEFAULT 'images/devices/default-device.png',
    "electricityConsumption" REAL NOT NULL DEFAULT 0,
    "nominalPowerWatts" REAL NOT NULL DEFAULT 0,
    "averageDailyUsageHours" REAL NOT NULL DEFAULT 0,
    "maintenanceIntervalDays" INTEGER NOT NULL DEFAULT 0,
    "lastPowerOnAt" DATETIME,
    "lastPowerOffAt" DATETIME,
    "lastMaintenanceAt" DATETIME,
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
INSERT INTO "new_IoTDevice" ("active", "areaId", "brand", "createdAt", "description", "electricityConsumption", "id", "imageUrl", "lastUpdated", "model", "name", "ownerId", "status", "type", "uniqueName") SELECT "active", "areaId", "brand", "createdAt", "description", "electricityConsumption", "id", "imageUrl", "lastUpdated", "model", "name", "ownerId", "status", "type", "uniqueName" FROM "IoTDevice";
DROP TABLE "IoTDevice";
ALTER TABLE "new_IoTDevice" RENAME TO "IoTDevice";
CREATE UNIQUE INDEX "IoTDevice_uniqueName_key" ON "IoTDevice"("uniqueName");
CREATE TABLE "new_Light" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "brightness" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "powerWatts" REAL NOT NULL DEFAULT 0,
    "colorTemperature" INTEGER,
    "lastSwitchedOnAt" DATETIME,
    "lastSwitchedOffAt" DATETIME,
    CONSTRAINT "Light_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Light" ("brightness", "color", "deviceId", "id") SELECT "brightness", "color", "deviceId", "id" FROM "Light";
DROP TABLE "Light";
ALTER TABLE "new_Light" RENAME TO "Light";
CREATE UNIQUE INDEX "Light_deviceId_key" ON "Light"("deviceId");
CREATE TABLE "new_Sensor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" REAL NOT NULL,
    "samplingIntervalSeconds" INTEGER NOT NULL DEFAULT 60,
    "batteryLevel" REAL NOT NULL DEFAULT 100,
    "lastReadingAt" DATETIME,
    CONSTRAINT "Sensor_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Sensor" ("deviceId", "id", "timestamp", "value") SELECT "deviceId", "id", "timestamp", "value" FROM "Sensor";
DROP TABLE "Sensor";
ALTER TABLE "new_Sensor" RENAME TO "Sensor";
CREATE UNIQUE INDEX "Sensor_deviceId_key" ON "Sensor"("deviceId");
CREATE TABLE "new_Thermostat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "targetTemp" REAL NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'OFF',
    "powerWatts" REAL NOT NULL DEFAULT 0,
    "lastHeatingAt" DATETIME,
    "lastCoolingAt" DATETIME,
    CONSTRAINT "Thermostat_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Thermostat" ("deviceId", "id", "mode", "targetTemp", "temperature") SELECT "deviceId", "id", "mode", "targetTemp", "temperature" FROM "Thermostat";
DROP TABLE "Thermostat";
ALTER TABLE "new_Thermostat" RENAME TO "Thermostat";
CREATE UNIQUE INDEX "Thermostat_deviceId_key" ON "Thermostat"("deviceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "IoTDeviceHistory_deviceId_recordedAt_idx" ON "IoTDeviceHistory"("deviceId", "recordedAt");

-- CreateIndex
CREATE INDEX "IoTDeviceHistory_fieldKey_idx" ON "IoTDeviceHistory"("fieldKey");
