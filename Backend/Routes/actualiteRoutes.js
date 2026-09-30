const express = require('express');
const router = express.Router();
const actualite = require('../Api/actualiteController');
const { verifyToken, requireRole } = require('../Auth/authMiddleware');
const { uploadImage } = require('../Utils/upload');

// Publiques
router.get('/', actualite.lister);
router.get('/:id', actualite.detail);

// Admin uniquement (le token est vérifié AVANT d'accepter un fichier)
router.post('/', verifyToken, requireRole('admin'), uploadImage, actualite.creer);
router.delete('/:id', verifyToken, requireRole('admin'), actualite.supprimer);

module.exports = router;