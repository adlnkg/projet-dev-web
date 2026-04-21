-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" TEXT,
    "otpExpires" DATETIME,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastName" TEXT,
    "firstName" TEXT,
    "sex" TEXT,
    "age" INTEGER,
    "role" TEXT NOT NULL,
    "memberType" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("age", "avatarUrl", "createdAt", "email", "firstName", "id", "isVerified", "lastName", "login", "memberType", "otp", "otpExpires", "password", "role", "sex") SELECT "age", "avatarUrl", "createdAt", "email", "firstName", "id", "isVerified", "lastName", "login", "memberType", "otp", "otpExpires", "password", "role", "sex" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
