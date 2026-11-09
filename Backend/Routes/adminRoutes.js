const express = require('express');
const router = express.Router();
const admin = require('../Api/adminController');
const { verifyToken, requireRole } = require('../Auth/authMiddleware');

// Toutes les routes ci-dessous : connecté ET admin
router.use(verifyToken, requireRole('admin'));

// --- GESTION DES DEMANDES ET DENTISTES ---
router.get('/demandes', admin.listerDemandes);
router.patch('/demandes/:id/accepter', admin.accepterDemande);
router.delete('/demandes/:id', admin.refuserDemande);
router.get('/dentistes', admin.listerDentistes);
router.delete('/dentistes/:id', admin.supprimerDentiste);

// --- MODIFICATION DU COMPTE (AVEC OTP) ---
// Route pour demander l'envoi du code OTP par mail
router.post('/compte/otp', admin.demanderOtpModification);

// Route pour vérifier si le code OTP saisi est correct
router.post('/compte/verifier-otp', admin.verifierOtpModification);

// Route finale pour appliquer les modifications (une fois l'OTP validé)
router.put('/compte', admin.modifierCompte);

module.exports = router;