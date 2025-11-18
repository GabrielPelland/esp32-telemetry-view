# Guide de Build pour Mac et Windows

## Prérequis

1. **Node.js** (version 18 ou supérieure)
2. **npm** ou **yarn**
3. Pour Mac : Xcode Command Line Tools
4. Pour Windows : Visual Studio Build Tools (si vous êtes sur Windows)

## Installation des dépendances

```bash
npm install
```

## Build pour Mac

```bash
npm run electron:build:mac
```

Cela créera :
- `dist/ESP32 Data Visualisation-1.0.0.dmg` - Installateur DMG
- `dist/ESP32 Data Visualisation-1.0.0-mac.zip` - Archive ZIP

## Build pour Windows

```bash
npm run electron:build:win
```

Cela créera :
- `dist/ESP32 Data Visualisation Setup 1.0.0.exe` - Installateur NSIS
- `dist/ESP32 Data Visualisation-1.0.0-win-portable.exe` - Version portable

## Build pour les deux plateformes

```bash
npm run electron:build:all
```

**Note** : Pour builder pour Windows depuis Mac, vous devez avoir Wine installé, ou builder directement sur une machine Windows.

## Build général

```bash
npm run electron:build
```

Cela buildera pour la plateforme actuelle (Mac si vous êtes sur Mac, Windows si vous êtes sur Windows).

## Fichiers générés

Les fichiers de build seront dans le dossier `dist/` :
- **Mac** : `.dmg` et `.zip`
- **Windows** : `.exe` (installateur) et `.exe` (portable)

## Notes importantes

1. **Icons** : Les icônes doivent être placées dans le dossier `build/` :
   - `build/icon.icns` pour Mac
   - `build/icon.ico` pour Windows
   
   Si les icônes ne sont pas présentes, electron-builder utilisera une icône par défaut.

2. **Code Signing** : Pour distribuer l'application Mac, vous devrez configurer le code signing dans `electron-builder.yml`.

3. **Cross-platform building** : 
   - Pour builder Windows depuis Mac, installez Wine
   - Pour builder Mac depuis Windows, vous devez utiliser un Mac ou un service CI/CD

## Développement

Pour lancer l'application en mode développement :

```bash
npm run electron:dev
```

Cela lancera Next.js en mode dev et Electron simultanément.

