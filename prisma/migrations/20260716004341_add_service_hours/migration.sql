-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceOrderService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hours" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    CONSTRAINT "ServiceOrderService_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ServiceOrderService" ("description", "endedAt", "id", "serviceOrderId", "startedAt", "unitPrice") SELECT "description", "endedAt", "id", "serviceOrderId", "startedAt", "unitPrice" FROM "ServiceOrderService";
DROP TABLE "ServiceOrderService";
ALTER TABLE "new_ServiceOrderService" RENAME TO "ServiceOrderService";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
