# ShopAssist MVP (LB1)

Web-App fuer einen einfachen Einkaufsservice als Proof of Concept.

## MVP Scope

Enthalten:

- Registrierung und Login
- Rollenwahl `customer` oder `shopper`
- User erstellt Einkaufsliste als Bestellung
- Shopper sieht offene Bestellungen
- Shopper uebernimmt eine Bestellung
- Statusfluss `open -> in_progress -> delivered`

Nicht enthalten:

- Zahlungsabwicklung
- Matching-Automatisierung
- Karten/Routing/Push

## Tech Stack

- Next.js (App Router)
- Convex (DB + Functions)
- Convex Auth (Password Provider)
- Tailwind CSS

## Setup

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. Umgebungsvariablen vorbereiten:

```bash
cp .env.example .env.local
```

3. Convex + Next lokal starten:

```bash
npm run dev
```

## Build und Start

```bash
npm run build
npm run start
```

## Happy Path Test

1. Benutzer A registrieren und als `customer` Rolle setzen.
2. Bestellung erstellen (Titel + Artikel).
3. Benutzer B registrieren und als `shopper` Rolle setzen.
4. Offene Bestellung uebernehmen.
5. Status auf geliefert setzen.
6. Bei Benutzer A erscheint die Bestellung mit Status `delivered`.

## Projektstruktur

- `app/` Frontend Views
- `convex/schema.ts` Datenmodell (`profiles`, `orders`)
- `convex/users.ts` User/Rollen-Logik
- `convex/orders.ts` Bestell-Workflow und Statuswechsel
- `proxy.ts` Route-Protection

## Security Hinweise

- Keine Secrets im Sourcecode speichern.
- Alle Secrets ueber `.env`/Plattform-Variablen setzen.
- `.env*` ist via `.gitignore` ausgeschlossen.
