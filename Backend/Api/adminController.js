const bcrypt = require('bcrypt');
const pool = require('../Config/db');
const sendMail = require('../Utils/sendMail');
const { supprimerFichier } = require('../Utils/upload');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    // L'email ne doit pas bloquer le refus s'il échoue
    try {
      await sendMail(
        rows[0].mail,
        "Onos : réponse à votre demande d'inscription",
        "Bonjour,\n\nAprès examen, votre demande d'inscription sur Onos n'a pas pu être acceptée.\n\nPour toute question, vous pouvez nous contacter."
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