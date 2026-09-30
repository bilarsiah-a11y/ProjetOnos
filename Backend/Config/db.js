const { Pool, types } = require('pg');
require('dotenv').config();


types.setTypeParser(1082, (valeur) => valeur);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect()
  .then(c => { console.log('PostgreSQL connecté'); c.release(); })
  .catch(err => console.error('Erreur PostgreSQL :', err.message));

module.exports = pool;