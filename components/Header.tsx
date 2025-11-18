'use client'

import { useDataStore } from '@/store/dataStore'
import { useConfigStore } from '@/store/configStore'
import { Activity, Wifi, WifiOff, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import ConfigManager from './ConfigManager'

export default function Header() {
  const { streams } = useDataStore()
  const { config, setAutoDetection } = useConfigStore()
  
  const activeStreams = streams.size
  const activeESP32s = new Set(Array.from(streams.values()).map(s => s.esp32Id)).size

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <h1 className="text-2xl font-bold whitespace-nowrap">ESP32 Data Visualisation</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <Activity className="h-4 w-4 flex-shrink-0" />
            <span>{activeStreams} flux actifs</span>
            <span>•</span>
            <span>{activeESP32s} ESP32 connectés</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ConfigManager />
          <Card className="px-4 py-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Label htmlFor="auto-detect" className="text-sm cursor-pointer whitespace-nowrap">
                  Détection auto
                </Label>
              </div>
              <Switch
                id="auto-detect"
                checked={config.autoDetection !== false}
                onCheckedChange={setAutoDetection}
              />
            </div>
          </Card>
          <Card className="px-4 py-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              {activeStreams > 0 ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">Connecté</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">En attente</span>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </header>
  )
}

