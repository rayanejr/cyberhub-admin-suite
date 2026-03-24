# 🛡️ Portfolio Cybersécurité — Rayane JERBI

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

> Hub cybersécurité complet : portfolio professionnel, blog technique, outils de sécurité interactifs et interface d'administration sécurisée.

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Architecture](#-architecture)
- [Sécurité](#-sécurité)
- [Licence](#-licence)

---

## 🔍 Aperçu

Portfolio orienté cybersécurité conçu pour présenter mes compétences, projets et certifications. Il intègre des outils de sécurité fonctionnels et un panneau d'administration complet avec gestion CRUD de tout le contenu.

---

## ✨ Fonctionnalités

### 👨‍💻 Interface publique

| Fonctionnalité | Description |
|---|---|
| **Accueil** | Hero animé, à propos, compétences (offensive/défensive/outils), projets récents |
| **Projets** | Liste filtrable avec recherche, pages détaillées (image, techno, GitHub) |
| **Blog** | Articles techniques avec tags, images et contenu complet |
| **Formation** | Timeline académique interactive |
| **Expérience** | Missions et réalisations professionnelles |
| **Outils Cyber** | Générateur de mots de passe, analyseur headers, testeur SSL/TLS, scanner de ports, vérificateur de fuites |
| **Certifications** | Affichage des certifications avec visualiseur PDF/image |
| **Contact** | Formulaire de contact sécurisé |

### 🔐 Interface d'administration

| Module | Opérations |
|---|---|
| **Dashboard** | Statistiques, notifications, vue d'ensemble |
| **Projets** | CRUD complet avec upload d'images |
| **Blog** | Gestion des articles (brouillon/publié) |
| **Formation** | Gestion du parcours académique |
| **Expérience** | Gestion des expériences professionnelles |
| **Compétences** | Gestion par catégories |
| **Certifications** | Upload PDF/images, gestion des certifs |
| **Utilisateurs** | Gestion des comptes admin |
| **Sécurité** | Dashboard sécurité, tests, audit |

---

## 🛠️ Stack technique

- **Frontend** : React 18 · TypeScript · Tailwind CSS · shadcn/ui
- **Build** : Vite 5
- **Backend** : Supabase (Auth, Database, Storage, Edge Functions)
- **State** : TanStack React Query
- **Routing** : React Router v6
- **UI** : Radix UI · Lucide Icons · Framer Motion
- **Sécurité** : RLS Supabase · Edge Functions · Validation Zod

---

## 🚀 Installation

### Prérequis

- Node.js ≥ 18
- npm ou bun

### Démarrage rapide

```bash
# Cloner le repo
git clone <URL_DU_REPO>
cd <NOM_DU_PROJET>

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir les variables Supabase dans .env

# Lancer le serveur de développement
npm run dev
```

### Variables d'environnement requises

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_clé_anon
```

> ⚠️ Ne jamais commiter le fichier `.env` — il est exclu via `.gitignore`.

---

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── admin/           # Modules d'administration
│   ├── auth/            # Authentification
│   └── ui/              # Composants shadcn/ui
├── hooks/               # Hooks personnalisés
├── integrations/        # Client Supabase & types
├── pages/               # Pages de l'application
├── utils/               # Utilitaires
└── main.tsx             # Point d'entrée

supabase/
├── functions/           # Edge Functions (API serverless)
└── migrations/          # Migrations SQL
```

### Tables principales (Supabase)

| Table | Description |
|---|---|
| `projects` | Projets du portfolio |
| `blog_posts` | Articles de blog |
| `certifications` | Certifications professionnelles |
| `skills` | Compétences techniques |
| `experiences` | Expériences professionnelles |
| `education` | Parcours de formation |
| `contacts` | Messages du formulaire de contact |
| `admin_users` | Comptes administrateurs |

---

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Authentification** via Supabase Auth
- **Edge Functions** pour les opérations sensibles
- **Validation des entrées** côté client (Zod) et serveur
- **Storage sécurisé** avec policies par bucket
- **Clés API** : seule la clé `anon` (publique) est utilisée côté client

---

## 📄 Licence

MIT © 2025 Rayane JERBI — voir le fichier [LICENSE](./LICENSE).
