# API Gestion Quincaillerie Barro et Frère

API REST complète pour la gestion des commandes et livraisons de la quincaillerie Barro et Frère, développée avec Node.js, Express, MongoDB et Swagger.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Structure du projet](#structure-du-projet)
- [Modèles de données](#modèles-de-données)
- [Rôles et permissions](#rôles-et-permissions)
- [Scripts utiles](#scripts-utiles)

## 🚀 Fonctionnalités

### Gestion des utilisateurs
- ✅ Authentification JWT
- ✅ Gestion des rôles (Gestionnaire, Responsable Achat, Responsable Paiement)
- ✅ Gestion des profils utilisateurs

### Gestion du catalogue
- ✅ Gestion des catégories et sous-catégories
- ✅ Gestion des produits avec images
- ✅ Gestion des fournisseurs
- ✅ Système d'archivage

### Gestion des commandes
- ✅ Création et modification des commandes fournisseurs
- ✅ Suivi du statut des commandes (En cours, Livré, Payé, Annulé)
- ✅ Gestion des livraisons
- ✅ Mise à jour automatique des stocks

### Gestion des paiements
- ✅ Système de versements (maximum 3 versements par commande)
- ✅ Intervalle de 5 jours entre versements
- ✅ Suivi des dettes par fournisseur
- ✅ Historique des paiements

### Statistiques et rapports
- ✅ Commandes en cours
- ✅ Commandes à livrer dans la journée
- ✅ Dette totale de la quincaillerie
- ✅ Versements de la journée

## 🏗️ Architecture

L'application suit une architecture MVC avec les couches suivantes :

- **Modèles** : Schémas MongoDB avec Mongoose
- **Vues** : API REST avec documentation Swagger
- **Contrôleurs** : Logique métier
- **Middlewares** : Authentification, autorisation, validation
- **Routes** : Définition des endpoints API

## 🛠️ Technologies utilisées

- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB avec Mongoose ODM
- **Authentification** : JWT (JSON Web Tokens)
- **Validation** : Express Validator
- **Documentation** : Swagger/OpenAPI 3.0
- **Sécurité** : Helmet, CORS, Rate Limiting
- **Upload de fichiers** : Multer
- **Chiffrement** : BCrypt

## 📦 Installation

### Prérequis

- Node.js (version 16+)
- MongoDB (local ou cloud)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/Cheeikh/ges-quincaillerie-E221.git
cd ges-quincaillerie-E221
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```
Puis modifier le fichier `.env` avec vos paramètres.

4. **Initialiser la base de données avec des données de test**
```bash
npm run seed
```

5. **Démarrer l'application**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quincaillerie_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
```

### Base de données

L'application utilise MongoDB. Assurez-vous que MongoDB est installé et en cours d'exécution, ou utilisez MongoDB Atlas pour une base de données cloud.

## 🚦 Utilisation

### Démarrage rapide

1. Démarrer l'application : `npm run dev`
2. Accéder à la documentation : `http://localhost:3000/api-docs`
3. Tester l'API : `http://localhost:3000/api/health`

### Comptes de test

Après avoir exécuté `npm run seed`, vous pouvez utiliser ces comptes :

- **Gestionnaire** : `gestionnaire@quincaillerie.com` / `password123`
- **Responsable Achat** : `achat@quincaillerie.com` / `password123`
- **Responsable Paiement** : `paiement@quincaillerie.com` / `password123`

### Authentification

1. **Connexion**
```bash
POST /api/auth/login
{
  "email": "gestionnaire@quincaillerie.com",
  "password": "password123"
}
```

2. **Utiliser le token**
Ajoutez le token reçu dans le header `Authorization: Bearer <token>` pour toutes les requêtes protégées.

## 📚 API Documentation

La documentation interactive Swagger est disponible à : `http://localhost:3000/api-docs`

### Endpoints principaux

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Modifier le profil

#### Gestion du catalogue
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie
- `GET /api/sous-categories` - Liste des sous-catégories
- `GET /api/fournisseurs` - Liste des fournisseurs
- `GET /api/produits` - Liste des produits

#### Commandes
- `GET /api/commandes` - Liste des commandes
- `POST /api/commandes` - Créer une commande
- `GET /api/commandes/statistiques` - Statistiques
- `PATCH /api/commandes/:id/livrer` - Marquer comme livré

#### Paiements
- `GET /api/paiements` - Liste des paiements
- `POST /api/paiements` - Enregistrer un paiement
- `GET /api/paiements/commandes-en-cours` - Commandes en cours de paiement
- `GET /api/paiements/dette-fournisseurs` - Dette par fournisseur

## 📁 Structure du projet

```
├── src/
│   ├── config/           # Configuration (DB, Swagger)
│   ├── controllers/      # Logique métier
│   ├── middleware/       # Middlewares (auth, upload, etc.)
│   ├── models/          # Modèles Mongoose
│   ├── routes/          # Définition des routes
│   ├── services/        # Services métier
│   ├── utils/           # Utilitaires
│   └── app.js          # Application principale
├── scripts/             # Scripts utilitaires
├── uploads/            # Fichiers uploadés
├── .env               # Variables d'environnement
├── package.json       # Dépendances et scripts
└── README.md         # Documentation
```

## 🗃️ Modèles de données

### User (Utilisateur)
- Email, mot de passe, nom, prénom
- Rôle : gestionnaire | responsable_achat | responsable_paiement
- Statut actif/inactif

### Categorie & SousCategorie
- Hiérarchie : Catégorie → Sous-catégorie → Produits
- Système d'archivage

### Produit
- Code unique, désignation, stock, prix
- Image optionnelle
- Lié à une sous-catégorie

### Fournisseur
- Numéro unique, nom, adresse, contacts
- Système d'archivage

### Commande
- Numéro automatique, articles, montant total
- Dates de livraison prévue/réelle
- Statuts : en_cours | livre | paye | annule

### Paiement
- Versements (max 3 par commande)
- Intervalle de 5 jours entre versements
- Suivi par responsable paiement

## 👥 Rôles et permissions

### Gestionnaire
- ✅ Gestion complète des catégories, sous-catégories, produits, fournisseurs
- ✅ Archivage/suppression des entités
- ✅ Vue globale sur toutes les commandes et paiements

### Responsable Achat
- ✅ Création et modification des commandes
- ✅ Annulation des commandes
- ✅ Marquage des livraisons
- ✅ Vue sur ses propres commandes

### Responsable Paiement
- ✅ Enregistrement des paiements
- ✅ Vue sur les commandes à payer
- ✅ Suivi des dettes fournisseurs
- ✅ Historique des versements

## 🔧 Scripts utiles

```bash
# Démarrage en développement
npm run dev

# Démarrage en production
npm start

# Initialiser la DB avec des données de test
npm run seed

# Vérifier la santé de l'API
curl http://localhost:3000/api/health
```

## 🔒 Sécurité

- **JWT** pour l'authentification
- **BCrypt** pour le hachage des mots de passe
- **Helmet** pour les headers de sécurité
- **Rate limiting** contre les attaques par déni de service
- **Validation** stricte des données d'entrée
- **CORS** configuré pour les origines autorisées

## 🤝 Contribution

1. Forker le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committer les changements (`git commit -m 'Add some AmazingFeature'`)
4. Pusher vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou assistance :
- 📧 Email : support@quincaillerie-barro.com
- 🐛 Issues : [GitHub Issues](https://github.com/Cheeikh/ges-quincaillerie-E221/issues)

---

**Développé avec ❤️ pour la Quincaillerie Barro et Frère**