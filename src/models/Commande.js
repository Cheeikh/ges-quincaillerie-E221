const mongoose = require('mongoose');

// Schéma pour les articles d'une commande
const articleCommandeSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: [1, 'La quantité doit être au moins 1']
  },
  prixAchat: {
    type: Number,
    required: true,
    min: [0, 'Le prix d\'achat ne peut pas être négatif']
  },
  sousTotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const commandeSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true,
    required: true
  },
  date: {
    type: Date,
    required: [true, 'La date de commande est requise'],
    default: Date.now
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fournisseur',
    required: [true, 'Le fournisseur est requis']
  },
  articles: [articleCommandeSchema],
  montant: {
    type: Number,
    required: true,
    min: [0, 'Le montant ne peut pas être négatif']
  },
  dateLivraisonPrevue: {
    type: Date,
    required: [true, 'La date de livraison prévue est requise']
  },
  dateLivraisonReelle: {
    type: Date,
    default: null
  },
  statut: {
    type: String,
    enum: ['en_cours', 'livre', 'paye', 'annule'],
    default: 'en_cours'
  },
  responsableAchat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Middleware pour générer automatiquement le numéro de commande
commandeSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    const count = await mongoose.model('Commande').countDocuments();
    this.numero = `CMD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index pour les recherches
commandeSchema.index({ numero: 1 });
commandeSchema.index({ fournisseur: 1 });
commandeSchema.index({ statut: 1 });
commandeSchema.index({ date: 1 });
commandeSchema.index({ dateLivraisonPrevue: 1 });

module.exports = mongoose.model('Commande', commandeSchema);