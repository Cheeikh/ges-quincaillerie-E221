// Calculer les dates de paiement (3 versements à 5 jours d'intervalle)
const calculerDatesPaiement = (dateLivraison) => {
  const dates = [];
  const dateBase = new Date(dateLivraison);
  
  for (let i = 0; i < 3; i++) {
    const dateVersement = new Date(dateBase);
    dateVersement.setDate(dateBase.getDate() + (i * 5));
    dates.push(dateVersement);
  }
  
  return dates;
};

// Calculer le montant de chaque versement
const calculerMontantVersement = (montantTotal) => {
  return Math.round((montantTotal / 3) * 100) / 100; // Arrondi à 2 décimales
};

// Vérifier si une date est aujourd'hui
const estAujourdhui = (date) => {
  const aujourdhui = new Date();
  const dateComparee = new Date(date);
  
  return aujourdhui.toDateString() === dateComparee.toDateString();
};

// Formater une date en français
const formaterDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Générer un code unique
const genererCode = (prefix, length = 6) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Pagination helper
const paginer = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    skip: offset,
    limit: parseInt(limit),
    page: parseInt(page)
  };
};

// Construire la réponse paginée
const construireReponsePaginee = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  calculerDatesPaiement,
  calculerMontantVersement,
  estAujourdhui,
  formaterDate,
  genererCode,
  paginer,
  construireReponsePaginee
};