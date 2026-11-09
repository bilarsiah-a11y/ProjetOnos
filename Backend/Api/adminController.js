const bcrypt = require('bcrypt');
const pool = require('../Config/db');
const sendMail = require('../Utils/sendMail');
const { supprimerFichier } = require('../Utils/upload');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let adminOtpStore = {};

// GET /api/admin/demandes : inscriptions en attente
exports.listerDemandes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, mail, created_at
       FROM utilisateur
       WHERE role = 'dentiste' AND statut = 'en_attente'
       ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PATCH /api/admin/demandes/:id/accepter
exports.accepterDemande = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Identifiant invalide' });

    const { rows } = await pool.query(
      `UPDATE utilisateur SET statut = 'valide'
       WHERE id = $1 AND role = 'dentiste' AND statut = 'en_attente'
       RETURNING mail`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Demande introuvable ou déjà traitée' });
    }

    // L'email ne doit pas bloquer la validation s'il échoue
    try {
      await sendMail(
        rows[0].mail,
        'Onos : votre compte est validé',
        "Bonne nouvelle : votre inscription a été validée par l'administrateur.\n\nVous pouvez maintenant vous connecter et compléter votre profil."
      );
    } catch (e) {
      console.error('Email de validation non envoyé :', e.message);
    }

    res.json({ message: 'Dentiste validé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/admin/demandes/:id : refuser (supprime la demande et prévient par email)
exports.refuserDemande = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Identifiant invalide' });

    const { rows } = await pool.query(
      `DELETE FROM utilisateur
       WHERE id = $1 AND role = 'dentiste' AND statut = 'en_attente'
       RETURNING mail`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Demande introuvable ou déjà traitée' });
    }

    try {
      await sendMail(
        rows[0].mail,
        "Onos : Réponse à votre demande d'inscription",
        "Bonjour,\n\nAprès examen, votre demande d'inscription sur Onos n'a pas pu être acceptée."
      );
    } catch (e) {
      console.error('Email de refus non envoyé :', e.message);
    }

    res.json({ message: 'Demande refusée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/admin/dentistes : dentistes validés (avec leur profil s'il existe)
exports.listerDentistes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.mail, u.created_at,
              d.nom, d.prenom, d.date_naissance, d.lieu_naissance, d.genre,
              d.adresse, d.contact, d.autre_contact, d.titre, d.domaine, d.region,
              d.photo
       FROM utilisateur u
       LEFT JOIN dentiste d ON d.utilisateur_id = u.id
       WHERE u.role = 'dentiste' AND u.statut = 'valide'
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/admin/dentistes/:id : supprime le compte, le profil (cascade) et la photo
exports.supprimerDentiste = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Identifiant invalide' });

    const photo = await pool.query(
      `SELECT photo FROM dentiste WHERE utilisateur_id = $1`,
      [id]
    );

    const { rowCount } = await pool.query(
      `DELETE FROM utilisateur
       WHERE id = $1 AND role = 'dentiste' AND statut = 'valide'`,
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Dentiste introuvable' });
    }

    if (photo.rows[0]) supprimerFichier(photo.rows[0].photo);
    res.json({ message: 'Dentiste supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/admin/compte : modifier son email et/ou son mot de passe
exports.modifierCompte = async (req, res) => {
  try {
    
    const actuel = req.body.mot_de_passe_actuel || '';
    const nouveauMail = (req.body.nouveau_mail || '').trim().toLowerCase();
    const nouveauMdp = req.body.nouveau_mot_de_passe || '';

    if (!nouveauMail && !nouveauMdp) {
      return res.status(400).json({ message: 'Rien à modifier' });
    }
    if (nouveauMail && !EMAIL_REGEX.test(nouveauMail)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }
    if (nouveauMdp && nouveauMdp.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Si tu veux forcer le mot de passe actuel EN PLUS de l'OTP :
    const { rows } = await pool.query(
      `SELECT mot_de_passe FROM utilisateur WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0] || !(await bcrypt.compare(actuel, rows[0].mot_de_passe))) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    const champs = [];
    const valeurs = [];
    if (nouveauMail) {
      valeurs.push(nouveauMail);
      champs.push(`mail = $${valeurs.length}`);
    }
    if (nouveauMdp) {
      valeurs.push(await bcrypt.hash(nouveauMdp, 10));
      champs.push(`mot_de_passe = $${valeurs.length}`);
    }
    valeurs.push(req.user.id);

    await pool.query(
      `UPDATE utilisateur SET ${champs.join(', ')} WHERE id = $${valeurs.length}`,
      valeurs
    );
    res.json({ message: 'Compte mis à jour' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Cette adresse email est déjà utilisée' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// NOUVELLE FONCTION : Demander l'envoi de l'OTP
exports.demanderOtpModification = async (req, res) => {
  try {
    const { mail } = req.body;

    // 1. Vérifier si l'email correspond à l'admin connecté
    const { rows } = await pool.query(
      `SELECT id, mail FROM utilisateur WHERE id = $1 AND role = 'admin'`,
      [req.user.id]
    );
    
    if (!rows[0] || rows[0].mail !== mail) {
      return res.status(400).json({ message: "L'adresse email ne correspond pas à votre compte administrateur." });
    }

    // 2. Générer un code à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Stocker le code avec une expiration (ex: 10 minutes)
    adminOtpStore[req.user.id] = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // 4. Envoyer le mail
    await sendMail(
      mail,
      "Code de sécurité - Modification de compte Onos",
      `Voici votre code de sécurité pour modifier vos identifiants : ${otpCode}\n\nCe code expirera dans 10 minutes.`
    );

    res.json({ message: "Code OTP envoyé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du code' });
  }
};

// NOUVELLE FONCTION : Vérifier l'OTP (utilisée par le front)
exports.verifierOtpModification = async (req, res) => {
  try {
    const { otp } = req.body;
    const record = adminOtpStore[req.user.id];

    if (!record || record.code !== otp) {
      return res.status(400).json({ message: "Code OTP invalide." });
    }

    if (Date.now() > record.expiresAt) {
      delete adminOtpStore[req.user.id];
      return res.status(400).json({ message: "Le code OTP a expiré." });
    }

    // Si valide, on supprime l'OTP pour qu'il ne soit pas réutilisé
    delete adminOtpStore[req.user.id];
    
    res.json({ message: "Code validé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};