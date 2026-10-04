const pool = require('../Config/db');

// Madagascar : UTC+3 toute l'année (pas d'heure d'été)
const DECALAGE_HEURES = 3;
// Aujourd'hui + 6 jours = 7 jours réservables
const JOURS_RESERVABLES = 6;
// Les rendez-vous doivent se terminer au plus tard à cette heure
const HEURE_FERMETURE = '17:30';

const HEURE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TEL_REGEX = /^\+?[\d\s.-]{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Outils ---------- */

const enMinutes = (h) => parseInt(h.slice(0, 2), 10) * 60 + parseInt(h.slice(3, 5), 10);
const deMinutes = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// Date et heure actuelles à Madagascar
function maintenant() {
  const d = new Date(Date.now() + DECALAGE_HEURES * 3600 * 1000);
  return {
    date: d.toISOString().slice(0, 10),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
  };
}

function dateValide(s) {
  if (!DATE_REGEX.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function ajouterJours(s, n) {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 1 = lundi ... 7 = dimanche
function jourSemaine(s) {
  const j = new Date(`${s}T00:00:00Z`).getUTCDay();
  return j === 0 ? 7 : j;
}
function erreurDate(date) {
  if (!dateValide(date)) return 'Date invalide';
  const auj = maintenant().date;
  if (date < auj) return 'Cette date est déjà passée';
  if (date > ajouterJours(auj, JOURS_RESERVABLES)) {
    return `Réservation possible uniquement dans les ${JOURS_RESERVABLES + 1} prochains jours`;
  }
  return null;
}

function genererCreneaux(plages, duree) {
  const creneaux = [];
  for (const p of plages) {
    let t = enMinutes(p.heure_debut);
    const fin = Math.min(enMinutes(p.heure_fin), enMinutes(HEURE_FERMETURE));
    while (t + duree <= fin) {
      creneaux.push(deMinutes(t));
      t += duree;
    }
  }
  return creneaux;
}

async function dentisteDeUtilisateur(utilisateurId) {
  const { rows } = await pool.query(
    `SELECT id FROM dentiste WHERE utilisateur_id = $1`,
    [utilisateurId]
  );
  return rows[0] ? rows[0].id : null;
}

// Créneaux libres d'un dentiste pour une date (null si dentiste introuvable)
async function creneauxLibres(dentisteId, date) {
  const dentiste = await pool.query(`SELECT duree_rdv FROM dentiste WHERE id = $1`, [dentisteId]);
  if (!dentiste.rows[0]) return null;

  const plages = await pool.query(
    `SELECT to_char(heure_debut, 'HH24:MI') AS heure_debut,
            to_char(heure_fin, 'HH24:MI') AS heure_fin
     FROM horaire
     WHERE dentiste_id = $1 AND jour_semaine = $2
     ORDER BY heure_debut`,
    [dentisteId, jourSemaine(date)]
  );
  const pris = await pool.query(
    `SELECT to_char(heure, 'HH24:MI') AS heure
     FROM rendez_vous
     WHERE dentiste_id = $1 AND date_rdv = $2 AND statut <> 'annule'`,
    [dentisteId, date]
  );

  const occupes = new Set(pris.rows.map((r) => r.heure));
  const now = maintenant();

  return genererCreneaux(plages.rows, dentiste.rows[0].duree_rdv).filter(
    (h) =>
      !occupes.has(h) &&
      (date > now.date || (date === now.date && enMinutes(h) > now.minutes))
  );
}

/* ---------- Routes publiques ---------- */

// GET /api/rdv/dentistes-actifs : ids des dentistes qui ont défini des horaires
exports.dentistesActifs = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT dentiste_id FROM horaire`);
    res.json(rows.map((r) => r.dentiste_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/rdv/disponibilites/:dentisteId?date=YYYY-MM-DD
exports.disponibilites = async (req, res) => {
  try {
    const dentisteId = parseInt(req.params.dentisteId, 10);
    if (Number.isNaN(dentisteId)) return res.status(400).json({ message: 'Identifiant invalide' });

    const date = String(req.query.date || '');
    const probleme = erreurDate(date);
    if (probleme) return res.status(400).json({ message: probleme });

    const creneaux = await creneauxLibres(dentisteId, date);
    if (creneaux === null) return res.status(404).json({ message: 'Dentiste introuvable' });

    res.json({ date, creneaux });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/rdv : réserver un créneau (sans compte)
exports.reserver = async (req, res) => {
  try {
    const dentisteId = parseInt(req.body.dentiste_id, 10);
    const date = String(req.body.date || '');
    const heure = String(req.body.heure || '');
    const nom = String(req.body.nom || '').trim();
    const telephone = String(req.body.telephone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const motif = String(req.body.motif || '').trim();

    if (Number.isNaN(dentisteId)) return res.status(400).json({ message: 'Dentiste invalide' });
    const probleme = erreurDate(date);
    if (probleme) return res.status(400).json({ message: probleme });
    if (!HEURE_REGEX.test(heure)) return res.status(400).json({ message: 'Heure invalide' });
    if (nom.length < 2 || nom.length > 100) {
      return res.status(400).json({ message: 'Nom invalide (2 à 100 caractères)' });
    }
    if (!TEL_REGEX.test(telephone)) {
      return res.status(400).json({ message: 'Numéro de téléphone invalide' });
    }
    if (email && !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }
    if (motif.length > 300) {
      return res.status(400).json({ message: 'Le motif est trop long (300 caractères maximum)' });
    }

    const libres = await creneauxLibres(dentisteId, date);
    if (libres === null) return res.status(404).json({ message: 'Dentiste introuvable' });
    if (!libres.includes(heure)) {
      return res.status(409).json({ message: "Ce créneau n'est plus disponible" });
    }

    const { rows } = await pool.query(
      `INSERT INTO rendez_vous (dentiste_id, date_rdv, heure, nom_patient, telephone, email, motif)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, to_char(date_rdv, 'YYYY-MM-DD') AS date_rdv, to_char(heure, 'HH24:MI') AS heure`,
      [dentisteId, date, heure, nom, telephone, email || null, motif || null]
    );

    res.status(201).json({
      message:
        'Demande enregistrée. Le cabinet vous rappellera au numéro indiqué pour confirmer le rendez-vous.',
      rdv: rows[0],
    });
  } catch (err) {
    // Deux personnes ont réservé le même créneau au même instant
    if (err.code === '23505') {
      return res.status(409).json({ message: "Ce créneau vient d'être réservé par quelqu'un d'autre" });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* ---------- Routes dentiste ---------- */

// GET /api/rdv/horaires
exports.lireHoraires = async (req, res) => {
  try {
    const id = await dentisteDeUtilisateur(req.user.id);
    if (!id) return res.status(404).json({ message: "Créez d'abord votre profil" });

    const dentiste = await pool.query(`SELECT duree_rdv FROM dentiste WHERE id = $1`, [id]);
    const horaires = await pool.query(
      `SELECT id, jour_semaine,
              to_char(heure_debut, 'HH24:MI') AS heure_debut,
              to_char(heure_fin, 'HH24:MI') AS heure_fin
       FROM horaire WHERE dentiste_id = $1
       ORDER BY jour_semaine, heure_debut`,
      [id]
    );
    res.json({ duree_rdv: dentiste.rows[0].duree_rdv, horaires: horaires.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/rdv/horaires : remplace tous les horaires
exports.definirHoraires = async (req, res) => {
  let client;
  try {
    const id = await dentisteDeUtilisateur(req.user.id);
    if (!id) return res.status(404).json({ message: "Créez d'abord votre profil" });

    const duree = parseInt(req.body.duree_rdv, 10);
    if (!Number.isInteger(duree) || duree < 10 || duree > 120 || duree % 5 !== 0) {
      return res.status(400).json({ message: 'Durée invalide (10 à 120 minutes, par pas de 5)' });
    }
    if (!Array.isArray(req.body.horaires) || req.body.horaires.length > 21) {
      return res.status(400).json({ message: 'Horaires invalides (21 plages maximum)' });
    }

    const horaires = req.body.horaires.map((h) => ({
      jour_semaine: parseInt((h || {}).jour_semaine, 10),
      heure_debut: String((h || {}).heure_debut || ''),
      heure_fin: String((h || {}).heure_fin || ''),
    }));

    const parJour = {};
    for (const h of horaires) {
      if (!(h.jour_semaine >= 1 && h.jour_semaine <= 7)) {
        return res.status(400).json({ message: 'Jour invalide' });
      }
      if (!HEURE_REGEX.test(h.heure_debut) || !HEURE_REGEX.test(h.heure_fin)) {
        return res.status(400).json({ message: 'Heure invalide (format HH:MM)' });
      }
      if (h.heure_debut >= h.heure_fin) {
        return res.status(400).json({ message: "L'heure de fin doit être après l'heure de début" });
      }
      if (h.heure_fin > HEURE_FERMETURE) {
        return res.status(400).json({
          message: `Les rendez-vous doivent se terminer au plus tard à ${HEURE_FERMETURE}`,
        });
      }
      if (!parJour[h.jour_semaine]) parJour[h.jour_semaine] = [];
      parJour[h.jour_semaine].push(h);
    }
    for (const plages of Object.values(parJour)) {
      plages.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
      for (let i = 1; i < plages.length; i++) {
        if (plages[i].heure_debut < plages[i - 1].heure_fin) {
          return res.status(400).json({ message: 'Deux plages horaires se chevauchent' });
        }
      }
    }

    client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE dentiste SET duree_rdv = $1 WHERE id = $2`, [duree, id]);
      await client.query(`DELETE FROM horaire WHERE dentiste_id = $1`, [id]);
      for (const h of horaires) {
        await client.query(
          `INSERT INTO horaire (dentiste_id, jour_semaine, heure_debut, heure_fin)
           VALUES ($1, $2, $3, $4)`,
          [id, h.jour_semaine, h.heure_debut, h.heure_fin]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }

    res.json({ message: 'Horaires enregistrés' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    if (client) client.release();
  }
};

// GET /api/rdv/mes-rdv : rendez-vous à venir (aujourd'hui compris)
exports.mesRdv = async (req, res) => {
  try {
    const id = await dentisteDeUtilisateur(req.user.id);
    if (!id) return res.status(404).json({ message: "Créez d'abord votre profil" });

    const { rows } = await pool.query(
      `SELECT id,
              to_char(date_rdv, 'YYYY-MM-DD') AS date_rdv,
              to_char(heure, 'HH24:MI') AS heure,
              nom_patient, telephone, email, motif, statut, created_at
       FROM rendez_vous
       WHERE dentiste_id = $1 AND date_rdv >= $2
       ORDER BY date_rdv, heure`,
      [id, maintenant().date]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fabrique les routes PATCH de changement de statut
const changerStatut = (nouveau, anciens, messageOk) => async (req, res) => {
  try {
    const rdvId = parseInt(req.params.id, 10);
    if (Number.isNaN(rdvId)) return res.status(400).json({ message: 'Identifiant invalide' });

    const id = await dentisteDeUtilisateur(req.user.id);
    if (!id) return res.status(404).json({ message: "Créez d'abord votre profil" });

    const { rowCount } = await pool.query(
      `UPDATE rendez_vous SET statut = $1
       WHERE id = $2 AND dentiste_id = $3 AND statut = ANY($4::text[])`,
      [nouveau, rdvId, id, anciens]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Rendez-vous introuvable ou déjà traité' });
    }
    res.json({ message: messageOk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PATCH /api/rdv/:id/confirmer
exports.confirmer = changerStatut('confirme', ['en_attente'], 'Rendez-vous confirmé');
// PATCH /api/rdv/:id/annuler (le créneau redevient libre)
exports.annuler = changerStatut('annule', ['en_attente', 'confirme'], 'Rendez-vous annulé');