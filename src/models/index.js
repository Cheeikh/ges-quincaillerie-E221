const { prisma } = require('../config/database');

// Enum mapping pour la compatibilité avec l'ancienne API
const USER_ROLES = {
  GESTIONNAIRE: 'GESTIONNAIRE',
  RESPONSABLE_ACHAT: 'RESPONSABLE_ACHAT', 
  RESPONSABLE_PAIEMENT: 'RESPONSABLE_PAIEMENT'
};

const STATUT_COMMANDE = {
  EN_COURS: 'EN_COURS',
  LIVRE: 'LIVRE',
  PAYE: 'PAYE',
  ANNULE: 'ANNULE'
};

// Fonction utilitaire pour générer les numéros automatiques
const generateNextNumber = async (model, prefix, field = 'numero') => {
  const count = await prisma[model].count();
  return `${prefix}-${String(count + 1).padStart(6, '0')}`;
};

// Fonction pour convertir les ObjectId MongoDB en format approprié
const convertMongoQuery = (query) => {
  const converted = { ...query };
  
  // Convertir les champs de recherche spéciaux
  if (converted._id) {
    converted.id = converted._id;
    delete converted._id;
  }
  
  return converted;
};

// Fonctions d'inclusion communes pour les relations
const USER_INCLUDE = {
  commandesAchat: {
    include: {
      fournisseur: true,
      articles: {
        include: {
          produit: true
        }
      }
    }
  },
  paiements: {
    include: {
      commande: true
    }
  }
};

const PRODUIT_INCLUDE = {
  sousCategorie: {
    include: {
      categorie: true
    }
  }
};

const COMMANDE_INCLUDE = {
  fournisseur: true,
  responsableAchat: {
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true
    }
  },
  articles: {
    include: {
      produit: {
        include: {
          sousCategorie: {
            include: {
              categorie: true
            }
          }
        }
      }
    }
  },
  paiements: {
    include: {
      responsablePaiement: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true
        }
      }
    }
  }
};

const PAIEMENT_INCLUDE = {
  commande: {
    include: {
      fournisseur: true,
      responsableAchat: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true
        }
      }
    }
  },
  responsablePaiement: {
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true
    }
  }
};

module.exports = {
  prisma,
  USER_ROLES,
  STATUT_COMMANDE,
  generateNextNumber,
  convertMongoQuery,
  includes: {
    USER_INCLUDE,
    PRODUIT_INCLUDE,
    COMMANDE_INCLUDE,
    PAIEMENT_INCLUDE
  }
};