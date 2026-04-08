/*
  Warnings:

  - The primary key for the `IoTDevice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `IoTDevice` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `areaId` to the `IoTDevice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Building" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Building_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classroomNumber" INTEGER NOT NULL,
    "floorId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Classroom_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Classroom_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechnicalRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomNumber" INTEGER NOT NULL,
    "floorId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "TechnicalRoom_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechnicalRoom_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Floor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorNumber" INTEGER NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Floor_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Floor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" REAL NOT NULL,
    CONSTRAINT "Sensor_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InteractiveWhiteboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "screenSize" REAL NOT NULL,
    CONSTRAINT "InteractiveWhiteboard_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Light" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "brightness" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    CONSTRAINT "Light_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IoTDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "Activity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User2" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "duration" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    CONSTRAINT "Video_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "body" TEXT NOT NULL,
    "activityId" INTEGER NOT NULL,
    CONSTRAINT "Article_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User2" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Whiteboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "size" TEXT NOT NULL,
    "isInteractive" BOOLEAN NOT NULL,
    "classroomId" INTEGER NOT NULL,
    CONSTRAINT "Whiteboard_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IoTDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uniqueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brand" TEXT,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "areaId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "IoTDevice_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_IoTDevice" ("brand", "createdAt", "description", "id", "isConnected", "model", "name", "status", "type", "uniqueName") SELECT "brand", "createdAt", "description", "id", "isConnected", "model", "name", "status", "type", "uniqueName" FROM "IoTDevice";
DROP TABLE "IoTDevice";
ALTER TABLE "new_IoTDevice" RENAME TO "IoTDevice";
CREATE UNIQUE INDEX "IoTDevice_uniqueName_key" ON "IoTDevice"("uniqueName");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "sex" TEXT,
    "age" INTEGER,
    "role" TEXT NOT NULL,
    "memberType" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("age", "avatarUrl", "createdAt", "firstName", "id", "login", "memberType", "name", "password", "role", "sex") SELECT "age", "avatarUrl", "createdAt", "firstName", "id", "login", "memberType", "name", "password", "role", "sex" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Building_areaId_key" ON "Building"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_areaId_key" ON "Classroom"("areaId");

-- CreateIndex
CREATE INDEX "Classroom_floorId_idx" ON "Classroom"("floorId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_floorId_classroomNumber_key" ON "Classroom"("floorId", "classroomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalRoom_areaId_key" ON "TechnicalRoom"("areaId");

-- CreateIndex
CREATE INDEX "TechnicalRoom_floorId_idx" ON "TechnicalRoom"("floorId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalRoom_floorId_roomNumber_key" ON "TechnicalRoom"("floorId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Floor_areaId_key" ON "Floor"("areaId");

-- CreateIndex
CREATE INDEX "Floor_buildingId_idx" ON "Floor"("buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "Floor_buildingId_floorNumber_key" ON "Floor"("buildingId", "floorNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_deviceId_key" ON "Sensor"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "InteractiveWhiteboard_deviceId_key" ON "InteractiveWhiteboard"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Light_deviceId_key" ON "Light"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_activityId_key" ON "Video"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_activityId_key" ON "Article"("activityId");

-- CreateIndex
CREATE INDEX "Whiteboard_classroomId_idx" ON "Whiteboard"("classroomId");
