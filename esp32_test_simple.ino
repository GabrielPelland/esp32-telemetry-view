/*
 * Version simplifiée - Script ESP32 pour envoyer des données de test
 * Plus simple, sans bibliothèque JSON externe
 */

#include <WiFi.h>
#include <WiFiUdp.h>

// ========== CONFIGURATION ==========
const char* ssid = "VOTRE_SSID";
const char* password = "VOTRE_MOT_DE_PASSE";
const char* udpAddress = "192.168.1.100";  // IP de votre ordinateur
const int udpPort = 8888;
const char* esp32Id = "esp32-1";

WiFiUDP udp;
unsigned long lastSend = 0;
int counter = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Connexion WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connecté!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSend >= 1000) {  // Envoyer toutes les secondes
    lastSend = millis();
    counter++;
    
    // Générer des valeurs simulées
    float temp = 20.0 + 5.0 * sin(counter * 0.1) + random(-10, 10) * 0.1;
    float hum = 50.0 + 20.0 * sin(counter * 0.08) + random(-20, 20) * 0.2;
    
    // Envoyer température
    String json1 = "{\"esp32Id\":\"" + String(esp32Id) + 
                   "\",\"streamId\":\"temperature\"," +
                   "\"timestamp\":" + String(millis()) + 
                   ",\"data\":" + String(temp, 2) + "}";
    
    udp.beginPacket(udpAddress, udpPort);
    udp.print(json1);
    udp.endPacket();
    
    delay(10);
    
    // Envoyer humidité
    String json2 = "{\"esp32Id\":\"" + String(esp32Id) + 
                   "\",\"streamId\":\"humidity\"," +
                   "\"timestamp\":" + String(millis()) + 
                   ",\"data\":" + String(hum, 2) + "}";
    
    udp.beginPacket(udpAddress, udpPort);
    udp.print(json2);
    udp.endPacket();
    
    Serial.print("Envoyé - Temp: ");
    Serial.print(temp, 1);
    Serial.print("°C, Hum: ");
    Serial.print(hum, 1);
    Serial.println("%");
  }
  
  delay(10);
}

