# 🎸 Crazy Mess Meet – Band-App

Die offizielle Band-App von **Crazy Mess** – als Android APK und PWA (iOS/Desktop).

## Features

| Feature | Beschreibung |
|---|---|
| 🔐 **Auth** | Login/Registrierung mit E-Mail & Passwort |
| 💬 **Chat** | Echtzeit-Gruppen-Chat für alle Bandmitglieder |
| 🎵 **Songs** | Songs per Link hinzufügen (Spotify, YouTube, SoundCloud) |
| | → Auto-Metadaten bei Spotify-Links (Cover, Titel, Künstler) |
| | → Direkt in der App anhören via eingebettetem Player |
| | → Tags: Eigener Song, Cover, Idee, Setlist |
| 📅 **Events** | Gigs & Proben planen, Teilnahme bestätigen (Ja/Nein/Vielleicht) |
| 🗳️ **Abstimmung** | Songs, Termine oder allgemeine Entscheidungen abstimmen |
| 🔗 **Links** | Spotify, Discord, Instagram, YouTube – alles an einem Ort |
| 👤 **Profil** | Name, Instrument, Avatar verwalten |

## Tech Stack

- **React + TypeScript + Vite** – Single Codebase
- **Tailwind CSS v4** – Dark Purple Theme
- **Firebase** – Auth, Firestore (Echtzeit), Storage
- **Capacitor** – Android APK Wrapper
- **Vite PWA Plugin** – Installierbare PWA für iOS/Desktop

---

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Firebase einrichten

1. Neues Projekt auf [Firebase Console](https://console.firebase.google.com) erstellen
2. Authentication → E-Mail/Passwort aktivieren
3. Firestore Database → Erstellen (Produktionsmodus)
4. Web-App hinzufügen → Config kopieren

```bash
cp .env.example .env.local
# .env.local mit deinen Firebase-Credentials ausfüllen
```

### 3. Firestore-Regeln deployen

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 4. Spotify API (optional)

Für automatische Song-Metadaten (Cover, Titel bei Spotify-Links):
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → App erstellen
2. Client ID und Secret in `.env.local` eintragen

---

## Entwicklung

```bash
npm run dev         # Lokaler Dev-Server (http://localhost:5173)
```

---

## PWA bauen (für iOS/Desktop)

```bash
npm run build        # Baut nach dist/
npm run preview      # Vorschau des Builds
```

Der `dist/` Ordner kann auf jeden Webserver deployed werden (Netlify, Vercel, Firebase Hosting, etc.).
PWA kann auf iOS über Safari → "Zum Home-Bildschirm" installiert werden.

---

## Android APK bauen

```bash
npm run build
npm run cap:sync
npm run cap:open:android
# In Android Studio: Build → Generate Signed APK
```

Oder direkt:
```bash
npx cap sync android
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## Erste Admin-Einrichtung

Nach der ersten Registrierung:
1. In Firestore → `users/{uid}` → `role` auf `"admin"` setzen
2. Als Admin Events, Abstimmungen erstellen und Links konfigurieren

---

## Icons anpassen

```bash
# Eigenes Logo als SVG nach public/icons/icon.svg kopieren, dann:
node scripts/generate-icons.mjs
```

---

## Projektstruktur

```
src/
├── context/        AuthContext (Firebase Auth State)
├── screens/
│   ├── auth/       Login, Register
│   ├── home/       Dashboard
│   ├── chat/       Echtzeit-Chat
│   ├── songs/      Song-Verwaltung + Spotify/YouTube Embeds
│   ├── events/     Gig & Probe Planung
│   ├── voting/     Abstimmungen
│   ├── links/      Externe Links Hub
│   └── profile/    Nutzer-Profil
├── services/
│   ├── firebase.ts          Firebase Init
│   ├── authService.ts       Login/Register/Logout
│   ├── firestoreService.ts  Alle DB-Operationen
│   └── spotifyService.ts    Spotify Web API
├── types/          TypeScript Interfaces
└── components/layout/  AppLayout, BottomNav, Sidebar
```
