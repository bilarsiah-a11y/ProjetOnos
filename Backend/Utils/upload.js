const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const DOSSIER = path.join(__dirname, '..', 'Uploads');
fs.mkdirSync(DOSSIER, { recursive: true });

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOSSIER),
  filename: (req, file, cb) => {
    const nom = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, nom + EXTENSIONS[file.mimetype]);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new Error('FORMAT_IMAGE'));
  },
});

// Crée un middleware pour un champ de formulaire donné ("image", "photo"...)
function creerMiddleware(champ) {
  return (req, res, next) => {
    upload.single(champ)(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image trop lourde (5 Mo maximum)' });
      }
      if (err.message === 'FORMAT_IMAGE') {
        return res.status(400).json({ message: 'Format accepté : JPG, PNG ou WebP' });
      }
      console.error(err);
      res.status(400).json({ message: "Erreur lors de l'envoi de l'image" });
    });
  };
}

// Supprime un fichier du dossier Uploads (ne plante pas s'il n'existe plus)
function supprimerFichier(chemin) {
  if (!chemin) return;
  const fichier = path.join(DOSSIER, path.basename(chemin));
  fs.unlink(fichier, (err) => {
    if (err && err.code !== 'ENOENT') console.error(err.message);
  });
}

module.exports = {
  uploadImage: creerMiddleware('image'),
  uploadPhoto: creerMiddleware('photo'),
  supprimerFichier,
};