const express = require('express');
const router = express.Router();
const dentiste = require('../Api/dentisteController');
const { verifyToken, requireRole } = require('../Auth/authMiddleware');
const { uploadPhoto } = require('../Utils/upload');

// Publiques
router.get('/options', dentiste.options);
router.get('/', dentiste.annuaire);


// Dentiste connecté (à placer AVANT '/:id')
router.get('/mon-profil', verifyToken, requireRole('dentiste'), dentiste.monProfil);
router.post('/profil', verifyToken, requireRole('dentiste'), dentiste.creerProfil);
router.put('/profil', verifyToken, requireRole('dentiste'), dentiste.modifierProfil);
router.put('/photo', verifyToken, requireRole('dentiste'), uploadPhoto, dentiste.changerPhoto);
router.delete('/photo', verifyToken, requireRole('dentiste'), dentiste.supprimerPhoto);
router.put('/compte', verifyToken, requireRole('dentiste'), dentiste.modifierCompte);
// Fiche publique
router.get('/:id', dentiste.detail);

module.exports = router;