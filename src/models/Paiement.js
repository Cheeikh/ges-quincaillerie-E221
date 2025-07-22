const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true,
    required: true
  },
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: [true, 'La commande est requise']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant du paiement est requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  date: {
    type: Date,
    required: [true, 'La date du paiement est requise'],
    default: Date.now
  },
  numeroVersement: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  responsablePaiement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Middleware pour générer automatiquement le numéro de paiement
paiementSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    const count = await mongoose.model('Paiement').countDocuments();
    this.numero = `PAY-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index pour les recherches
paiementSchema.index({ numero: 1 });
paiementSchema.index({ commande: 1 });
paiementSchema.index({ date: 1 });

// Index composé pour éviter les doublons commande + numéro de versement
paiementSchema.index({ commande: 1, numeroVersement: 1 }, { unique: true });

module.exports = mongoose.model('Paiement', paiementSchema);