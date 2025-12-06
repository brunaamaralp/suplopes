-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "accountType" TEXT,
ADD COLUMN     "canDelete" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "group" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isEditable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" INTEGER,
ADD COLUMN     "nature" TEXT,
ADD COLUMN     "parentCode" TEXT,
ADD COLUMN     "side" TEXT,
ADD COLUMN     "sortOrder" INTEGER;

-- CreateTable
CREATE TABLE "Reconciliation" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bankAccountId" INTEGER NOT NULL,
    "systemBalance" DOUBLE PRECISION NOT NULL,
    "bankBalance" DOUBLE PRECISION NOT NULL,
    "difference" DOUBLE PRECISION,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reconciliation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
