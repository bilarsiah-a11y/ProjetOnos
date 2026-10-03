import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, clearToken, getToken, setToken } from './services/api'
import type { Utilisateur } from './types'


interface AuthCtx {
  utilisateur: Utilisateur | null
  chargement: boolean
  connexion: (mail: string, motDePasse: string) => Promise<Utilisateur>
  deconnexion: () => void
  majMail: (mail: string) => void
}


const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [chargement, setChargement] = useState(true)

  // Au chargement : si un token existe, on vérifie qu'il est encore valide
  useEffect(() => {
    if (!getToken()) {
      setChargement(false)
      return
    }
    api
      .get<{ id: number; mail: string; role: Utilisateur['role'] }>('/api/auth/me')
      .then((u) => setUtilisateur({ id: u.id, mail: u.mail, role: u.role, aProfil: false }))
      .catch(() => clearToken())
      .finally(() => setChargement(false))
  }, [])

  const connexion = async (mail: string, motDePasse: string) => {
    const data = await api.post<{ token: string; utilisateur: Utilisateur }>(
      '/api/auth/login',
      { mail, mot_de_passe: motDePasse }
    )
    setToken(data.token)
    setUtilisateur(data.utilisateur)
    return data.utilisateur
  }

  const deconnexion = () => {
    clearToken()
    setUtilisateur(null)
  }
    const majMail = (mail: string) =>
    setUtilisateur((u) => (u ? { ...u, mail } : u))

  return (
       <AuthContext.Provider value={{ utilisateur, chargement, connexion, deconnexion, majMail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}