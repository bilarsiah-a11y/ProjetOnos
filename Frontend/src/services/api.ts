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

type Options = {
  method?: string;
  body?: unknown;       // données JSON
  formData?: FormData;  // envoi de fichier (photo, image)
  auth?: boolean;       // true = ajoute le token de connexion
};

export async function api<T>(
  chemin: string,
  { method = 'GET', body, formData, auth = false }: Options = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const reponse = await fetch(`${API_URL}${chemin}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const donnees = await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    throw new ApiError(donnees.message ?? 'Une erreur est survenue', reponse.status);
  }
  return donnees as T;
}

// Transforme "/uploads/xxx.jpg" en URL complète pour <img src=...>
export function urlImage(chemin: string | null): string | null {
  return chemin ? `${API_URL}${chemin}` : null;
}