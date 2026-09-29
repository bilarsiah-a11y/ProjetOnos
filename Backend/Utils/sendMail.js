require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(destinataire, sujet, texte) {
  await transporter.sendMail({
    from: `"Onos" <${process.env.MAIL_USER}>`,
    to: destinataire,
    subject: sujet,
    text: texte,
  });
}

module.exports = sendMail;