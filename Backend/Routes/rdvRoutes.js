const express = require('express');
const router = express.Router();
const rdv = require('../Api/rdvController');
const { verifyToken, requireRole } = require('../Auth/authMiddleware');

// Limite simple en mémoire : 5 réservations par IP toutes les 10 minutes
const tentatives = new Map();
function limiterReservations(req, res, next) {
  const maintenant = Date.now();
  const fenetre = 10 * 60 * 1000;
  const liste = (tentatives.get(req.ip) || []).filter((t) => maintenant - t < fenetre);
  if (liste.length >= 5) {
    return res.status(429).json({ message: 'Trop de demandes. Réessayez dans quelques minutes.' });
  }
  liste.push(maintenant);
  tentatives.set(req.ip, liste);
  if (tentatives.size > 1000) tentatives.clear();
  next();
}

// Publiques
router.get('/dentistes-actifs', rdv.dentistesActifs);
router.get('/disponibilites/:dentisteId', rdv.disponibilites);
router.post('/', limiterReservations, rdv.reserver);

// Dentiste connecté
router.get('/horaires', verifyToken, requireRole('dentiste'), rdv.lireHoraires);
router.put('/horaires', verifyToken, requireRole('dentiste'), rdv.definirHoraires);
router.get('/mes-rdv', verifyToken, requireRole('dentiste'), rdv.mesRdv);
router.patch('/:id/confirmer', verifyToken, requireRole('dentiste'), rdv.confirmer);
router.patch('/:id/annuler', verifyToken, requireRole('dentiste'), rdv.annuler);

module.exports = router;