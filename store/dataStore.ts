import { create } from 'zustand'
import { useConfigStore } from './configStore'

export interface DataPoint {
  timestamp: number
  value: number
}

export interface StreamData {
  esp32Id: string
  streamId: string
  data: DataPoint[]
  lastUpdate: number
}

interface DataStore {
  streams: Map<string, StreamData>
  maxDataPoints: number
  initializeUDP: () => void
  addDataPoint: (esp32Id: string, streamId: string, value: number, timestamp: number) => void
  getStreamData: (esp32Id: string, streamId: string) => StreamData | undefined
  clearStream: (esp32Id: string, streamId: string) => void
  setMaxDataPoints: (max: number) => void
}

export const useDataStore = create<DataStore>((set, get) => ({
  streams: new Map(),
  maxDataPoints: 1000,

  initializeUDP: () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onUDPData((data: any) => {
        const { esp32Id, streamId, timestamp, data: value, sourceIP } = data
        
        if (esp32Id && streamId !== undefined && value !== undefined) {
          // Détection automatique si activée
          const configStore = useConfigStore.getState()
          if (configStore.config.autoDetection !== false) {
            // Détecter l'ESP32
            if (sourceIP) {
              configStore.autoDetectESP32(esp32Id, sourceIP)
            }
            // Détecter le flux
            configStore.autoDetectStream(esp32Id, streamId)
          }
          
          // Mettre à jour lastSeen de l'ESP32
          const existingESP32 = configStore.getESP32(esp32Id)
          if (existingESP32) {
            configStore.updateESP32(esp32Id, { lastSeen: Date.now() })
          }
          
          // Ajouter le point de données
          get().addDataPoint(
            esp32Id,
            streamId,
            parseFloat(value),
            timestamp || Date.now()
          )
        }
      })
    }
  },

  addDataPoint: (esp32Id, streamId, value, timestamp) => {
    const key = `${esp32Id}-${streamId}`
    set((state) => {
      const newStreams = new Map(state.streams)
      const existing = newStreams.get(key)

      if (existing) {
        const newData = [...existing.data, { timestamp, value }]
        // Limiter le nombre de points
        const trimmedData = newData.slice(-state.maxDataPoints)
        newStreams.set(key, {
          ...existing,
          data: trimmedData,
          lastUpdate: timestamp,
        })
      } else {
        newStreams.set(key, {
          esp32Id,
          streamId,
          data: [{ timestamp, value }],
          lastUpdate: timestamp,
        })
      }

      return { streams: newStreams }
    })
  },

  getStreamData: (esp32Id, streamId) => {
    const key = `${esp32Id}-${streamId}`
    return get().streams.get(key)
  },

  clearStream: (esp32Id, streamId) => {
    const key = `${esp32Id}-${streamId}`
    set((state) => {
      const newStreams = new Map(state.streams)
      newStreams.delete(key)
      return { streams: newStreams }
    })
  },

  setMaxDataPoints: (max) => {
    set({ maxDataPoints: max })
  },
}))

