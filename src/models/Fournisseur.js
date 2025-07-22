const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: [true, 'Le numéro du fournisseur est requis'],
    unique: true,
    trim: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom du fournisseur est requis'],
    trim: true
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse du fournisseur est requise'],
    trim: true
  },
  telephone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour les recherches
fournisseurSchema.index({ numero: 1 });
fournisseurSchema.index({ nom: 1 });

module.exports = mongoose.model('Fournisseur', fournisseurSchema);