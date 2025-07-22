const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code du produit est requis'],
    unique: true,
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'La désignation du produit est requise'],
    trim: true
  },
  quantiteStock: {
    type: Number,
    required: [true, 'La quantité en stock est requise'],
    min: [0, 'La quantité ne peut pas être négative'],
    default: 0
  },
  prixUnitaire: {
    type: Number,
    required: [true, 'Le prix unitaire est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  image: {
    type: String,
    default: null
  },
  sousCategorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SousCategorie',
    required: [true, 'La sous-catégorie est requise']
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour les recherches
produitSchema.index({ code: 1 });
produitSchema.index({ designation: 1 });
produitSchema.index({ sousCategorie: 1 });

// Méthode virtuelle pour obtenir la catégorie via la sous-catégorie
produitSchema.virtual('categorie', {
  ref: 'Categorie',
  localField: 'sousCategorie',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Produit', produitSchema);