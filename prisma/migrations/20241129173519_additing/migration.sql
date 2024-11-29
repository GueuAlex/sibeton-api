-- CreateTable
CREATE TABLE "Variante" (
    "id" SERIAL NOT NULL,
    "unit_price" TEXT NOT NULL,
    "label" TEXT,
    "reference" TEXT,
    "description" TEXT,
    "q800" TEXT,
    "q100" TEXT,
    "diametreQa" TEXT,
    "diametreQb" TEXT,
    "qrReservation" TEXT,
    "qc" TEXT,
    "ht" TEXT,
    "hu" TEXT,
    "i" TEXT,
    "E" TEXT,
    "poids" TEXT,
    "lXh" TEXT,
    "longueur" TEXT,
    "a" TEXT,
    "epaisseurE1" TEXT,
    "epaisseurE2" TEXT,
    "approxPoids" TEXT,
    "designationAxBxC" TEXT,
    "b" TEXT,
    "c" TEXT,
    "e" TEXT,
    "l" TEXT,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Variante_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Variante" ADD CONSTRAINT "Variante_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
