# Guide d'installation pour ESP32

Ce guide vous explique comment utiliser les scripts de test ESP32 avec l'application de visualisation.

## Prérequis

1. **ESP32** (ESP32 DevKit, ESP32-WROOM, etc.)
2. **IDE Arduino** avec support ESP32
3. **Bibliothèque ArduinoJson** (pour le script complet uniquement)

## Installation de l'environnement Arduino

### 1. Installer le support ESP32 dans Arduino IDE

1. Ouvrez Arduino IDE
2. Allez dans **Fichier > Préférences**
3. Dans "URL de gestionnaire de cartes supplémentaires", ajoutez :
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Allez dans **Outils > Type de carte > Gestionnaire de cartes**
5. Recherchez "esp32" et installez "esp32 by Espressif Systems"

### 2. Installer la bibliothèque ArduinoJson (pour esp32_test.ino)

1. Dans Arduino IDE, allez dans **Croquis > Inclure une bibliothèque > Gérer les bibliothèques**
2. Recherchez "ArduinoJson"
3. Installez "ArduinoJson by Benoit Blanchon" (version 6.x recommandée)

## Configuration du script

### Option 1 : Script complet (recommandé)

1. Ouvrez `esp32_test.ino` dans Arduino IDE
2. Modifiez les constantes en haut du fichier :

```cpp
const char* ssid = "VOTRE_SSID";              // ← Votre WiFi
const char* password = "VOTRE_MOT_DE_PASSE";  // ← Mot de passe WiFi
const char* udpAddress = "192.168.1.100";     // ← IP de votre PC
const char* esp32Id = "esp32-1";              // ← ID de l'ESP32
```

3. Sélectionnez votre carte : **Outils > Type de carte > ESP32 Arduino > ESP32 Dev Module**
4. Sélectionnez le port : **Outils > Port** (ex: COM3, /dev/ttyUSB0, etc.)
5. Téléversez le code : **Croquis > Téléverser**

### Option 2 : Script simplifié

1. Ouvrez `esp32_test_simple.ino` dans Arduino IDE
2. Modifiez les mêmes constantes que ci-dessus
3. Téléversez (pas besoin de bibliothèque externe)

## Configuration dans l'application

1. **Lancez l'application Electron**
2. **Ajoutez l'ESP32** :
   - Cliquez sur "Ajouter" dans la barre latérale
   - Nom : "ESP32 Test" (ou autre)
   - IP : L'adresse IP de votre ESP32 (visible dans le moniteur série)
   - ID : Doit correspondre à `esp32Id` dans le script (ex: "esp32-1")
   - Choisissez une couleur
   - Cliquez sur "Ajouter"

3. **Ajoutez les flux de données** :
   - Cliquez sur l'ESP32 que vous venez d'ajouter
   - Cliquez sur "Ajouter un flux"
   - Pour le script complet, ajoutez :
     - **temperature** (ID: "temperature", Unité: "°C", Min: 15, Max: 30)
     - **humidity** (ID: "humidity", Unité: "%", Min: 0, Max: 100)
     - **pressure** (ID: "pressure", Unité: "hPa", Min: 1000, Max: 1030)
     - **voltage** (ID: "voltage", Unité: "V", Min: 3.0, Max: 3.6)
   - Pour le script simplifié, ajoutez seulement :
     - **temperature** (ID: "temperature")
     - **humidity** (ID: "humidity")

## Vérification

1. Ouvrez le **Moniteur série** dans Arduino IDE (115200 bauds)
2. Vous devriez voir :
   - La connexion WiFi
   - L'IP de l'ESP32
   - Les messages d'envoi de données

3. Dans l'application Electron :
   - Les graphiques devraient apparaître automatiquement
   - Les valeurs devraient se mettre à jour toutes les secondes

## Dépannage

### L'ESP32 ne se connecte pas au WiFi
- Vérifiez le SSID et le mot de passe
- Assurez-vous que le WiFi est en 2.4 GHz (ESP32 ne supporte pas le 5 GHz)
- Vérifiez la distance au routeur

### Aucune donnée reçue dans l'application
- Vérifiez que l'IP dans le script correspond à l'IP de votre ordinateur
- Vérifiez que le port 8888 n'est pas bloqué par le firewall
- Vérifiez que l'ESP32 et l'ordinateur sont sur le même réseau
- Vérifiez que l'ID de l'ESP32 correspond dans le script et dans l'application

### Erreur de compilation
- Vérifiez que le support ESP32 est installé
- Pour `esp32_test.ino`, vérifiez que ArduinoJson est installé
- Essayez le script simplifié qui ne nécessite pas de bibliothèque externe

## Trouver l'IP de votre ordinateur

### Windows
```cmd
ipconfig
```
Cherchez "Adresse IPv4" (ex: 192.168.1.100)

### macOS / Linux
```bash
ifconfig
```
ou
```bash
ip addr show
```
Cherchez l'adresse IP de votre interface réseau (généralement en 192.168.x.x)

