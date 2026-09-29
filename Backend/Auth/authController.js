const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../Config/db');
const generateOtp = require('../Utils/generateOtp');
const sendMail = require('../Utils/sendMail');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const mail = (req.body.mail || '').trim().toLowerCase();
    const motDePasse = req.body.mot_de_passe || '';

    if (!EMAIL_REGEX.test(mail)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }
    if (motDePasse.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    await pool.query(
      `INSERT INTO utilisateur (mail, mot_de_passe) VALUES ($1, $2)`,
      [mail, hash]
    );

    res.status(201).json({
      message: "Demande d'inscription envoyée. Vous pourrez vous connecter après validation par l'administrateur.",
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Cette adresse email est déjà utilisée' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const mail = (req.body.mail || '').trim().toLowerCase();
    const motDePasse = req.body.mot_de_passe || '';

    const { rows } = await pool.query(
      `SELECT id, mail, mot_de_passe, role, statut FROM utilisateur WHERE mail = $1`,
      [mail]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(motDePasse, user.mot_de_passe))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (user.statut === 'en_attente') {
      return res.status(403).json({ message: "Votre demande est en attente de validation par l'administrateur" });
    }
    if (user.statut === 'refuse') {
      return res.status(403).json({ message: "Votre demande d'inscription n'a pas été acceptée" });
    }

    const profil = await pool.query(
      `SELECT 1 FROM dentiste WHERE utilisateur_id = $1`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      utilisateur: {
        id: user.id,
        mail: user.mail,
        role: user.role,
        aProfil: profil.rowCount > 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/auth/me  (protégée)
exports.me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, mail, role, statut FROM utilisateur WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const reponse = {
    message: 'Si ce compte existe et est validé, un code a été envoyé par email.',
  };
  try {
    const mail = (req.body.mail || '').trim().toLowerCase();

    const { rows } = await pool.query(
      `SELECT id FROM utilisateur WHERE mail = $1 AND statut = 'valide'`,
      [mail]
    );
    if (!rows[0]) return res.json(reponse); // même réponse : on ne révèle rien

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await pool.query(
      `UPDATE utilisateur
       SET otp_hash = $1, otp_expire = NOW() + INTERVAL '10 minutes'
       WHERE id = $2`,
      [otpHash, rows[0].id]
    );

    await sendMail(
      mail,
      'Onos : code de réinitialisation',
      `Votre code de réinitialisation est : ${otp}\n\nIl est valable 10 minutes. Si vous n'avez rien demandé, ignorez ce message.`
    );

    res.json(reponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const mail = (req.body.mail || '').trim().toLowerCase();
    const otp = (req.body.otp || '').trim().toUpperCase();
    const nouveau = req.body.nouveau_mot_de_passe || '';

    if (nouveau.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const { rows } = await pool.query(
      `SELECT id, otp_hash FROM utilisateur
       WHERE mail = $1 AND statut = 'valide'
         AND otp_hash IS NOT NULL AND otp_expire > NOW()`,
      [mail]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(otp, user.otp_hash))) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    const hash = await bcrypt.hash(nouveau, 10);
    await pool.query(
      `UPDATE utilisateur
       SET mot_de_passe = $1, otp_hash = NULL, otp_expire = NULL
       WHERE id = $2`,
      [hash, user.id]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};