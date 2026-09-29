const express = require('express');
const router = express.Router();
const auth = require('../Auth/authController');
const { verifyToken } = require('../Auth/authMiddleware');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/me', verifyToken, auth.me);

module.exports = router;