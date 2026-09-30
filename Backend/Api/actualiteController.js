const fs = require('fs');
const path = require('path');
const pool = require('../Config/db');

// Supprime le fichier image du disque (ne plante pas s'il n'existe plus)
function supprimerFichier(cheminImage) {
  if (!cheminImage) return;
  const fichier = path.join(__dirname, '..', 'Uploads', path.basename(cheminImage));
  fs.unlink(fichier, (err) => {
    if (err && err.code !== 'ENOENT') console.error(err.message);
  });
}

// GET /api/actualites : liste publique, la plus récente d'abord
exports.lister = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, titre, contenu, image, created_at
       FROM actualite
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/actualites/:id : une actualité
exports.detail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Identifiant invalide' });

    const { rows } = await pool.query(
      `SELECT id, titre, contenu, image, created_at FROM actualite WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Actualité introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/actualites (admin) : titre, contenu, image facultative
exports.creer = async (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const titre = (req.body.titre || '').trim();
    const contenu = (req.body.contenu || '').trim();

    if (!titre || !contenu) {
      supprimerFichier(image);
      return res.status(400).json({ message: 'Le titre et le contenu sont obligatoires' });
    }
    if (titre.length > 200) {
      supprimerFichier(image);
      return res.status(400).json({ message: 'Le titre est trop long (200 caractères maximum)' });
    }

    const { rows } = await pool.query(
      `INSERT INTO actualite (titre, contenu, image)
       VALUES ($1, $2, $3)
       RETURNING id, titre, contenu, image, created_at`,
      [titre, contenu, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    supprimerFichier(image);
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/actualites/:id (admin) : supprime l'actualité et son image
exports.supprimer = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Identifiant invalide' });

    const { rows } = await pool.query(
      `DELETE FROM actualite WHERE id = $1 RETURNING image`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Actualité introuvable' });

    supprimerFichier(rows[0].image);
    res.json({ message: 'Actualité supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};