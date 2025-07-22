# Guide de Déploiement - API Quincaillerie Barro et Frère

## Vue d'ensemble

Cette API REST est construite avec **Node.js**, **Express**, **PostgreSQL** (via **NeonDB**) et **Prisma ORM**. Elle gère la gestion des commandes et livraisons pour la quincaillerie Barro et Frère.

## Prérequis

- **Node.js** v16+ et npm v8+
- Compte **NeonDB** (ou serveur PostgreSQL)
- **Git** pour le clonage du repository

## Base de données - PostgreSQL avec NeonDB

### 1. Configuration NeonDB

1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un nouveau projet/base de données
3. Notez l'URL de connexion fournie (format: `postgresql://username:password@host:port/database?sslmode=require`)

### 2. Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration du serveur
NODE_ENV=production
PORT=3000

# Configuration de la base de données PostgreSQL (NeonDB)
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech:5432/your-database?sslmode=require"

# Configuration JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Configuration bcrypt
BCRYPT_SALT_ROUNDS=12

# Configuration CORS (optionnel)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**⚠️ Important** : Changez `JWT_SECRET` par une clé secrète forte et unique.

## Installation et Déploiement

### 1. Clonage et Installation

```bash
# Cloner le repository
git clone https://github.com/Cheeikh/ges-quincaillerie-E221.git
cd ges-quincaillerie-E221

# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate
```

### 2. Configuration de la Base de Données

```bash
# Appliquer les migrations Prisma
npm run db:migrate

# Ou pour pousser le schéma directement (pour le développement)
npm run db:push

# Peupler la base avec des données de test (optionnel)
npm run seed
```

### 3. Démarrage de l'Application

```bash
# Mode production
npm start

# Mode développement (avec hot reload)
npm run dev
```

L'API sera accessible sur `http://localhost:3000` (ou le port spécifié dans PORT).

## Options de Déploiement

### Option 1: Vercel (Recommandé)

1. **Installation de Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configuration du projet**
   ```bash
   vercel init
   ```

3. **Variables d'environnement**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add BCRYPT_SALT_ROUNDS
   ```

4. **Déploiement**
   ```bash
   vercel --prod
   ```

### Option 2: Railway

1. Connectez votre repository GitHub à Railway
2. Ajoutez les variables d'environnement dans le dashboard
3. Railway détectera automatiquement votre app Node.js
4. Le déploiement se fera automatiquement

### Option 3: Render

1. Connectez votre repository à Render
2. Configurez les variables d'environnement
3. Définissez la commande de build : `npm install && npm run db:generate`
4. Définissez la commande de start : `npm start`

### Option 4: DigitalOcean App Platform

1. **Fichier de configuration** (`.do/app.yaml`)
   ```yaml
   name: quincaillerie-api
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/ges-quincaillerie-E221
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: DATABASE_URL
       value: ${DATABASE_URL}
     - key: JWT_SECRET
       value: ${JWT_SECRET}
   ```

## Configuration Post-Déploiement

### 1. Vérification de l'API

Testez les endpoints principaux :

```bash
# Health check
curl https://your-api-domain.com/

# Documentation Swagger
# Visitez: https://your-api-domain.com/api-docs
```

### 2. Création du Compte Administrateur

```bash
# Exécuter le script de seed pour créer les comptes de test
npm run seed
```

Ou créez manuellement via l'endpoint `/api/auth/register` :

```json
{
  "email": "admin@quincaillerie.com",
  "password": "motdepasse123",
  "nom": "Admin",
  "prenom": "Système",
  "role": "GESTIONNAIRE"
}
```

## Scripts de Base de Données Disponibles

```bash
# Générer le client Prisma
npm run db:generate

# Créer et appliquer une nouvelle migration
npm run db:migrate

# Pousser le schéma vers la base (dev uniquement)
npm run db:push

# Réinitialiser la base de données
npm run db:reset

# Ouvrir Prisma Studio (interface d'administration)
npm run db:studio

# Peupler avec des données de test
npm run seed
```

## Gestion des Migrations Prisma

### En Production

1. **Avant le déploiement** :
   ```bash
   # Créer une migration
   npx prisma migrate dev --name describe_your_changes
   
   # Commiter les fichiers de migration
   git add prisma/migrations/
   git commit -m "Add migration: describe_your_changes"
   ```

2. **Après le déploiement** :
   Les migrations sont automatiquement appliquées via `npm run db:migrate` dans le processus de build.

## Surveillance et Maintenance

### 1. Logs

- Activez les logs Prisma en développement dans `src/config/database.js`
- Utilisez les logs de votre plateforme de déploiement en production

### 2. Sauvegarde Base de Données

Pour NeonDB :
- Les sauvegardes automatiques sont gérées par Neon
- Configurez des sauvegardes supplémentaires si nécessaire

### 3. Monitoring

Surveillez :
- Temps de réponse de l'API
- Utilisation de la base de données
- Erreurs d'application
- Consommation mémoire

## Dépannage

### Erreurs Courantes

1. **Erreur de connexion à la base de données**
   ```
   Error connecting to PostgreSQL: ...
   ```
   - Vérifiez l'URL `DATABASE_URL`
   - Vérifiez les paramètres de connexion SSL

2. **Erreur Prisma Client**
   ```
   PrismaClientInitializationError
   ```
   - Exécutez `npm run db:generate`
   - Vérifiez que les migrations sont appliquées

3. **Erreur JWT**
   ```
   Token invalide
   ```
   - Vérifiez que `JWT_SECRET` est défini
   - Vérifiez la validité du token

### Commandes de Diagnostic

```bash
# Vérifier la connexion à la base
npx prisma db pull

# Vérifier l'état des migrations
npx prisma migrate status

# Réinitialiser le client Prisma
rm -rf node_modules/.prisma
npm run db:generate
```

## Sécurité en Production

1. **Variables d'environnement** : Ne jamais commiter le fichier `.env`
2. **HTTPS** : Toujours utiliser HTTPS en production
3. **Rate Limiting** : Configuré par défaut (100 requêtes/15min)
4. **CORS** : Configurez les origines autorisées
5. **Helmet** : Protection des headers HTTP (activé)

## Endpoints Principaux

- **Documentation** : `/api-docs` (Swagger UI)
- **Authentification** : `/api/auth/*`
- **Catégories** : `/api/categories/*`
- **Sous-catégories** : `/api/sous-categories/*`
- **Fournisseurs** : `/api/fournisseurs/*`
- **Produits** : `/api/produits/*`
- **Commandes** : `/api/commandes/*`
- **Paiements** : `/api/paiements/*`

## Support

Pour toute question ou problème :
- Consultez la documentation Swagger à `/api-docs`
- Vérifiez les logs de l'application
- Contactez l'équipe de développement

---

**Note** : Ce guide suppose l'utilisation de NeonDB. Pour d'autres fournisseurs PostgreSQL, adaptez l'URL de connexion en conséquence.