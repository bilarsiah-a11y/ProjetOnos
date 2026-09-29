
CREATE TYPE role_type AS ENUM ('dentiste', 'admin');
CREATE TYPE statut_type AS ENUM ('en_attente', 'valide', 'refuse');
CREATE TYPE genre_type AS ENUM ('Homme', 'Femme');
CREATE TYPE titre_type AS ENUM ('Docteur', 'Professeur', 'Docteur Spécialiste');
CREATE TYPE domaine_type AS ENUM ('Fonctionnaire', 'Privé', 'Libéral');
CREATE TYPE region_type AS ENUM (
  'Alaotra Mangoro', 'Antsinanana', 'Anosy', 'Analanjirofo', 'AtsimoAndrefana',
  'Amoron''i Mania', 'AtsimoAtsinanana', 'Analamanga', 'Androy', 'Boeny', 'Betsiboka',
  'Bongolava', 'Betsimisaraka', 'Diana', 'HauteMatsiatra', 'Itasy', 'Ihorombe',
  'Melaky', 'Menabe', 'Sofia', 'Vakinankaratra', 'Vatovavy Fitovinany'
);

-- Comptes utilisateur
CREATE TABLE utilisateur (
  id SERIAL PRIMARY KEY,
  mail VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role role_type NOT NULL DEFAULT 'dentiste',
  statut statut_type NOT NULL DEFAULT 'en_attente',
  otp_hash VARCHAR(255),
  otp_expire TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profildentiste
CREATE TABLE dentiste (
  id SERIAL PRIMARY KEY,
  utilisateur_id INT NOT NULL UNIQUE REFERENCES utilisateur(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE,
  lieu_naissance VARCHAR(100),
  genre genre_type NOT NULL,
  adresse VARCHAR(255),
  contact VARCHAR(20) NOT NULL,
  autre_contact VARCHAR(20),
  titre titre_type NOT NULL,
  domaine domaine_type NOT NULL,
  region region_type NOT NULL
);

-- Actualités de l'admin
CREATE TABLE actualite (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  contenu TEXT NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);