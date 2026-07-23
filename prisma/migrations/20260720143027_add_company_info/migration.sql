-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "cnpj" TEXT,
    "address" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
