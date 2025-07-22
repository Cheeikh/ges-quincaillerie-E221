# Configuration pour le Déploiement

## Variables d'environnement nécessaires

Créez un fichier `.env` sur votre serveur de production avec les variables suivantes :

```bash
# Configuration de base
NODE_ENV=production
PORT=3000

# Base de données
DATABASE_URL="postgresql://username:password@host:5432/quincaillerie_db"

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Configuration pour le déploiement
# URL de votre API en production
PRODUCTION_URL=https://votre-api.com

# URL de votre API en staging (optionnel)
STAGING_URL=https://staging.votre-api.com

# URL de base (utilisée si les autres ne sont pas définies)
BASE_URL=https://votre-api.com

# Origines autorisées pour CORS (séparées par des virgules)
ALLOWED_ORIGINS=https://votre-frontend.com,https://admin.votre-site.com

# Configuration de sécurité
DISABLE_HELMET=false

# Configuration de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuration des uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Problèmes courants et solutions

### 1. Erreur "Failed to fetch" en déploiement

**Cause**: Configuration CORS incorrecte ou URL Swagger incorrecte

**Solution**:
- Vérifiez que `PRODUCTION_URL` est correctement configuré
- Ajoutez votre domaine frontend dans `ALLOWED_ORIGINS`
- Assurez-vous que le protocole (http/https) correspond

### 2. Erreurs CORS

**Cause**: Origine non autorisée

**Solution**:
```bash
# Ajoutez votre domaine dans ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://votre-frontend.com,https://admin.votre-site.com,https://votre-api.com
```

### 3. Swagger ne fonctionne pas en production

**Cause**: URL codée en dur pour localhost

**Solution**:
- La configuration a été mise à jour pour utiliser les variables d'environnement
- Vérifiez que `PRODUCTION_URL` est défini

### 4. Problèmes de sécurité Helmet

**Cause**: Configuration CSP trop restrictive

**Solution**:
- La configuration Helmet a été ajustée pour Swagger
- Si nécessaire, désactivez temporairement : `DISABLE_HELMET=true`

## Configuration pour différents environnements

### Développement local
```bash
NODE_ENV=development
PRODUCTION_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Staging
```bash
NODE_ENV=staging
STAGING_URL=https://staging.votre-api.com
ALLOWED_ORIGINS=https://staging.votre-frontend.com
```

### Production
```bash
NODE_ENV=production
PRODUCTION_URL=https://api.votre-domaine.com
ALLOWED_ORIGINS=https://votre-frontend.com,https://admin.votre-site.com
```

## Test de la configuration

### 1. Test CORS
```bash
curl -H "Origin: https://votre-frontend.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     https://votre-api.com/api/produits
```

### 2. Test d'authentification
```bash
# Sans token (doit retourner 401)
curl https://votre-api.com/api/produits

# Avec token invalide (doit retourner 401)
curl -H "Authorization: Bearer token_invalide" \
     https://votre-api.com/api/produits
```

### 3. Test Swagger
- Accédez à `https://votre-api.com/api-docs`
- Vérifiez que les serveurs listés correspondent à votre environnement
- Testez une requête d'authentification

## Déploiement sur différentes plateformes

### Heroku
```bash
# Variables d'environnement dans le dashboard Heroku
NODE_ENV=production
PRODUCTION_URL=https://votre-app.herokuapp.com
ALLOWED_ORIGINS=https://votre-frontend.com
```

### Vercel
```bash
# Variables d'environnement dans vercel.json
{
  "env": {
    "NODE_ENV": "production",
    "PRODUCTION_URL": "https://votre-app.vercel.app",
    "ALLOWED_ORIGINS": "https://votre-frontend.com"
  }
}
```

### Railway
```bash
# Variables d'environnement dans le dashboard Railway
NODE_ENV=production
PRODUCTION_URL=https://votre-app.railway.app
ALLOWED_ORIGINS=https://votre-frontend.com
```

## Monitoring et logs

### Vérification des logs
```bash
# Logs CORS
grep "Origine bloquée par CORS" logs/app.log

# Logs d'authentification
grep "Token invalide" logs/app.log
```

### Métriques importantes
- Taux d'erreurs 401/403
- Erreurs CORS
- Temps de réponse des endpoints d'authentification

## Sécurité

### Recommandations
1. Utilisez HTTPS en production
2. Changez `JWT_SECRET` en production
3. Limitez `ALLOWED_ORIGINS` aux domaines nécessaires
4. Activez le rate limiting
5. Surveillez les tentatives d'accès non autorisées

### Variables sensibles
- `JWT_SECRET`: Doit être unique et complexe
- `DATABASE_URL`: Contient les credentials de la base de données
- `ALLOWED_ORIGINS`: Limitez aux domaines de confiance 