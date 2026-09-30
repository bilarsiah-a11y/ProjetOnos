require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../Config/db');

async function creerAdmin() {
  const [mail, motDePasse] = process.argv.slice(2);

  if (!mail || !motDePasse) {
    console.log('Usage : node Scripts/creerAdmin.js <mail> <mot_de_passe>');
    process.exit(1);
  }
  if (motDePasse.length < 8) {
    console.log('Le mot de passe doit contenir au moins 8 caractères');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(motDePasse, 10);
    await pool.query(
      `INSERT INTO utilisateur (mail, mot_de_passe, role, statut)
       VALUES ($1, $2, 'admin', 'valide')`,
      [mail.trim().toLowerCase(), hash]
    );
    console.log(`Compte admin créé : ${mail}`);
  } catch (err) {
    if (err.code === '23505') {
      console.log('Cette adresse email existe déjà dans la base.');
    } else {
      console.error('Erreur :', err.message);
    }
  } finally {
    await pool.end();
  }
}

creerAdmin();