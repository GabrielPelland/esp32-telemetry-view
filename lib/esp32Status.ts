import { ESP32 } from '@/store/configStore'
import { useDataStore } from '@/store/dataStore'

// Temps en millisecondes avant de considérer un ESP32 comme offline (30 secondes)
const OFFLINE_THRESHOLD = 30000

export function isESP32Online(esp32: ESP32, dataStore: ReturnType<typeof useDataStore.getState>): boolean {
  // Vérifier si l'ESP32 a des flux actifs avec des données récentes
  const streams = dataStore.streams
  let hasRecentData = false

  for (const streamData of Array.from(streams.values())) {
    if (streamData.esp32Id === esp32.id) {
      const timeSinceLastUpdate = Date.now() - streamData.lastUpdate
      if (timeSinceLastUpdate < OFFLINE_THRESHOLD) {
        hasRecentData = true
        break
      }
    }
  }

  // Si pas de données récentes, vérifier lastSeen
  if (!hasRecentData && esp32.lastSeen) {
    const timeSinceLastSeen = Date.now() - esp32.lastSeen
    return timeSinceLastSeen < OFFLINE_THRESHOLD
  }

  return hasRecentData
}

export function getESP32Status(esp32: ESP32, dataStore: ReturnType<typeof useDataStore.getState>): 'online' | 'offline' | 'unknown' {
  if (!esp32.lastSeen) {
    return 'unknown'
  }

  const isOnline = isESP32Online(esp32, dataStore)
  return isOnline ? 'online' : 'offline'
}

