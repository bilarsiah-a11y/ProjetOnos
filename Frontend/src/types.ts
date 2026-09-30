export type Role = 'admin' | 'dentiste';

export interface Utilisateur {
  id: number;
  mail: string;
  role: Role;
  aProfil: boolean;
}

// Fiche publique (annuaire)
export interface Dentiste {
  id: number;
  nom: string;
  prenom: string;
  genre: 'Homme' | 'Femme';
  titre: string;
  domaine: string;
  region: string;
  adresse: string | null;
  contact: string;
  autre_contact: string | null;
  photo: string | null;
}

// Profil complet du dentiste connecté
export interface ProfilDentiste extends Dentiste {
  utilisateur_id: number;
  date_naissance: string | null;
  lieu_naissance: string | null;
}

export interface Actualite {
  id: number;
  titre: string;
  contenu: string;
  image: string | null;
  created_at: string;
}

export interface OptionsProfil {
  genres: string[];
  titres: string[];
  domaines: string[];
  regions: string[];
}