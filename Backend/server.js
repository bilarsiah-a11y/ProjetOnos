require('dotenv').config();
require('./Config/db');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./Routes/authRoutes');
const dentisteRoutes = require('./Routes/dentisteRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const actualiteRoutes = require('./Routes/actualiteRoutes');

const app = express();

// En-têtes de sécurité (cross-origin autorisé pour que le front affiche les images)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Seul ton front peut appeler l'API depuis un navigateur
app.use(cors({ origin: process.env.FRONT_URL || 'http://localhost:5173' }));

app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dentistes', dentisteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/actualites', actualiteRoutes);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// Erreur inattendue (JSON mal formé, etc.)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalide' });
  }
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur Onos sur le port ${PORT}`));