# Guide de Déploiement - API Quincaillerie Barro et Frère

## 🎯 Résumé du Projet

L'API REST complète pour la gestion des commandes et livraisons de la quincaillerie Barro et Frère a été **entièrement implémentée** avec les spécifications demandées.

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification & Autorisation
- ✅ Système d'authentification JWT complet
- ✅ 3 rôles : Gestionnaire, Responsable Achat, Responsable Paiement
- ✅ Permissions granulaires par rôle
- ✅ Middleware de sécurité (Helmet, CORS, Rate limiting)

### 📦 Gestion du Catalogue
- ✅ **Catégories** : CRUD complet avec archivage
- ✅ **Sous-catégories** : Hiérarchie catégorie → sous-catégorie
- ✅ **Produits** : Code, désignation, stock, prix, image
- ✅ **Fournisseurs** : Numéro, nom, adresse, contacts

### 🛒 Gestion des Commandes
- ✅ **Création de commandes** par le Responsable Achat
- ✅ **Articles multiples** par commande avec prix d'achat variables
- ✅ **Statuts** : En cours, Livré, Payé, Annulé
- ✅ **Gestion des livraisons** avec dates prévues/réelles
- ✅ **Mise à jour automatique des stocks** à la livraison
- ✅ **Filtrage** par date, statut, fournisseur

### 💰 Système de Paiement
- ✅ **Versements échelonnés** : Maximum 3 versements par commande
- ✅ **Intervalle de 5 jours** entre versements (logique implémentée)
- ✅ **Suivi des dettes** par fournisseur
- ✅ **Historique complet** des paiements
- ✅ **Statut automatique** des commandes (payé quand complet)

### 📊 Statistiques Demandées
- ✅ **Commandes en cours**
- ✅ **Commandes à livrer dans la journée**
- ✅ **Dette totale** de la quincaillerie
- ✅ **Versements de la journée**

### 📚 Documentation
- ✅ **Swagger/OpenAPI 3.0** complet
- ✅ Documentation interactive à `/api-docs`
- ✅ Schémas de données détaillés
- ✅ Exemples de requêtes/réponses

## 🏗️ Architecture Technique

```
├── src/
│   ├── config/           # Database & Swagger
│   ├── controllers/      # Logique métier (8 contrôleurs)
│   ├── middleware/       # Auth, Upload, Validation
│   ├── models/          # 6 modèles Mongoose
│   ├── routes/          # Routes avec validation
│   ├── utils/           # Helpers & utilitaires
│   └── app.js          # Serveur Express
├── scripts/             # Script de seed avec données test
├── uploads/            # Dossier pour images produits
└── package.json       # Dépendances configurées
```

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Cloner le projet
git clone <repository-url>
cd ges-quincaillerie-E221

# Installer les dépendances
npm install
```

### 2. Configuration MongoDB

**Option A - MongoDB Local:**
```bash
# Installer MongoDB
sudo apt update
sudo apt install mongodb

# Démarrer MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Option B - MongoDB Atlas (Recommandé):**
1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster gratuit
3. Obtenir la chaîne de connexion
4. Modifier `.env` avec votre URI MongoDB Atlas

### 3. Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier .env avec vos paramètres
# Obligatoire: MONGODB_URI et JWT_SECRET
```

### 4. Initialisation

```bash
# Créer des données de test
npm run seed

# Démarrer l'application
npm run dev
```

### 5. Accès

- **API** : http://localhost:3000/api
- **Documentation** : http://localhost:3000/api-docs
- **Health Check** : http://localhost:3000/api/health

## 👥 Comptes de Test

Après `npm run seed` :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Gestionnaire** | gestionnaire@quincaillerie.com | password123 |
| **Responsable Achat** | achat@quincaillerie.com | password123 |
| **Responsable Paiement** | paiement@quincaillerie.com | password123 |

## 🔄 Workflow d'Utilisation

### 1. Authentification
```bash
POST /api/auth/login
{
  "email": "gestionnaire@quincaillerie.com",
  "password": "password123"
}
```

### 2. Gestion du Catalogue (Gestionnaire)
```bash
# Créer catégorie
POST /api/categories
# Créer sous-catégorie
POST /api/sous-categories
# Créer produit avec image
POST /api/produits
# Créer fournisseur
POST /api/fournisseurs
```

### 3. Processus de Commande (Responsable Achat)
```bash
# Créer commande
POST /api/commandes
# Modifier commande (si en cours)
PUT /api/commandes/:id
# Marquer comme livrée
PATCH /api/commandes/:id/livrer
```

### 4. Gestion des Paiements (Responsable Paiement)
```bash
# Voir commandes à payer
GET /api/paiements/commandes-en-cours
# Enregistrer paiement
POST /api/paiements
# Voir dette par fournisseur
GET /api/paiements/dette-fournisseurs
```

### 5. Statistiques
```bash
GET /api/commandes/statistiques
```

## 🔒 Sécurité Implémentée

- **JWT** avec expiration configurable
- **BCrypt** pour hashage des mots de passe (12 rounds)
- **Helmet** pour headers sécurisés
- **CORS** configuré
- **Rate Limiting** (100 req/15min par IP)
- **Validation stricte** avec Express Validator
- **Upload sécurisé** avec Multer (images uniquement, 5MB max)

## 📝 Permissions par Rôle

### Gestionnaire
- ✅ CRUD catégories/sous-catégories/produits/fournisseurs
- ✅ Archivage/suppression
- ✅ Vue globale commandes/paiements

### Responsable Achat
- ✅ CRUD commandes (ses propres)
- ✅ Marquage livraisons
- ✅ Annulation commandes

### Responsable Paiement
- ✅ Enregistrement paiements
- ✅ Vue commandes à payer
- ✅ Suivi dettes fournisseurs

## 🧪 Tests

```bash
# Test basique de l'API
node test-api.js

# Test complet des endpoints
node test-endpoints.js
```

## 🐛 Dépannage

### MongoDB Connection Error
```bash
# Vérifier MongoDB local
sudo systemctl status mongodb

# Ou utiliser MongoDB Atlas
# Modifier MONGODB_URI dans .env
```

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=3001

# Ou tuer le processus
pkill -f "node.*app.js"
```

### Erreurs de validation
- Vérifier la documentation Swagger à `/api-docs`
- Tous les champs requis sont documentés

## 🚀 Déploiement Production

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://...
JWT_SECRET=complex_secret_key_256_bits
JWT_EXPIRE=24h
```

### Déploiement
```bash
# Install PM2 pour production
npm install -g pm2

# Démarrer avec PM2
pm2 start src/app.js --name quincaillerie-api

# Sauvegarder la configuration
pm2 save
pm2 startup
```

## ✅ Validation du Cahier des Charges

Toutes les exigences du cahier des charges ont été **entièrement implémentées** :

- ✅ Gestion hiérarchique catégories → sous-catégories → produits
- ✅ Gestion complète des fournisseurs
- ✅ Système de commandes avec articles multiples et prix variables
- ✅ Gestion des livraisons et mise à jour stocks
- ✅ Système de paiement en 3 versements max avec intervalle 5 jours
- ✅ Gestion des rôles et permissions
- ✅ Toutes les statistiques demandées
- ✅ API REST avec documentation Swagger
- ✅ Sécurité et authentification JWT

**🎉 L'API est entièrement fonctionnelle et prête pour la production !**