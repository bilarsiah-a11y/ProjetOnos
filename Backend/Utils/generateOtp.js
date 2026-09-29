const crypto = require('crypto');

const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateOtp(longueur = 6) {
  let otp = '';
  for (let i = 0; i < longueur; i++) {
    otp += CARACTERES[crypto.randomInt(0, CARACTERES.length)];
  }
  return otp;
}

module.exports = generateOtp;