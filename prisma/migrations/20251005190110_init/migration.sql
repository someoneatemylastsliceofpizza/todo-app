-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "important" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "todoId" TEXT,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "newname" TEXT,
    "newnote" TEXT,
    "important" INTEGER NOT NULL,
    "newimportant" INTEGER,
    "timestamp" DATETIME NOT NULL,
    "newtimestamp" DATETIME
);
