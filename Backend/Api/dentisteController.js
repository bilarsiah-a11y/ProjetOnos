const pool = require('../Config/db');
const { supprimerFichier } = require('../Utils/upload');

const bcrypt = require('bcrypt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CHAMPS = [
  'nom', 'prenom', 'date_naissance', 'lieu_naissance', 'genre',
  'adresse', 'contact', 'autre_contact', 'titre', 'domaine', 'region',
];
const OBLIGATOIRES = ['nom', 'prenom', 'genre', 'contact', 'titre', 'domaine', 'region'];

// Garde uniquement les champs autorisés ; texte vide => null
function nettoyer(body) {
  const data = {};
  for (const champ of CHAMPS) {
    if (body[champ] !== undefined) {
      const v = typeof body[champ] === 'string' ? body[champ].trim() : body[champ];
      data[champ] = v === '' ? null : v;
    }
  }
  return data;
}

// Gère les erreurs de valeurs invalides (ENUM, date, longueur)
function gererErreur(err, res) {
  if (['22P02', '22007', '22008', '22001'].includes(err.code)) {
    return res.status(400).json({
      message: 'Une valeur est invalide (genre, titre, domaine, région, date ou texte trop long)',
    });
  }
  console.error(err);
  return res.status(500).json({ message: 'Erreur serveur' });
}

// GET /api/dentistes/options : listes pour les menus déroulants
exports.options = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.typname, e.enumlabel
       FROM pg_enum e
       JOIN pg_type t ON t.oid = e.enumtypid
       WHERE t.typname IN ('genre_type', 'titre_type', 'domaine_type', 'region_type')
       ORDER BY t.typname, e.enumsortorder`
    );
    const cle = {
      genre_type: 'genres',
      titre_type: 'titres',
      domaine_type: 'domaines',
      region_type: 'regions',
    };
    const resultat = { genres: [], titres: [], domaines: [], regions: [] };
    rows.forEach((r) => resultat[cle[r.typname]].push(r.enumlabel));
    res.json(resultat);
  } catch (err) {
    gererErreur(err, res);
  }
};

// GET /api/dentistes/mon-profil
exports.monProfil = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM dentiste WHERE utilisateur_id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Profil non créé' });
    res.json(rows[0]);
  } catch (err) {
    gererErreur(err, res);
  }
};

// POST /api/dentistes/profil : créer son profil
exports.creerProfil = async (req, res) => {
  try {
    const data = nettoyer(req.body);
    const manquants = OBLIGATOIRES.filter((c) => !data[c]);
    if (manquants.length) {
      return res.status(400).json({
        message: `Champs obligatoires manquants : ${manquants.join(', ')}`,
      });
    }

    const colonnes = Object.keys(data);
    const valeurs = Object.values(data);
    const params = colonnes.map((_, i) => `$${i + 2}`).join(', ');

    const { rows } = await pool.query(
      `INSERT INTO dentiste (utilisateur_id, ${colonnes.join(', ')})
       VALUES ($1, ${params})
       RETURNING *`,
      [req.user.id, ...valeurs]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Profil déjà créé, utilisez la modification' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ message: 'Compte introuvable' });
    }
    gererErreur(err, res);
  }
};

// PUT /api/dentistes/profil : modifier son profil (champs envoyés uniquement)
exports.modifierProfil = async (req, res) => {
  try {
    const data = nettoyer(req.body);
    const colonnes = Object.keys(data);
    if (!colonnes.length) {
      return res.status(400).json({ message: 'Rien à modifier' });
    }

    const vides = OBLIGATOIRES.filter((c) => c in data && !data[c]);
    if (vides.length) {
      return res.status(400).json({
        message: `Ces champs ne peuvent pas être vides : ${vides.join(', ')}`,
      });
    }

    const set = colonnes.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE dentiste SET ${set}
       WHERE utilisateur_id = $${colonnes.length + 1}
       RETURNING *`,
      [...Object.values(data), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Profil non créé' });
    res.json(rows[0]);
  } catch (err) {
    gererErreur(err, res);
  }
};

// PUT /api/dentistes/photo : ajouter ou remplacer sa photo (champ "photo")
exports.changerPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucune photo envoyée (champ "photo")' });
  }
  const nouvelle = `/uploads/${req.file.filename}`;
  try {
    const { rows } = await pool.query(
      `SELECT photo FROM dentiste WHERE utilisateur_id = $1`,
      [req.user.id]
    );
    if (!rows[0]) {
      supprimerFichier(nouvelle);
      return res.status(404).json({ message: "Créez d'abord votre profil" });
    }

    await pool.query(
      `UPDATE dentiste SET photo = $1 WHERE utilisateur_id = $2`,
      [nouvelle, req.user.id]
    );
    supprimerFichier(rows[0].photo); // supprime l'ancienne photo
    res.json({ photo: nouvelle });
  } catch (err) {
    supprimerFichier(nouvelle);
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/dentistes/photo : supprimer sa photo
exports.supprimerPhoto = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT photo FROM dentiste WHERE utilisateur_id = $1`,
      [req.user.id]
    );
    if (!rows[0] || !rows[0].photo) {
      return res.status(404).json({ message: 'Aucune photo à supprimer' });
    }

    await pool.query(
      `UPDATE dentiste SET photo = NULL WHERE utilisateur_id = $1`,
      [req.user.id]
    );
    supprimerFichier(rows[0].photo);
    res.json({ message: 'Photo supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/dentistes : annuaire public (?region=&domaine=&recherche=)
exports.annuaire = async (req, res) => {
  try {
    const { region, domaine, recherche } = req.query;
    const conditions = [`u.statut = 'valide'`];
    const valeurs = [];

    if (region) {
      valeurs.push(region);
      conditions.push(`d.region = $${valeurs.length}`);
    }
    if (domaine) {
      valeurs.push(domaine);
      conditions.push(`d.domaine = $${valeurs.length}`);
    }
    if (recherche) {
      valeurs.push(`%${recherche}%`);
      conditions.push(
        `(d.nom ILIKE $${valeurs.length} OR d.prenom ILIKE $${valeurs.length})`
      );
    }

    const { rows } = await pool.query(
      `SELECT d.id, d.nom, d.prenom, d.genre, d.titre, d.domaine, d.region,
              d.adresse, d.contact, d.autre_contact, d.photo
       FROM dentiste d
       JOIN utilisateur u ON u.id = d.utilisateur_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY d.nom, d.prenom`,
      valeurs
    );
    res.json(rows);
  } catch (err) {
    gererErreur(err, res);
  }
};

// GET /api/dentistes/:id : fiche publique d'un dentiste
exports.detail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Identifiant invalide' });

    const { rows } = await pool.query(
      `SELECT d.id, d.nom, d.prenom, d.genre, d.titre, d.domaine, d.region,
              d.adresse, d.contact, d.autre_contact, d.photo
       FROM dentiste d
       JOIN utilisateur u ON u.id = d.utilisateur_id
       WHERE d.id = $1 AND u.statut = 'valide'`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Dentiste introuvable' });
    res.json(rows[0]);
  } catch (err) {
    gererErreur(err, res);
  }
};
// PUT /api/dentistes/compte : modifier son email et/ou son mot de passe
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