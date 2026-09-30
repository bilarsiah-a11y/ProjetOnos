const express = require('express');
const router = express.Router();
const admin = require('../Api/adminController');
const { verifyToken, requireRole } = require('../Auth/authMiddleware');

// Toutes les routes ci-dessous : connecté ET admin
router.use(verifyToken, requireRole('admin'));

router.get('/demandes', admin.listerDemandes);
router.patch('/demandes/:id/accepter', admin.accepterDemande);
router.delete('/demandes/:id', admin.refuserDemande);
router.get('/dentistes', admin.listerDentistes);
router.delete('/dentistes/:id', admin.supprimerDentiste);
router.put('/compte', admin.modifierCompte);

module.exports = router;