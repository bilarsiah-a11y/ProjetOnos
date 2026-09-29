const jwt = require('jsonwebtoken');

// Vérifie que l'utilisateur est connecté (token valide)
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

// Vérifie le rôle : requireRole('admin') ou requireRole('dentiste')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };