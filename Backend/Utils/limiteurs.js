const rateLimit = require('express-rate-limit');

function creerLimiteur(minutes, limite, message) {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: limite,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });
}

module.exports = {
  limiteConnexion: creerLimiteur(15, 10, 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'),
  limiteInscription: creerLimiteur(60, 10, "Trop d'inscriptions depuis cette adresse. Réessayez plus tard."),
  limiteMotDePasseOublie: creerLimiteur(15, 5, 'Trop de demandes de code. Réessayez dans 15 minutes.'),
  limiteReinitialisation: creerLimiteur(15, 10, 'Trop de tentatives. Réessayez dans 15 minutes.'),
};