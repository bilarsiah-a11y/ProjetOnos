import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ContentAdmin from './ComponentAdmin/ContentAdmin'
import ContentVisiteur from './ComponentVisiteur/ContentVisiteur'
import ContentDentiste from './ComponentDentiste/ContentDentiste'

// Layouts 
import NavbarVisiteur from './ComponentVisiteur/NavbarVisiteur'
import FooterVisiteur from './ComponentVisiteur/FooterVisiteur'
import NavbarDentiste from './ComponentDentiste/NavbarDentiste'
import FooterDentiste from './ComponentDentiste/FooterDentiste'
import NavbarAdmin from './ComponentAdmin/NavbarAdmin'
import FooterAdmin from './ComponentAdmin/FooterAdmin'

// PageVisiteur
import AcceuilVisiteur from './SectionsVisiteur/AcceuilVisiteur'
import AnnuaireVisiteur from './SectionsVisiteur/AnnuaireVisiteur'
import AproposVisiteur from './SectionsVisiteur/AproposVisiteur'
import Contact from './SectionsVisiteur/Contact'
import Seconnecter from './SectionsVisiteur/Seconnecter'
import Sinscrire from './SectionsVisiteur/Sinscrire'

// PageDentiste
import AcceuilDentiste from './SectionsDentiste/AcceuilDentiste'
import AnnuaireDentiste from './SectionsDentiste/AnnuaireDentiste'
import DeconnectionDentiste from './SectionsDentiste/DeconnectionDentiste'
import ProfilDentsite from './SectionsDentiste/ProfilDentsite'

// PageAdmin
import AcceuilAdmin from './SectionsAdmin/AcceuilAdmin'
import AnnuaireAdmin from './SectionsAdmin/AnnuaireAdmin'
import Deconnexionadmin from './SectionsAdmin/Deconnexionadmin'
import GestionActualiter from './SectionsAdmin/GestionActualiter'
import Notification from './SectionsAdmin/Notification'
import ProfilAdmin from './SectionsAdmin/ProfilAdmin'

// Layout Visiteur
function LayoutVisiteur({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarVisiteur />
      <ContentVisiteur>{children}</ContentVisiteur>
      <FooterVisiteur />
    </>
  )
}

// Layout Admin
function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarAdmin />
      <ContentAdmin>{children}</ContentAdmin>
      <FooterAdmin />
    </>
  )
}

// Layout Dentiste
function LayoutDentiste({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavbarDentiste />
      <ContentDentiste>{children}</ContentDentiste>
      <FooterDentiste />
    </>
  )
}



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Espace Visiteur */}
        <Route path="/" element={<LayoutVisiteur><AcceuilVisiteur /></LayoutVisiteur>} />
        <Route path="/annuaire" element={<LayoutVisiteur><AnnuaireVisiteur /></LayoutVisiteur>} />
        <Route path="/apropos" element={<LayoutVisiteur><AproposVisiteur /></LayoutVisiteur>} />
        <Route path="/contact" element={<LayoutVisiteur><Contact /></LayoutVisiteur>} />
        <Route path="/connexion" element={<LayoutVisiteur><Seconnecter /></LayoutVisiteur>} />
        <Route path="/inscription" element={<LayoutVisiteur><Sinscrire /></LayoutVisiteur>} />

        {/* Espace Dentiste */}
        <Route path="/dentiste/accueil" element={<LayoutDentiste><AcceuilDentiste /></LayoutDentiste>} />
        <Route path="/dentiste/annuaire" element={<LayoutDentiste><AnnuaireDentiste /></LayoutDentiste>} />
        <Route path="/dentiste/profil" element={<LayoutDentiste><ProfilDentsite /></LayoutDentiste>} />
        <Route path="/dentiste/deconnexion" element={<LayoutDentiste><DeconnectionDentiste /></LayoutDentiste>} />

        {/* Espace Admin */}
        <Route path="/admin/accueil" element={<LayoutAdmin><AcceuilAdmin /></LayoutAdmin>} />
        <Route path="/admin/annuaire" element={<LayoutAdmin><AnnuaireAdmin /></LayoutAdmin>} />
        <Route path="/admin/actualites" element={<LayoutAdmin><GestionActualiter /></LayoutAdmin>} />
        <Route path="/admin/notifications" element={<LayoutAdmin><Notification /></LayoutAdmin>} />
        <Route path="/admin/profil" element={<LayoutAdmin><ProfilAdmin /></LayoutAdmin>} />
        <Route path="/admin/deconnexion" element={<LayoutAdmin><Deconnexionadmin /></LayoutAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App