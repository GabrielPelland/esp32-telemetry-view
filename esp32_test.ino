/*
 * Script de test ESP32 pour envoyer des données simulées via UDP
 * 
 * Configuration requise:
 * 1. Modifiez les constantes WiFi ci-dessous
 * 2. Modifiez l'adresse IP et le port de destination
 * 3. Téléversez ce script sur votre ESP32
 */

#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>

// ========== CONFIGURATION WIFI ==========
const char* ssid = "VOTRE_SSID";           // Nom de votre réseau WiFi
const char* password = "VOTRE_MOT_DE_PASSE"; // Mot de passe WiFi

// ========== CONFIGURATION UDP ==========
const char* udpAddress = "192.168.1.100";  // IP de l'ordinateur qui exécute l'application
const int udpPort = 8888;                   // Port UDP (par défaut: 8888)

// ========== CONFIGURATION ESP32 ==========
const char* esp32Id = "esp32-1";            // ID de cet ESP32 (doit correspondre à la config dans l'app)
const unsigned long sendInterval = 1000;    // Intervalle d'envoi en millisecondes (1000 = 1 seconde)

// ========== VARIABLES ==========
WiFiUDP udp;
unsigned long lastSendTime = 0;
unsigned long startTime = 0;

// Variables pour simuler des données réalistes
float temperature = 20.0;
float humidity = 50.0;
float pressure = 1013.25;
float voltage = 3.3;
int counter = 0;

// ========== FONCTIONS ==========

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== ESP32 Test Data Sender ===");
  Serial.print("Connexion au WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  // Attendre la connexion
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connecté!");
    Serial.print("IP locale: ");
    Serial.println(WiFi.localIP());
    Serial.print("Envoi vers: ");
    Serial.print(udpAddress);
    Serial.print(":");
    Serial.println(udpPort);
    Serial.print("ESP32 ID: ");
    Serial.println(esp32Id);
    Serial.println("\n=== Démarrage de l'envoi de données ===\n");
  } else {
    Serial.println("\n✗ Échec de la connexion WiFi!");
    Serial.println("Vérifiez vos identifiants WiFi");
    while(1) delay(1000); // Boucle infinie en cas d'échec
  }
  
  startTime = millis();
}

void loop() {
  // Vérifier la connexion WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connexion WiFi perdue, reconnexion...");
    WiFi.reconnect();
    delay(2000);
    return;
  }
  
  // Envoyer les données à intervalles réguliers
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    counter++;
    
    // Simuler des variations réalistes des données
    // Température: variation sinusoïdale entre 18°C et 25°C
    temperature = 21.5 + 3.5 * sin(counter * 0.1) + (random(0, 20) - 10) * 0.1;
    
    // Humidité: variation sinusoïdale entre 40% et 70%
    humidity = 55.0 + 15.0 * sin(counter * 0.08) + (random(0, 20) - 10) * 0.2;
    
    // Pression: variation lente entre 1010 et 1020 hPa
    pressure = 1015.0 + 5.0 * sin(counter * 0.05) + (random(0, 10) - 5) * 0.1;
    
    // Tension: légère variation autour de 3.3V
    voltage = 3.3 + 0.1 * sin(counter * 0.15) + (random(0, 10) - 5) * 0.01;
    
    // Envoyer chaque flux de données
    sendData("temperature", temperature);
    delay(10); // Petit délai entre les envois
    
    sendData("humidity", humidity);
    delay(10);
    
    sendData("pressure", pressure);
    delay(10);
    
    sendData("voltage", voltage);
    
    // Afficher un message toutes les 10 secondes
    if (counter % 10 == 0) {
      Serial.print("Données envoyées: ");
      Serial.print(counter);
      Serial.print(" cycles (");
      Serial.print((millis() - startTime) / 1000);
      Serial.println(" secondes)");
    }
  }
  
  delay(10); // Petit délai pour éviter de surcharger le CPU
}

void sendData(const char* streamId, float value) {
  // Créer un document JSON
  StaticJsonDocument<200> doc;
  doc["esp32Id"] = esp32Id;
  doc["streamId"] = streamId;
  doc["timestamp"] = millis();
  doc["data"] = value;
  
  // Sérialiser le JSON
  char buffer[200];
  serializeJson(doc, buffer);
  
  // Envoyer via UDP
  udp.beginPacket(udpAddress, udpPort);
  udp.print(buffer);
  udp.endPacket();
  
  // Afficher dans le moniteur série (optionnel, peut être désactivé)
  Serial.print("→ ");
  Serial.print(streamId);
  Serial.print(": ");
  Serial.print(value, 2);
  Serial.println();
}

