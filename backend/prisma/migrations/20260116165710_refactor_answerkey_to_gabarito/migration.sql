
DROP TABLE IF EXISTS "AnswerKey";


CREATE TABLE "Gabarito" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "respostas" TEXT NOT NULL,
  "configuracao" TEXT,
  "usuarioId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
