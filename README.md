# 🛡️ CyberHub Admin Suite

> Portfolio cybersécurité full-stack avec tableau de bord d'administration, assistant IA intégré et monitoring de sécurité temps réel.

[![TypeScript](https://img.shields.io/badge/TypeScript-84.9%25-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Déploiement](#-déploiement)
- [Sécurité](#-sécurité)
- [Structure du projet](#-structure-du-projet)
- [Auteur](#-auteur)

---

## 🎯 Présentation

**CyberHub Admin Suite** est un portfolio cybersécurité personnel conçu pour exposer projets, expériences, certifications et veille technologique. Il embarque un panneau d'administration complet, un assistant IA conversationnel, et une suite de monitoring de sécurité avancée (scan de vulnérabilités, audit RLS, rate-limiting, journalisation des événements de sécurité).

Le projet reflète une approche **Security by Design** : toutes les routes d'administration sont protégées par authentification JWT, Row Level Security activé sur chaque table, et un service de chiffrement AES-256 pour les données sensibles.

---

## ✨ Fonctionnalités

### Portfolio public
- Présentation des projets avec images générées par IA (Gemini / Stable Diffusion)
- Timeline des expériences professionnelles et formations
- Catalogue de compétences par catégorie et niveau de maîtrise
- Certifications avec liens vers les credentials et téléchargement PDF
- Veille technologique (CVE, actualités cyber, DevOps, Cloud)
- Formulaire de contact avec rate-limiting anti-spam (3 msg / 15 min)
- Assistant IA intégré (Gemini 2.5 Flash / GPT)

### Panneau d'administration (`/admin`)
| Module | Fonctionnalités |
|---|---|
| Dashboard | Statistiques générales, messages non lus, accès rapide |
| Projets | CRUD, upload images, génération IA, sync GitHub |
| Veille | Import RSS/API, gestion CVE, publication/dépublication |
| Expériences | Timeline, achievements, technologies |
| Formations | Parcours académique, compétences acquises |
| Compétences | Niveaux 1-5, icônes, catégorisation |
| Certifications | Upload PDF, dates d'expiration, credentials |
| Sécurité | Logs, scan vulnérabilités, tests pentest automatisés |
| Utilisateurs | Gestion sessions Supabase Auth |
| GitHub Sync | Synchronisation bidirectionnelle |

---

## 🛠️ Stack technique

### Frontend
- **Framework** : React 18.3 + TypeScript
- **Build** : Vite
- **Routing** : React Router DOM v6
- **UI** : shadcn/ui (Radix UI) + Tailwind CSS
- **Forms** : React Hook Form + Zod
- **State** : TanStack Query + React Hooks
- **Icons** : Lucide React
- **Themes** : next-themes (dark/light)

### Backend (BaaS)
- **Plateforme** : Supabase
- **Base de données** : PostgreSQL avec RLS
- **Edge Functions** : Deno (TypeScript)
- **Auth** : Supabase Auth (JWT)
- **Storage** : Supabase Storage (images, PDFs, fichiers admin)

### IA & APIs
- Lovable AI Gateway (Gemini 2.5 Flash/Pro, GPT)
- Google Gemini 2.5 Flash Image Preview
- HuggingFace Inference API (Stable Diffusion)

---

## 🏗️ Architecture

```
cyberhub-admin-suite/
├── src/
│   ├── components/          # Composants React réutilisables
│   │   ├── admin/           # Composants panneau admin
│   │   ├── portfolio/       # Composants portfolio public
│   │   └── ui/              # shadcn/ui components
│   ├── pages/               # Pages principales (React Router)
│   ├── hooks/               # Custom hooks (useAuth, useProjects, …)
│   ├── integrations/        # Client Supabase auto-généré
│   └── lib/                 # Utilitaires (crypto, validation, …)
├── supabase/
│   ├── functions/           # Edge Functions Deno
│   │   ├── ai-assistant/
│   │   ├── security-monitor/
│   │   ├── security-vulnerability-scanner/
│   │   ├── github-sync/
│   │   └── …
│   └── migrations/          # Migrations SQL versionnées
└── public/                  # Assets statiques
```

### Tables PostgreSQL principales

| Table | Rôle |
|---|---|
| `projects` | Projets (technologies, images, liens) |
| `experiences` | Expériences professionnelles |
| `formations` | Parcours de formation |
| `skills` | Compétences par catégorie |
| `certifications` | Certifications + PDFs |
| `veille_techno` | Articles de veille |
| `contact_messages` | Messages du formulaire |
| `security_events` | Journalisation événements sécurité |

---

## 🚀 Installation

### Prérequis

- Node.js ≥ 18 ou [Bun](https://bun.sh/)
- Compte [Supabase](https://supabase.com/) (gratuit)
- Compte [Lovable](https://lovable.dev/) (pour les Edge Functions IA)

### Cloner le projet

```bash
git clone https://github.com/rayanejr/cyberhub-admin-suite.git
cd cyberhub-admin-suite
```

### Installer les dépendances

```bash
npm install
# ou
bun install
```

### Démarrer en développement

```bash
npm run dev
# ou
bun dev
```

L'application est accessible sur `http://localhost:5173`.

---

## ⚙️ Configuration

Créez un fichier `.env` à la racine (ne jamais commiter ce fichier) :

```env
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<votre-anon-key>
```

Configurez les secrets des Edge Functions dans Supabase Dashboard → Settings → Edge Functions :

| Secret | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase |
| `LOVABLE_API_KEY` | Clé Lovable AI Gateway |
| `HUGGING_FACE_ACCESS_TOKEN` | Token HuggingFace (images IA) |
| `ENCRYPTION_KEY` | Clé AES-256 (32 caractères) |

> ⚠️ Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` ou `ENCRYPTION_KEY` côté client.

---

## 📦 Déploiement

### Vercel (recommandé)

```bash
# Via CLI Vercel
vercel deploy

# Ou connecter le repo GitHub dans le dashboard Vercel
# Build command : npm run build
# Output directory : dist
```

### Variables d'environnement en production

Ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les settings Vercel → Environment Variables.

---

## 🔐 Sécurité

Ce projet applique les bonnes pratiques suivantes :

| Mesure | Détail |
|---|---|
| **RLS** | Row Level Security activé sur toutes les tables |
| **JWT** | Authentification via Supabase Auth |
| **AES-256** | Chiffrement des données sensibles |
| **Rate Limiting** | 3 messages / 15 min (DB + application) |
| **Zod** | Validation de tous les inputs côté client |
| **CSRF** | Tokens et headers sécurisés |
| **RGPD** | Suppression automatique des IPs après 30 jours |
| **Pentest auto** | Edge Function `security-real-tests` |
| **Scan vulnérabilités** | Edge Function `security-vulnerability-scanner` |
| **Security headers** | CSP, HSTS, X-Frame-Options via Vercel |

Pour signaler une vulnérabilité : [admin@rayane-jerbi.com](mailto:admin@rayane-jerbi.com)

---

## 👤 Auteur

**Rayane Jerbi**
Étudiant M2 Ingénierie des Réseaux et Systèmes — Cybersécurité
Université Paris-Saclay × AFORP

Alternant Ingénieur Réseaux & Systèmes — LNE (Laboratoire National de Métrologie et d'Essais)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rayane%20Jerbi-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/rayane-jerbi)
[![GitHub](https://img.shields.io/badge/GitHub-rayanejr-181717?style=flat-square&logo=github)](https://github.com/rayanejr)

---

## 📄 License

Ce projet est distribué sous licence [MIT](LICENSE).

---

*Stack : React · TypeScript · Supabase · PostgreSQL · Deno · Tailwind CSS · Vite*
