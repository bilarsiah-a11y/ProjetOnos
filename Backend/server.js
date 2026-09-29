require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./Routes/authRoutes');
const dentisteRoutes = require('./Routes/dentisteRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const actualiteRoutes = require('./Routes/actualiteRoutes');

require('./Config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dentistes', dentisteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/actualites', actualiteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur Onos sur le port ${PORT}`));