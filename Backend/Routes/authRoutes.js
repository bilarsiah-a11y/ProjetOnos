const express = require('express');
const router = express.Router();
const auth = require('../Auth/authController');
const { verifyToken } = require('../Auth/authMiddleware');
const {
  limiteConnexion,
  limiteInscription,
  limiteMotDePasseOublie,
  limiteReinitialisation,
} = require('../Utils/limiteurs');

router.post('/register', limiteInscription, auth.register);
router.post('/login', limiteConnexion, auth.login);
router.post('/forgot-password', limiteMotDePasseOublie, auth.forgotPassword);
router.post('/reset-password', limiteReinitialisation, auth.resetPassword);
router.get('/me', verifyToken, auth.me);

module.exports = router;