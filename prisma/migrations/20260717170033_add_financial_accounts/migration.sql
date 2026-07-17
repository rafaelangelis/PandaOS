-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'caixa',
    "initialBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SaleInstallment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "paidAt" DATETIME,
    "accountId" TEXT,
    CONSTRAINT "SaleInstallment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleInstallment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SaleInstallment" ("amount", "dueDate", "id", "number", "paidAt", "saleId", "status") SELECT "amount", "dueDate", "id", "number", "paidAt", "saleId", "status" FROM "SaleInstallment";
DROP TABLE "SaleInstallment";
ALTER TABLE "new_SaleInstallment" RENAME TO "SaleInstallment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
