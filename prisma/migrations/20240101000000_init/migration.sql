-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('GESTIONNAIRE', 'RESPONSABLE_ACHAT', 'RESPONSABLE_PAIEMENT');

-- CreateEnum
CREATE TYPE "statut_commandes" AS ENUM ('EN_COURS', 'LIVRE', 'PAYE', 'ANNULE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "user_roles" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sous_categories" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorieId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sous_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantiteStock" INTEGER NOT NULL DEFAULT 0,
    "prixUnitaire" DECIMAL(10,2) NOT NULL,
    "image" TEXT,
    "sousCategorieId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fournisseurId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "dateLivraisonPrevue" TIMESTAMP(3) NOT NULL,
    "dateLivraisonReelle" TIMESTAMP(3),
    "statut" "statut_commandes" NOT NULL DEFAULT 'EN_COURS',
    "responsableAchatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles_commande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixAchat" DECIMAL(10,2) NOT NULL,
    "sousTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "articles_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroVersement" INTEGER NOT NULL,
    "responsablePaiementId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nom_key" ON "categories"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "sous_categories_nom_categorieId_key" ON "sous_categories"("nom", "categorieId");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_numero_key" ON "fournisseurs"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "produits_code_key" ON "produits"("code");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_numero_key" ON "commandes"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_numero_key" ON "paiements"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_commandeId_numeroVersement_key" ON "paiements"("commandeId", "numeroVersement");

-- AddForeignKey
ALTER TABLE "sous_categories" ADD CONSTRAINT "sous_categories_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_sousCategorieId_fkey" FOREIGN KEY ("sousCategorieId") REFERENCES "sous_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_responsableAchatId_fkey" FOREIGN KEY ("responsableAchatId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_commande" ADD CONSTRAINT "articles_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_commande" ADD CONSTRAINT "articles_commande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_responsablePaiementId_fkey" FOREIGN KEY ("responsablePaiementId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;