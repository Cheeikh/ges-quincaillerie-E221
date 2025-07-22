const Paiement = require('../models/Paiement');
const Commande = require('../models/Commande');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee, calculerMontantVersement } = require('../utils/helpers');

// Enregistrer un paiement
const createPaiement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { commande: commandeId, montant, numeroVersement, notes } = req.body;

    // Vérifier que la commande existe et est livrée
    const commande = await Commande.findById(commandeId);
    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (commande.statut !== 'livre' && commande.statut !== 'paye') {
      return res.status(400).json({
        success: false,
        message: 'La commande doit être livrée avant de pouvoir enregistrer un paiement'
      });
    }

    // Vérifier que ce numéro de versement n'existe pas déjà pour cette commande
    const paiementExistant = await Paiement.findOne({
      commande: commandeId,
      numeroVersement
    });

    if (paiementExistant) {
      return res.status(400).json({
        success: false,
        message: `Le versement n°${numeroVersement} a déjà été enregistré pour cette commande`
      });
    }

    // Calculer le montant total déjà payé
    const paiementsExistants = await Paiement.find({ commande: commandeId });
    const montantDejaPaye = paiementsExistants.reduce((total, p) => total + p.montant, 0);
    const montantRestant = commande.montant - montantDejaPaye;

    // Vérifier que le montant du paiement ne dépasse pas le montant restant
    if (montant > montantRestant) {
      return res.status(400).json({
        success: false,
        message: `Le montant du paiement (${montant}) dépasse le montant restant (${montantRestant})`
      });
    }

    // Créer le paiement
    const paiement = new Paiement({
      commande: commandeId,
      montant,
      numeroVersement,
      responsablePaiement: req.user._id,
      notes
    });

    await paiement.save();

    // Vérifier si la commande est entièrement payée
    const nouveauMontantPaye = montantDejaPaye + montant;
    if (nouveauMontantPaye >= commande.montant) {
      commande.statut = 'paye';
      await commande.save();
    }

    // Peupler les données pour la réponse
    await paiement.populate([
      {
        path: 'commande',
        populate: {
          path: 'fournisseur',
          select: 'numero nom'
        }
      },
      { path: 'responsablePaiement', select: 'nom prenom' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Paiement enregistré avec succès',
      data: {
        paiement
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir tous les paiements
const getPaiements = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      commande,
      dateDebut,
      dateFin,
      fournisseur
    } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    // Construire le filtre
    const filter = {};
    if (commande) filter.commande = commande;

    if (dateDebut || dateFin) {
      filter.date = {};
      if (dateDebut) filter.date.$gte = new Date(dateDebut);
      if (dateFin) filter.date.$lte = new Date(dateFin);
    }

    // Pipeline d'agrégation pour filtrer par fournisseur si nécessaire
    let pipeline = [
      {
        $lookup: {
          from: 'commandes',
          localField: 'commande',
          foreignField: '_id',
          as: 'commandeData'
        }
      },
      { $unwind: '$commandeData' }
    ];

    if (fournisseur) {
      pipeline.push({
        $match: { 'commandeData.fournisseur': new mongoose.Types.ObjectId(fournisseur) }
      });
    }

    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'fournisseurs',
          localField: 'commandeData.fournisseur',
          foreignField: '_id',
          as: 'fournisseurData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'responsablePaiement',
          foreignField: '_id',
          as: 'responsableData'
        }
      },
      {
        $project: {
          numero: 1,
          montant: 1,
          date: 1,
          numeroVersement: 1,
          notes: 1,
          'commande.numero': '$commandeData.numero',
          'commande.montant': '$commandeData.montant',
          'fournisseur.numero': { $arrayElemAt: ['$fournisseurData.numero', 0] },
          'fournisseur.nom': { $arrayElemAt: ['$fournisseurData.nom', 0] },
          'responsablePaiement.nom': { $arrayElemAt: ['$responsableData.nom', 0] },
          'responsablePaiement.prenom': { $arrayElemAt: ['$responsableData.prenom', 0] }
        }
      },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    const [paiements, totalCount] = await Promise.all([
      Paiement.aggregate(pipeline),
      Paiement.countDocuments(filter)
    ]);

    const response = construireReponsePaginee(paiements, totalCount, page, limit);

    res.json({
      success: true,
      message: 'Paiements récupérés avec succès',
      ...response
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir l'historique des versements d'une commande
const getHistoriqueVersements = async (req, res) => {
  try {
    const { commandeId } = req.params;

    const commande = await Commande.findById(commandeId)
      .populate('fournisseur', 'numero nom');

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const paiements = await Paiement.find({ commande: commandeId })
      .populate('responsablePaiement', 'nom prenom')
      .sort({ numeroVersement: 1 });

    const montantPaye = paiements.reduce((total, p) => total + p.montant, 0);
    const montantRestant = commande.montant - montantPaye;

    res.json({
      success: true,
      message: 'Historique des versements récupéré avec succès',
      data: {
        commande: {
          numero: commande.numero,
          montant: commande.montant,
          fournisseur: commande.fournisseur
        },
        paiements,
        resume: {
          montantTotal: commande.montant,
          montantPaye,
          montantRestant,
          nombreVersements: paiements.length,
          estEntierementPaye: montantRestant <= 0
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les commandes en cours (livrées mais non entièrement payées)
const getCommandesEnCours = async (req, res) => {
  try {
    const { page = 1, limit = 10, fournisseur } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    // Pipeline d'agrégation pour obtenir les commandes avec le montant restant
    let pipeline = [
      { $match: { statut: { $in: ['livre', 'paye'] } } },
      {
        $lookup: {
          from: 'paiements',
          localField: '_id',
          foreignField: 'commande',
          as: 'paiements'
        }
      },
      {
        $addFields: {
          montantPaye: { $sum: '$paiements.montant' },
          montantRestant: { $subtract: ['$montant', { $sum: '$paiements.montant' }] }
        }
      },
      { $match: { montantRestant: { $gt: 0 } } }
    ];

    if (fournisseur) {
      pipeline.splice(1, 0, {
        $match: { fournisseur: new mongoose.Types.ObjectId(fournisseur) }
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'fournisseurs',
          localField: 'fournisseur',
          foreignField: '_id',
          as: 'fournisseurData'
        }
      },
      {
        $project: {
          numero: 1,
          date: 1,
          montant: 1,
          montantPaye: 1,
          montantRestant: 1,
          dateLivraisonReelle: 1,
          'fournisseur.numero': { $arrayElemAt: ['$fournisseurData.numero', 0] },
          'fournisseur.nom': { $arrayElemAt: ['$fournisseurData.nom', 0] }
        }
      },
      { $sort: { dateLivraisonReelle: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    const [commandes, totalCount] = await Promise.all([
      Commande.aggregate(pipeline),
      Commande.aggregate([
        ...pipeline.slice(0, -3),
        { $count: 'total' }
      ])
    ]);

    const total = totalCount[0]?.total || 0;
    const response = construireReponsePaginee(commandes, total, page, limit);

    res.json({
      success: true,
      message: 'Commandes en cours récupérées avec succès',
      ...response
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes en cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir la dette par fournisseur
const getDetteParFournisseur = async (req, res) => {
  try {
    const pipeline = [
      { $match: { statut: { $in: ['livre', 'paye'] } } },
      {
        $lookup: {
          from: 'paiements',
          localField: '_id',
          foreignField: 'commande',
          as: 'paiements'
        }
      },
      {
        $addFields: {
          montantPaye: { $sum: '$paiements.montant' },
          montantRestant: { $subtract: ['$montant', { $sum: '$paiements.montant' }] }
        }
      },
      { $match: { montantRestant: { $gt: 0 } } },
      {
        $group: {
          _id: '$fournisseur',
          detteTotal: { $sum: '$montantRestant' },
          nombreCommandes: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'fournisseurs',
          localField: '_id',
          foreignField: '_id',
          as: 'fournisseurData'
        }
      },
      {
        $project: {
          _id: 1,
          detteTotal: 1,
          nombreCommandes: 1,
          'fournisseur.numero': { $arrayElemAt: ['$fournisseurData.numero', 0] },
          'fournisseur.nom': { $arrayElemAt: ['$fournisseurData.nom', 0] }
        }
      },
      { $sort: { detteTotal: -1 } }
    ];

    const dettes = await Commande.aggregate(pipeline);

    res.json({
      success: true,
      message: 'Dette par fournisseur récupérée avec succès',
      data: {
        dettes
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createPaiement,
  getPaiements,
  getHistoriqueVersements,
  getCommandesEnCours,
  getDetteParFournisseur
};