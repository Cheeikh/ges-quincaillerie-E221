const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const Categorie = require('../src/models/Categorie');
const SousCategorie = require('../src/models/SousCategorie');
const Fournisseur = require('../src/models/Fournisseur');
const Produit = require('../src/models/Produit');
const Commande = require('../src/models/Commande');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🧹 Nettoyage des données existantes...');
    
    // Supprimer toutes les données existantes
    await Promise.all([
      User.deleteMany({}),
      Categorie.deleteMany({}),
      SousCategorie.deleteMany({}),
      Fournisseur.deleteMany({}),
      Produit.deleteMany({}),
      Commande.deleteMany({})
    ]);

    console.log('👥 Création des utilisateurs...');
    
    // Créer des utilisateurs
    const users = await User.create([
      {
        email: 'gestionnaire@quincaillerie.com',
        password: 'password123',
        nom: 'DIOP',
        prenom: 'Amadou',
        role: 'gestionnaire'
      },
      {
        email: 'achat@quincaillerie.com',
        password: 'password123',
        nom: 'FALL',
        prenom: 'Fatou',
        role: 'responsable_achat'
      },
      {
        email: 'paiement@quincaillerie.com',
        password: 'password123',
        nom: 'NDIAYE',
        prenom: 'Moussa',
        role: 'responsable_paiement'
      }
    ]);

    console.log('📂 Création des catégories...');
    
    // Créer des catégories
    const categories = await Categorie.create([
      {
        nom: 'Ciment',
        description: 'Différents types de ciment pour construction'
      },
      {
        nom: 'Fer',
        description: 'Barres de fer et aciers pour construction'
      },
      {
        nom: 'Béton',
        description: 'Matériaux pour béton et agrégats'
      }
    ]);

    console.log('📁 Création des sous-catégories...');
    
    // Créer des sous-catégories
    const sousCategories = await SousCategorie.create([
      // Sous-catégories pour Ciment
      {
        nom: 'Ciment Portland',
        description: 'Ciment Portland standard',
        categorie: categories[0]._id
      },
      {
        nom: 'Ciment Rapide',
        description: 'Ciment à prise rapide',
        categorie: categories[0]._id
      },
      // Sous-catégories pour Fer
      {
        nom: 'Fer 8mm',
        description: 'Barres de fer diamètre 8mm',
        categorie: categories[1]._id
      },
      {
        nom: 'Fer 12mm',
        description: 'Barres de fer diamètre 12mm',
        categorie: categories[1]._id
      },
      {
        nom: 'Fer 16mm',
        description: 'Barres de fer diamètre 16mm',
        categorie: categories[1]._id
      },
      // Sous-catégories pour Béton
      {
        nom: 'Gravier',
        description: 'Gravier pour béton',
        categorie: categories[2]._id
      },
      {
        nom: 'Sable',
        description: 'Sable pour construction',
        categorie: categories[2]._id
      }
    ]);

    console.log('🏢 Création des fournisseurs...');
    
    // Créer des fournisseurs
    const fournisseurs = await Fournisseur.create([
      {
        numero: 'FOUR001',
        nom: 'SOCOCIM Industries',
        adresse: 'Zone Industrielle de Rufisque, Sénégal',
        telephone: '+221 33 836 40 00',
        email: 'commercial@sococim.sn'
      },
      {
        numero: 'FOUR002',
        nom: 'Les Ciments du Sahel',
        adresse: 'Bargny, Sénégal',
        telephone: '+221 33 832 15 00',
        email: 'vente@cimentsahel.sn'
      },
      {
        numero: 'FOUR003',
        nom: 'Quincaillerie Moderne',
        adresse: 'Marché Sandaga, Dakar',
        telephone: '+221 77 123 45 67',
        email: 'contact@quincmoderne.sn'
      }
    ]);

    console.log('📦 Création des produits...');
    
    // Créer des produits
    const produits = await Produit.create([
      // Produits Ciment
      {
        code: 'CIM001',
        designation: 'Ciment Portland 50kg',
        quantiteStock: 100,
        prixUnitaire: 4500,
        sousCategorie: sousCategories[0]._id
      },
      {
        code: 'CIM002',
        designation: 'Ciment Rapide 25kg',
        quantiteStock: 50,
        prixUnitaire: 3200,
        sousCategorie: sousCategories[1]._id
      },
      // Produits Fer
      {
        code: 'FER001',
        designation: 'Fer à béton 8mm - 12m',
        quantiteStock: 200,
        prixUnitaire: 2800,
        sousCategorie: sousCategories[2]._id
      },
      {
        code: 'FER002',
        designation: 'Fer à béton 12mm - 12m',
        quantiteStock: 150,
        prixUnitaire: 4200,
        sousCategorie: sousCategories[3]._id
      },
      {
        code: 'FER003',
        designation: 'Fer à béton 16mm - 12m',
        quantiteStock: 100,
        prixUnitaire: 6800,
        sousCategorie: sousCategories[4]._id
      },
      // Produits Béton
      {
        code: 'GRA001',
        designation: 'Gravier 15/25 - 1m³',
        quantiteStock: 30,
        prixUnitaire: 15000,
        sousCategorie: sousCategories[5]._id
      },
      {
        code: 'SAB001',
        designation: 'Sable de construction - 1m³',
        quantiteStock: 25,
        prixUnitaire: 12000,
        sousCategorie: sousCategories[6]._id
      }
    ]);

    console.log('📋 Création des commandes de test...');
    
    // Créer quelques commandes de test
    const commandes = await Commande.create([
      {
        fournisseur: fournisseurs[0]._id,
        articles: [
          {
            produit: produits[0]._id,
            quantite: 20,
            prixAchat: 4200,
            sousTotal: 84000
          },
          {
            produit: produits[1]._id,
            quantite: 10,
            prixAchat: 3000,
            sousTotal: 30000
          }
        ],
        montant: 114000,
        dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        statut: 'en_cours',
        responsableAchat: users[1]._id
      },
      {
        fournisseur: fournisseurs[1]._id,
        articles: [
          {
            produit: produits[2]._id,
            quantite: 50,
            prixAchat: 2600,
            sousTotal: 130000
          }
        ],
        montant: 130000,
        dateLivraisonPrevue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        dateLivraisonReelle: new Date(),
        statut: 'livre',
        responsableAchat: users[1]._id
      }
    ]);

    console.log('✅ Données de test créées avec succès !');
    console.log(`
📊 Résumé des données créées :
- ${users.length} utilisateurs
- ${categories.length} catégories
- ${sousCategories.length} sous-catégories
- ${fournisseurs.length} fournisseurs
- ${produits.length} produits
- ${commandes.length} commandes

👥 Comptes de test :
- Gestionnaire: gestionnaire@quincaillerie.com / password123
- Responsable Achat: achat@quincaillerie.com / password123
- Responsable Paiement: paiement@quincaillerie.com / password123
    `);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
  }
};

const main = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('🔚 Script terminé');
  process.exit(0);
};

main();