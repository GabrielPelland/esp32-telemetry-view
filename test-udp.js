/**
 * Script de test pour envoyer des données UDP à l'application
 * Usage: node test-udp.js
 */

const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const TARGET_IP = '127.0.0.1'; // Changez pour l'IP de votre ordinateur
const TARGET_PORT = 8888;

// Simuler plusieurs ESP32 avec différents flux
const esp32s = [
  { id: 'esp32-1', name: 'ESP32 Salon', streams: ['temperature', 'humidity'] },
  { id: 'esp32-2', name: 'ESP32 Cuisine', streams: ['temperature', 'pressure'] },
];

function sendData(esp32Id, streamId, value) {
  const data = {
    esp32Id,
    streamId,
    timestamp: Date.now(),
    data: value,
  };

  const message = Buffer.from(JSON.stringify(data));

  client.send(message, TARGET_PORT, TARGET_IP, (err) => {
    if (err) {
      console.error('Erreur envoi:', err);
    } else {
      console.log(`✓ ${esp32Id} - ${streamId}: ${value}`);
    }
  });
}

// Envoyer des données toutes les secondes
let counter = 0;
setInterval(() => {
  counter++;
  
  esp32s.forEach((esp32) => {
    esp32.streams.forEach((streamId) => {
      let value;
      
      // Générer des valeurs réalistes selon le type de flux
      if (streamId === 'temperature') {
        value = 20 + Math.sin(counter / 10) * 5 + Math.random() * 2;
      } else if (streamId === 'humidity') {
        value = 50 + Math.sin(counter / 15) * 10 + Math.random() * 3;
      } else if (streamId === 'pressure') {
        value = 1013 + Math.sin(counter / 20) * 5 + Math.random() * 1;
      } else {
        value = Math.random() * 100;
      }
      
      sendData(esp32.id, streamId, parseFloat(value.toFixed(2)));
    });
  });
  
  console.log(`--- Cycle ${counter} ---`);
}, 1000);

console.log(`Envoi de données de test vers ${TARGET_IP}:${TARGET_PORT}`);
console.log('Appuyez sur Ctrl+C pour arrêter\n');

