const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connexion PostgreSQL établie');
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error);
    process.exit(1);
  }
};

const cleanDatabase = async () => {
  console.log('🧹 Nettoyage des données existantes...');
  
  // Supprimer dans l'ordre correct (en raison des contraintes de clés étrangères)
  await prisma.paiement.deleteMany({});
  await prisma.articleCommande.deleteMany({});
  await prisma.commande.deleteMany({});
  await prisma.produit.deleteMany({});
  await prisma.sousCategorie.deleteMany({});
  await prisma.categorie.deleteMany({});
  await prisma.fournisseur.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('✅ Données existantes supprimées');
};

const seedData = async () => {
  try {
    await cleanDatabase();

    console.log('👥 Création des utilisateurs...');
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    // Créer des utilisateurs
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'gestionnaire@quincaillerie.com',
          password: hashedPassword,
          nom: 'DIOP',
          prenom: 'Amadou',
          role: 'GESTIONNAIRE'
        }
      }),
      prisma.user.create({
        data: {
          email: 'achat@quincaillerie.com',
          password: hashedPassword,
          nom: 'FALL',
          prenom: 'Fatou',
          role: 'RESPONSABLE_ACHAT'
        }
      }),
      prisma.user.create({
        data: {
          email: 'paiement@quincaillerie.com',
          password: hashedPassword,
          nom: 'NDIAYE',
          prenom: 'Moussa',
          role: 'RESPONSABLE_PAIEMENT'
        }
      })
    ]);

    console.log('📂 Création des catégories...');
    
    // Créer des catégories
    const categories = await Promise.all([
      prisma.categorie.create({
        data: {
          nom: 'Ciment',
          description: 'Différents types de ciment pour construction'
        }
      }),
      prisma.categorie.create({
        data: {
          nom: 'Fer',
          description: 'Barres de fer et aciers pour construction'
        }
      }),
      prisma.categorie.create({
        data: {
          nom: 'Béton',
          description: 'Matériaux pour béton et agrégats'
        }
      })
    ]);

    console.log('📁 Création des sous-catégories...');
    
    // Créer des sous-catégories
    const sousCategories = await Promise.all([
      // Sous-catégories pour Ciment
      prisma.sousCategorie.create({
        data: {
          nom: 'Ciment Portland',
          description: 'Ciment Portland standard',
          categorieId: categories[0].id
        }
      }),
      prisma.sousCategorie.create({
        data: {
          nom: 'Ciment Rapide',
          description: 'Ciment à prise rapide',
          categorieId: categories[0].id
        }
      }),
      // Sous-catégories pour Fer
      prisma.sousCategorie.create({
        data: {
          nom: 'Fer 8mm',
          description: 'Barres de fer diamètre 8mm',
          categorieId: categories[1].id
        }
      }),
      prisma.sousCategorie.create({
        data: {
          nom: 'Fer 12mm',
          description: 'Barres de fer diamètre 12mm',
          categorieId: categories[1].id
        }
      }),
      prisma.sousCategorie.create({
        data: {
          nom: 'Fer 16mm',
          description: 'Barres de fer diamètre 16mm',
          categorieId: categories[1].id
        }
      }),
      // Sous-catégories pour Béton
      prisma.sousCategorie.create({
        data: {
          nom: 'Gravier',
          description: 'Gravier pour béton',
          categorieId: categories[2].id
        }
      }),
      prisma.sousCategorie.create({
        data: {
          nom: 'Sable',
          description: 'Sable pour construction',
          categorieId: categories[2].id
        }
      })
    ]);

    console.log('🏢 Création des fournisseurs...');
    
    // Créer des fournisseurs
    const fournisseurs = await Promise.all([
      prisma.fournisseur.create({
        data: {
          numero: 'FOUR001',
          nom: 'SOCOCIM Industries',
          adresse: 'Zone Industrielle de Rufisque, Sénégal',
          telephone: '+221 33 836 40 00',
          email: 'commercial@sococim.sn'
        }
      }),
      prisma.fournisseur.create({
        data: {
          numero: 'FOUR002',
          nom: 'Les Ciments du Sahel',
          adresse: 'Bargny, Sénégal',
          telephone: '+221 33 832 15 00',
          email: 'vente@cimentsahel.sn'
        }
      }),
      prisma.fournisseur.create({
        data: {
          numero: 'FOUR003',
          nom: 'Quincaillerie Moderne',
          adresse: 'Marché Sandaga, Dakar',
          telephone: '+221 77 123 45 67',
          email: 'contact@quincmoderne.sn'
        }
      })
    ]);

    console.log('📦 Création des produits...');
    
    // Créer des produits
    const produits = await Promise.all([
      // Produits Ciment
      prisma.produit.create({
        data: {
          code: 'CIM001',
          designation: 'Ciment Portland 50kg',
          quantiteStock: 100,
          prixUnitaire: 4500,
          sousCategorieId: sousCategories[0].id
        }
      }),
      prisma.produit.create({
        data: {
          code: 'CIM002',
          designation: 'Ciment Rapide 25kg',
          quantiteStock: 50,
          prixUnitaire: 3200,
          sousCategorieId: sousCategories[1].id
        }
      }),
      // Produits Fer
      prisma.produit.create({
        data: {
          code: 'FER001',
          designation: 'Fer à béton 8mm - 12m',
          quantiteStock: 200,
          prixUnitaire: 2800,
          sousCategorieId: sousCategories[2].id
        }
      }),
      prisma.produit.create({
        data: {
          code: 'FER002',
          designation: 'Fer à béton 12mm - 12m',
          quantiteStock: 150,
          prixUnitaire: 4200,
          sousCategorieId: sousCategories[3].id
        }
      }),
      prisma.produit.create({
        data: {
          code: 'FER003',
          designation: 'Fer à béton 16mm - 12m',
          quantiteStock: 100,
          prixUnitaire: 6800,
          sousCategorieId: sousCategories[4].id
        }
      }),
      // Produits Béton
      prisma.produit.create({
        data: {
          code: 'GRA001',
          designation: 'Gravier 15/25 - 1m³',
          quantiteStock: 30,
          prixUnitaire: 15000,
          sousCategorieId: sousCategories[5].id
        }
      }),
      prisma.produit.create({
        data: {
          code: 'SAB001',
          designation: 'Sable de construction - 1m³',
          quantiteStock: 25,
          prixUnitaire: 12000,
          sousCategorieId: sousCategories[6].id
        }
      })
    ]);

    console.log('📋 Création des commandes de test...');
    
    // Créer quelques commandes de test avec les articles
    const dateLivraison1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Dans 7 jours
    const dateLivraison2 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Dans 3 jours
    
    const commande1 = await prisma.commande.create({
      data: {
        numero: 'CMD-000001',
        fournisseurId: fournisseurs[0].id,
        montant: 114000,
        dateLivraisonPrevue: dateLivraison1,
        statut: 'EN_COURS',
        responsableAchatId: users[1].id,
        articles: {
          create: [
            {
              produitId: produits[0].id,
              quantite: 20,
              prixAchat: 4200,
              sousTotal: 84000
            },
            {
              produitId: produits[1].id,
              quantite: 10,
              prixAchat: 3000,
              sousTotal: 30000
            }
          ]
        }
      }
    });

    const commande2 = await prisma.commande.create({
      data: {
        numero: 'CMD-000002',
        fournisseurId: fournisseurs[1].id,
        montant: 130000,
        dateLivraisonPrevue: dateLivraison2,
        dateLivraisonReelle: new Date(),
        statut: 'LIVRE',
        responsableAchatId: users[1].id,
        articles: {
          create: [
            {
              produitId: produits[2].id,
              quantite: 50,
              prixAchat: 2600,
              sousTotal: 130000
            }
          ]
        }
      }
    });

    console.log('✅ Données de test créées avec succès !');
    console.log(`
📊 Résumé des données créées :
- ${users.length} utilisateurs
- ${categories.length} catégories
- ${sousCategories.length} sous-catégories
- ${fournisseurs.length} fournisseurs
- ${produits.length} produits
- 2 commandes de test

👥 Comptes de test :
- Gestionnaire: gestionnaire@quincaillerie.com / password123
- Responsable Achat: achat@quincaillerie.com / password123
- Responsable Paiement: paiement@quincaillerie.com / password123

🗄️  Base de données: PostgreSQL avec Prisma
    `);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedData();
  } catch (error) {
    console.error('❌ Erreur dans le script de seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔚 Script terminé');
    process.exit(0);
  }
};

main();