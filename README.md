# ESP32 Data Visualisation

Application Electron avec Next.js pour visualiser les données de plusieurs ESP32 en temps réel via UDP.

## Fonctionnalités

- 📡 **Réception UDP en temps réel** : Reçoit les données de plusieurs ESP32 sur le réseau LAN
- 🎨 **Interface moderne** : UI moderne avec Tailwind CSS et composants shadcn/ui
- 📊 **Modes d'affichage multiples** : Ligne, Barres, Jauge, Tableau
- 🔧 **Gestion des ESP32** : Ajouter, modifier, supprimer et personnaliser (nom, couleur, IP)
- 📈 **Gestion des flux** : Configurer plusieurs flux de données par ESP32 avec surnoms et modes d'affichage
- 💾 **Stockage local** : Configuration sauvegardée automatiquement

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer l'application en mode développement :
```bash
npm run electron:dev
```

3. Pour construire l'application :
```bash
npm run electron:build
```

## Test

Pour tester l'application sans ESP32 physique, vous pouvez utiliser le script de test :

1. Dans un terminal, lancez l'application :
```bash
npm run electron:dev
```

2. Dans un autre terminal, lancez le script de test :
```bash
node test-udp.js
```

Le script enverra des données de test toutes les secondes pour simuler plusieurs ESP32.

## Configuration

### Format des données UDP

L'application attend des messages UDP au format JSON avec la structure suivante :

```json
{
  "esp32Id": "esp32-1",
  "streamId": "temperature",
  "timestamp": 1234567890,
  "data": 25.5
}
```

**Champs :**
- `esp32Id` (string) : Identifiant unique de l'ESP32 (doit correspondre à l'ID configuré dans l'app)
- `streamId` (string) : Identifiant du flux de données (ex: "temperature", "humidity")
- `timestamp` (number, optionnel) : Timestamp Unix en millisecondes (par défaut: Date.now())
- `data` (number) : Valeur numérique à afficher

### Port UDP

Par défaut, l'application écoute sur le port **8888**. Vous pouvez modifier ce port dans `electron/main.js`.

### Configuration des ESP32

1. Cliquez sur "Ajouter" dans la barre latérale
2. Entrez le nom de l'ESP32
3. Entrez l'adresse IP statique de l'ESP32
4. Choisissez une couleur pour l'identifier visuellement
5. Cliquez sur "Ajouter"

### Configuration des flux de données

1. Sélectionnez un ESP32 dans la barre latérale
2. Cliquez sur "Ajouter un flux"
3. Entrez l'ID du flux (doit correspondre au `streamId` envoyé par l'ESP32)
4. Donnez un surnom au flux
5. Choisissez le mode d'affichage :
   - **Ligne** : Graphique linéaire pour visualiser l'évolution
   - **Barres** : Graphique en barres
   - **Jauge** : Jauge circulaire (nécessite min/max)
   - **Tableau** : Affichage tabulaire des dernières valeurs
6. Optionnellement, définissez l'unité, min et max

## Scripts ESP32 de test

Deux scripts sont fournis pour tester l'application avec un ESP32 :

### 1. Script complet (`esp32_test.ino`)

Script complet avec plusieurs flux de données simulés :
- Température (18-25°C)
- Humidité (40-70%)
- Pression (1010-1020 hPa)
- Tension (3.2-3.4V)

**Installation :**
1. Ouvrez `esp32_test.ino` dans l'IDE Arduino
2. Installez la bibliothèque **ArduinoJson** via le gestionnaire de bibliothèques
3. Modifiez les constantes en haut du fichier :
   - `ssid` : Nom de votre réseau WiFi
   - `password` : Mot de passe WiFi
   - `udpAddress` : IP de votre ordinateur
   - `esp32Id` : ID de l'ESP32 (doit correspondre à la config dans l'app)
4. Téléversez sur votre ESP32

### 2. Script simplifié (`esp32_test_simple.ino`)

Version simplifiée sans bibliothèque externe, envoie seulement température et humidité.

**Installation :**
1. Ouvrez `esp32_test_simple.ino` dans l'IDE Arduino
2. Modifiez les constantes (WiFi, IP, esp32Id)
3. Téléversez sur votre ESP32

### Exemple de code minimal

Si vous préférez créer votre propre script :

```cpp
#include <WiFi.h>
#include <WiFiUdp.h>

const char* ssid = "VOTRE_SSID";
const char* password = "VOTRE_MOT_DE_PASSE";
const char* udpAddress = "192.168.1.100"; // IP de l'ordinateur
const int udpPort = 8888;

WiFiUDP udp;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connecté");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Lire une valeur (exemple: température)
  float temperature = 25.5; // Remplacez par votre capteur
  
  // Créer le JSON
  String json = "{";
  json += "\"esp32Id\":\"esp32-1\",";
  json += "\"streamId\":\"temperature\",";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"data\":" + String(temperature);
  json += "}";
  
  // Envoyer via UDP
  udp.beginPacket(udpAddress, udpPort);
  udp.print(json);
  udp.endPacket();
  
  delay(1000); // Envoyer toutes les secondes
}
```

## Structure du projet

```
esp32_data_visualisation/
├── app/                    # Application Next.js
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # Composants React
│   ├── ui/                # Composants UI de base
│   ├── charts/            # Composants de graphiques
│   ├── Dashboard.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── ESP32Dialog.tsx
│   └── StreamDialog.tsx
├── electron/              # Code Electron
│   ├── main.js           # Processus principal
│   └── preload.js        # Script de préchargement
├── store/                 # Stores Zustand
│   ├── configStore.ts    # Configuration ESP32 et flux
│   └── dataStore.ts      # Données en temps réel
├── lib/                   # Utilitaires
└── types/                 # Types TypeScript
```

## Technologies utilisées

- **Next.js 14** : Framework React
- **Electron** : Application desktop
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styles
- **Zustand** : Gestion d'état
- **Recharts** : Graphiques
- **shadcn/ui** : Composants UI

## Licence

MIT

