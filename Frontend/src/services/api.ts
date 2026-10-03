const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('onos_token');
}
export function setToken(token: string): void {
  localStorage.setItem('onos_token', token);
}
export function clearToken(): void {
  localStorage.removeItem('onos_token');
}

// Transforme "/uploads/xxx.jpg" en URL complète pour <img src=...>
export function urlImage(chemin: string | null): string | null {
  return chemin ? `${API_URL}${chemin}` : null;
}

async function requete<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  // Le token est ajouté automatiquement s'il existe
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Pas de Content-Type pour FormData (le navigateur ajoute le boundary)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const reponse = await fetch(`${API_URL}${chemin}`, { ...options, headers });
  const donnees = await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    throw new ApiError(donnees.message ?? 'Une erreur est survenue', reponse.status);
  }
  return donnees as T;
}

export const api = {
  get: <T>(chemin: string) => requete<T>(chemin),
  post: <T>(chemin: string, donnees?: unknown) =>
    requete<T>(chemin, {
      method: 'POST',
      body: donnees !== undefined ? JSON.stringify(donnees) : undefined,
    }),
  put: <T>(chemin: string, donnees?: unknown) =>
    requete<T>(chemin, {
      method: 'PUT',
      body: donnees !== undefined ? JSON.stringify(donnees) : undefined,
    }),
  patch: <T>(chemin: string) => requete<T>(chemin, { method: 'PATCH' }),
  delete: <T>(chemin: string) => requete<T>(chemin, { method: 'DELETE' }),
  // Envoi de fichier (photo, image d'actualité)
  envoyer: <T>(chemin: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') =>
    requete<T>(chemin, { method, body: formData }),
};