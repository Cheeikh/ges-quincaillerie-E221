const mongoose = require('mongoose');

const sousCategorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la sous-catégorie est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    required: [true, 'La catégorie parent est requise']
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index composé pour éviter les doublons nom + catégorie
sousCategorieSchema.index({ nom: 1, categorie: 1 }, { unique: true });

module.exports = mongoose.model('SousCategorie', sousCategorieSchema);