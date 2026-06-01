# Garage Pro — Application Desktop (Electron)

L'application web est empaquetée avec **Electron** pour produire une app desktop native sur macOS, Windows et Linux.

---

## Prérequis

- **Node.js** >= 18
- **npm** >= 9
- Backend démarré sur le port **3002** (`web/garage-backend`)

---

## Structure des ports

| Service         | Port   |
|-----------------|--------|
| Frontend React  | `3001` |
| Backend Express | `3002` |

---

## Commandes

### Développement

```bash
# Démarre React (port 3001) + Electron en parallèle, avec DevTools ouvert
npm run electron:dev
```

> Le DevTools s'ouvre automatiquement en mode dev pour déboguer.  
> Raccourci manuel : `Ctrl+Shift+I` (Win/Linux) ou `Cmd+Option+I` (macOS)

---

### Build de production

```bash
# Build React puis empaquète pour la plateforme courante
npm run electron:build

# Build ciblé par plateforme
npm run electron:build:mac    # → .dmg  (macOS)
npm run electron:build:win    # → .exe  (Windows, installeur NSIS)
npm run electron:build:linux  # → .AppImage (Linux)
```

Les fichiers générés se trouvent dans le dossier **`dist/`** (non versionné).

---

### Autres commandes utiles

```bash
# Démarrer uniquement le serveur React (navigateur web)
npm start

# Lancer Electron sur le dernier build React (sans recompiler)
npm run electron

# Build React seul (sans Electron)
npm run build
```

---

## Arborescence Electron

```
garage-frontend/
├── public/
│   └── electron.js       ← Main process Electron (copié dans build/ par CRA)
├── src/                  ← Code React
├── build/                ← Build React (généré, ignoré par git)
│   └── electron.js       ← Copie du main process (utilisée en prod)
├── dist/                 ← Binaires Electron (généré, ignoré par git)
│   ├── Garage-x.x.x.dmg
│   └── mac-arm64/
└── package.json          ← Config electron-builder dans le champ "build"
```

---

## Comment ça fonctionne

### Mode développement (`electron:dev`)
```
React Dev Server (port 3001)  ←  Electron charge http://localhost:3001
```
Electron attend que React soit prêt (`wait-on`) avant de s'ouvrir.

### Mode production (app packagée)
```
build/index.html  ←  Electron charge file:///.../build/index.html
```
CRA génère le build statique, Electron le charge directement via `file://`.  
Les requêtes API vers `localhost:3002` ont l'en-tête `Origin` forcé à `http://localhost:3001` pour contourner la restriction CORS du protocole `file://`.

---

## Configuration electron-builder (`package.json`)

```json
"build": {
  "appId": "com.garage.app",
  "productName": "Garage",
  "main": "build/electron.js",
  "files": ["build/**/*"],
  "mac":   { "icon": "public/logo512.png" },
  "win":   { "icon": "public/logo512.png", "target": "nsis" },
  "linux": { "icon": "public/logo512.png", "target": "AppImage" }
}
```

---

## Démarrer le backend avant d'utiliser l'app

```bash
cd web/garage-backend
npm run dev        # nodemon — redémarre automatiquement
# ou
npm start          # node simple
```

Le backend doit tourner sur le port **3002** (configuré dans `.env`).

---

## Dépannage

| Erreur | Cause | Solution |
|--------|-------|----------|
| `EADDRINUSE :::3002` | Un process utilise déjà le port | `lsof -ti :3002 \| xargs kill` |
| `Cannot find module '...'` | node_modules absent | `npm install` |
| Page blanche au lancement | Build React absent | `npm run build` |
| CORS bloqué | Backend non démarré ou mauvais port | Vérifier que le backend tourne sur `3002` |
| `build/electron.js not found` | Build React pas généré | `npm run build` avant `electron-builder` |
