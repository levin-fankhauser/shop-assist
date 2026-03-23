# 🛒 ShopAssist

Eine schlanke Einkaufslisten-Plattform, in der Nutzer Bestellungen erfassen und Shopper sie übernehmen und ausliefern. Alles läuft mit Next.js, Convex und Convex Auth.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css)
![Convex](https://img.shields.io/badge/Convex-Backend-orange?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-Convex%20Auth-green?style=flat-square)

## 📋 Überblick

ShopAssist trennt klar zwischen Auftraggebern (Bestellungen erfassen) und Shoppern (Bestellungen übernehmen und ausliefern). Statuswechsel sind strikt geregelt, Validierung und Rollenlogik laufen im Convex-Backend, die UI reagiert in Echtzeit.

#### Das Projekt ist auf [shop-assist-six.vercel.app](shop-assist-six.vercel.app) deployed und kann dort ausprobiert werden.

### ✨ Kernfunktionen

- 🧾 Bestellungen mit Produkten, Lieferadresse und Zeitfenster anlegen
- 👥 Rollen „Benutzer“ und „Shopper“ mit eigener Ansicht
- 🔄 Status-Flow: offen → in Bearbeitung → geliefert
- ✅ Produkte abhaken, wenn sie besorgt wurden
- 🔐 Passwort-Login via Convex Auth (Password Provider)
- 📡 Echtzeit-Updates über Convex Queries/Mutations

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Convex (Daten, Business-Logic, Auth)
- **Authentifizierung**: Convex Auth (Password Provider)
- **Icons**: Lucide React
- **Deployment**: Vercel (Frontend) + Convex (Backend)

## 📦 Voraussetzungen

- Node.js 18+ und npm
- Ein Convex Account (für Dev/Deploy)
- Optional: Vercel Account für Hosting

## 🚀 Lokale Entwicklung

1. Repository klonen

```bash
git clone <repo-url>
cd shop-assist
```

2. Abhängigkeiten installieren

```bash
npm install
```

3. Umgebungsvariablen anlegen

```bash
cp .env.example .env.local
```

Fülle mindestens:

```env
# Convex Deployment (z. B. dev:<slug> oder prod:<slug>)
CONVEX_DEPLOYMENT=

# Öffentliche Endpunkte (werden von convex dev/deploy ausgegeben)
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

`npx convex dev` trägt lokale Werte für `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` und `NEXT_PUBLIC_CONVEX_SITE_URL` ein, wenn sie fehlen.

4. Convex im Dev-Modus starten (öffnet Dashboard, setzt CONVEX_URL)

```bash
npx convex dev
```

5. Frontend und Backend parallel starten

```bash
npm run dev
# Next.js: http://localhost:3000
# Convex:   http://localhost:3188 (default)
```

6. Anmelden/Registrieren

- Passwort-Flow unter `/signin`
- Rolle in `/konto` setzen (benutzer ⇄ shopper)

## 🌐 Deployment

### 1. Projekt auf Github pushen

### 2. Frontend auf Vercel deployen

1. Gehe zum [Convex Dashboard](https://dashboard.convex.dev/)
2. Gehe zum Production deployment oder erstelle es, falls noch nicht vorhanden
3. Gehe in die Settings und generiere einen "Production Deploy Key"

4. Gehe zum [Vercel Dashboard](https://vercel.com/dashboard)
5. Klicke auf **"Add New Project"**
6. Importiere dein GitHub Repository
7. Konfiguriere das Projekt:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (Standard)
8. Überschreibe den Build Command mit: `npx convex deploy --cmd 'npm run build`
9. Füge Umgebungsvariablen hinzu:

   ```
   CONVEX_DEPLOY_KEY=<Dein von Convex generierter Production Deploy Key>
   NEXT_PUBLIC_CONVEX_URL=<Deine Convex Cloud URL -> im Convex Dashboard am selben Ort wie Deploy Key>
   NEXT_PUBLIC_CONVEX_SITE_URL=<Deine Convex Site URL -> im Convex Dashboard am selben Ort wie Deploy Key>
   ```

10. Klicke auf **"Deploy"**

Dies erstellt automatisch sobald nun auf das GitHub-Repo gepusht wird ein neues Deployment für Backend (Convex) sowie auch Frontend (Vercel).

## 📁 Projektstruktur

```
shop-assist/
├── app/                  # Next.js App Router Seiten (Home, Signin, Konto, Server-Demo)
├── components/           # Wiederverwendbare UI (OrderList, OrderCard, Dialoge)
├── convex/               # Convex Funktionen, Schema, Auth
│   ├── auth.ts           # Convex Auth Password Provider
│   ├── orders.ts         # Bestell-Queries/Mutations inkl. Status-Logik
│   ├── profiles.ts       # Rollen/Profile speichern und lesen
│   ├── schema.ts         # DB-Schema (profiles, orders, users)
│   └── _generated/       # Auto-generiert von Convex
├── public/               # Statische Assets
├── package.json          # Scripts & Dependencies
└── tsconfig.json         # TypeScript Config
```

## 🎯 Nützliche Scripts

```bash
npm run dev          # Next.js + Convex Dev
npm run dev:frontend # Nur Next.js dev
npm run dev:backend  # Nur Convex dev
npm run build        # Production Build
npm run start        # Production Start (Next.js)
npm run lint         # ESLint
```

## 🐛 Troubleshooting

- Convex URL fehlt: `npx convex dev` einmal laufen lassen, dann `.env.local` prüfen.
- Login schlägt fehl: Passwort >= 8 Zeichen, E-Mail-Format prüfen.
- Statuswechsel blockiert: Nur Shopper dürfen annehmen/fortschalten; Übergänge sind strikt offen → in_bearbeitung → geliefert.
- Leere Bestellliste: Rolle prüfen (Shopper sieht alle, Nutzer sieht eigene), ggf. neu laden.

## 📚 Links

- Next.js: https://nextjs.org/docs
- Convex: https://docs.convex.dev/
- Convex Auth: https://labs.convex.dev/auth
- Tailwind CSS: https://tailwindcss.com/docs

## 👥 Entwickler

- [Levin Fankhauser](https://github.com/levin-fankhauser)
- [Seth Schmutz](https://github.com/BrickiBulli)
- [Tobias Topp](https://github.com/ToppTobi)
- [Simon Fäs](https://github.com/simiAtschool)
 
