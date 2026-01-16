/*
  Warnings:

  - Made the column `configuracao` on table `Gabarito` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Gabarito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "respostas" TEXT NOT NULL,
    "configuracao" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Gabarito" ("configuracao", "createdAt", "id", "respostas", "titulo", "updatedAt", "usuarioId") SELECT "configuracao", "createdAt", "id", "respostas", "titulo", "updatedAt", "usuarioId" FROM "Gabarito";
DROP TABLE "Gabarito";
ALTER TABLE "new_Gabarito" RENAME TO "Gabarito";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
