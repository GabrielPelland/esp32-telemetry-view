import { create } from 'zustand'

export interface ESP32 {
  id: string
  name: string
  ip: string
  color: string
  lastSeen?: number
  autoDetected?: boolean
}

export interface DataStream {
  id: string
  esp32Id: string
  streamId: string
  nickname: string
  displayMode: 'line' | 'bar' | 'gauge' | 'table' | 'area' | 'donut'
  unit?: string
  min?: number
  max?: number
  autoDetected?: boolean
}

export interface Command {
  id: string
  esp32Id: string
  label: string
  command: string
  color?: string
  icon?: string
}

export interface Config {
  esp32s: ESP32[]
  streams: DataStream[]
  commands: Command[]
  autoDetection: boolean
}

interface ConfigStore {
  config: Config
  loadConfig: () => Promise<void>
  saveConfig: () => Promise<void>
  addESP32: (esp32: ESP32) => void
  removeESP32: (id: string) => void
  updateESP32: (id: string, updates: Partial<ESP32>) => void
  addStream: (stream: DataStream) => void
  removeStream: (id: string) => void
  updateStream: (id: string, updates: Partial<DataStream>) => void
  getESP32: (id: string) => ESP32 | undefined
  getStreamsForESP32: (esp32Id: string) => DataStream[]
  setAutoDetection: (enabled: boolean) => void
  autoDetectESP32: (esp32Id: string, sourceIP: string) => void
  autoDetectStream: (esp32Id: string, streamId: string) => void
  addCommand: (command: Command) => void
  removeCommand: (id: string) => void
  updateCommand: (id: string, updates: Partial<Command>) => void
  getCommandsForESP32: (esp32Id: string) => Command[]
}

// Couleurs par défaut
const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#a855f7'
]

// Suggestions d'unités
const UNIT_SUGGESTIONS: Record<string, string> = {
  temperature: '°C', temp: '°C',
  humidity: '%', hum: '%',
  pressure: 'hPa', pres: 'hPa',
  voltage: 'V', volt: 'V',
  current: 'A', amp: 'A',
  power: 'W', watt: 'W',
}

// Suggestions de min/max
const RANGE_SUGGESTIONS: Record<string, { min: number; max: number }> = {
  temperature: { min: -10, max: 50 }, temp: { min: -10, max: 50 },
  humidity: { min: 0, max: 100 }, hum: { min: 0, max: 100 },
  pressure: { min: 900, max: 1100 }, pres: { min: 900, max: 1100 },
  voltage: { min: 0, max: 5 }, volt: { min: 0, max: 5 },
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: { esp32s: [], streams: [], commands: [], autoDetection: true },

  loadConfig: async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const config = await window.electronAPI.getConfig()
        // Rétrocompatibilité
        if (config.autoDetection === undefined) config.autoDetection = true
        if (!config.commands) config.commands = []
        set({ config })
      } catch (error) {
        console.error('Erreur chargement config:', error)
      }
    }
  },

  saveConfig: async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const { config } = get()
        await window.electronAPI.saveConfig(config)
      } catch (error) {
        console.error('Erreur sauvegarde config:', error)
      }
    }
  },

  addESP32: (esp32) => {
    set((state) => ({
      config: {
        ...state.config,
        esp32s: [...state.config.esp32s, esp32],
      },
    }))
    get().saveConfig()
  },

  removeESP32: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        esp32s: state.config.esp32s.filter((e) => e.id !== id),
        streams: state.config.streams.filter((s) => s.esp32Id !== id),
      },
    }))
    get().saveConfig()
  },

  updateESP32: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        esp32s: state.config.esp32s.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      },
    }))
    get().saveConfig()
  },

  addStream: (stream) => {
    set((state) => ({
      config: {
        ...state.config,
        streams: [...state.config.streams, stream],
      },
    }))
    get().saveConfig()
  },

  removeStream: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        streams: state.config.streams.filter((s) => s.id !== id),
      },
    }))
    get().saveConfig()
  },

  updateStream: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        streams: state.config.streams.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    }))
    get().saveConfig()
  },

  getESP32: (id) => {
    return get().config.esp32s.find((e) => e.id === id)
  },

  getStreamsForESP32: (esp32Id) => {
    return get().config.streams.filter((s) => s.esp32Id === esp32Id)
  },

  setAutoDetection: (enabled) => {
    set((state) => ({
      config: { ...state.config, autoDetection: enabled },
    }))
    get().saveConfig()
  },

  autoDetectESP32: (esp32Id, sourceIP) => {
    const { config } = get()
    if (config.esp32s.find((e) => e.id === esp32Id)) {
      const existing = config.esp32s.find((e) => e.id === esp32Id)
      if (existing && (!existing.ip || existing.ip !== sourceIP)) {
        get().updateESP32(esp32Id, { ip: sourceIP, lastSeen: Date.now() })
      } else if (existing) {
        get().updateESP32(esp32Id, { lastSeen: Date.now() })
      }
      return
    }

    const colorIndex = config.esp32s.length % DEFAULT_COLORS.length
    const newESP32: ESP32 = {
      id: esp32Id,
      name: `ESP32 ${esp32Id}`,
      ip: sourceIP,
      color: DEFAULT_COLORS[colorIndex],
      autoDetected: true,
      lastSeen: Date.now(),
    }
    get().addESP32(newESP32)
  },

  autoDetectStream: (esp32Id, streamId) => {
    const { config } = get()
    if (config.streams.find((s) => s.esp32Id === esp32Id && s.streamId === streamId)) {
      return
    }
    if (!config.esp32s.find((e) => e.id === esp32Id)) {
      return
    }

    const streamIdLower = streamId.toLowerCase()
    const unit = UNIT_SUGGESTIONS[streamIdLower] || ''
    const range = RANGE_SUGGESTIONS[streamIdLower]
    const nickname = streamId.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()

    const newStream: DataStream = {
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      esp32Id,
      streamId,
      nickname,
      displayMode: 'line',
      unit: unit || undefined,
      min: range?.min,
      max: range?.max,
      autoDetected: true,
    }
    get().addStream(newStream)
  },

  addCommand: (command) => {
    set((state) => ({
      config: {
        ...state.config,
        commands: [...state.config.commands, command],
      },
    }))
    get().saveConfig()
  },

  removeCommand: (id) => {
    set((state) => ({
      config: {
        ...state.config,
        commands: state.config.commands.filter((c) => c.id !== id),
      },
    }))
    get().saveConfig()
  },

  updateCommand: (id, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        commands: state.config.commands.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    }))
    get().saveConfig()
  },

  getCommandsForESP32: (esp32Id) => {
    return get().config.commands.filter((c) => c.esp32Id === esp32Id)
  },
}))

