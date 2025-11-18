'use client'

import { useState, useMemo } from 'react'
import { useConfigStore } from '@/store/configStore'
import { useDataStore } from '@/store/dataStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LineChart from './charts/LineChart'
import AreaChart from './charts/AreaChart'
import BarChart from './charts/BarChart'
import GaugeChart from './charts/GaugeChart'
import DonutChart from './charts/DonutChart'
import TableView from './charts/TableView'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Filter, Grid3x3, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { config } = useConfigStore()
  const { getStreamData } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterESP32, setFilterESP32] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid')

  const activeStreams = useMemo(() => {
    return config.streams.filter((stream) => {
      const data = getStreamData(stream.esp32Id, stream.streamId)
      if (!data || data.data.length === 0) return false

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const esp32 = config.esp32s.find((e) => e.id === stream.esp32Id)
        if (
          !stream.nickname.toLowerCase().includes(query) &&
          !stream.streamId.toLowerCase().includes(query) &&
          !(esp32?.name.toLowerCase().includes(query) || false)
        ) {
          return false
        }
      }

      // Filtre par ESP32
      if (filterESP32 !== 'all' && stream.esp32Id !== filterESP32) {
        return false
      }

      return true
    })
  }, [config.streams, config.esp32s, getStreamData, searchQuery, filterESP32])

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* Barre de recherche et filtres - Toujours visible */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher un flux..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select
          value={filterESP32}
          onChange={(e) => setFilterESP32(e.target.value)}
          className="w-full sm:w-48 flex-shrink-0"
        >
          <option value="all">Tous les ESP32</option>
          {config.esp32s.map((esp32) => (
            <option key={esp32.id} value={esp32.id}>
              {esp32.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex-shrink-0"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="flex-shrink-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Message si aucun flux configuré */}
      {config.streams.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="py-12 px-16 text-center">
              <p className="text-lg text-muted-foreground">
                Aucun flux configuré
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Configurez vos ESP32 et leurs flux de données dans la barre latérale, ou activez la détection automatique
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message si aucun résultat de recherche */}
      {config.streams.length > 0 && activeStreams.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="py-12 px-16 text-center">
              <p className="text-lg text-muted-foreground">
                Aucun résultat
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Aucun flux ne correspond à vos critères de recherche
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setFilterESP32('all')
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grille de cartes */}
      {activeStreams.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {activeStreams.map((stream) => {
              const esp32 = config.esp32s.find((e) => e.id === stream.esp32Id)
              const streamData = getStreamData(stream.esp32Id, stream.streamId)
              
              if (!streamData || streamData.data.length === 0) return null

              const latestValue = streamData.data[streamData.data.length - 1]?.value
              const latestTimestamp = streamData.data[streamData.data.length - 1]?.timestamp

              return (
              <Card key={stream.id} className="overflow-hidden border-l-4  animate-in card-shadow" style={{ borderLeftColor: esp32?.color || '#3b82f6' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {esp32 && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1"
                          style={{ backgroundColor: esp32.color }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{stream.nickname}</CardTitle>
                        {esp32 && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{esp32.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xl font-bold" style={{ color: esp32?.color || 'inherit' }}>
                        {latestValue?.toFixed(stream.unit === '%' ? 1 : 2)}
                        {stream.unit && <span className="text-sm font-normal ml-1">{stream.unit}</span>}
                      </div>
                    </div>
                  </div>
                    {latestTimestamp && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(latestTimestamp), 'HH:mm:ss', { locale: fr })}
                      </p>
                    )}
                </CardHeader>
                  <CardContent className="pt-0 pb-4 px-6">
                    <div className="h-[200px] w-full min-h-[200px]">
                      {stream.displayMode === 'line' && (
                        <LineChart stream={stream} data={streamData.data} />
                      )}
                      {stream.displayMode === 'area' && (
                        <AreaChart stream={stream} data={streamData.data} />
                      )}
                      {stream.displayMode === 'bar' && (
                        <BarChart stream={stream} data={streamData.data} />
                      )}
                      {stream.displayMode === 'gauge' && (
                        <GaugeChart
                          stream={stream}
                          value={latestValue}
                          min={stream.min}
                          max={stream.max}
                        />
                      )}
                      {stream.displayMode === 'donut' && (
                        <DonutChart stream={stream} data={streamData.data} />
                      )}
                      {stream.displayMode === 'table' && (
                        <TableView stream={stream} data={streamData.data} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {activeStreams.map((stream) => {
              const esp32 = config.esp32s.find((e) => e.id === stream.esp32Id)
              const streamData = getStreamData(stream.esp32Id, stream.streamId)
              
              if (!streamData || streamData.data.length === 0) return null

              const latestValue = streamData.data[streamData.data.length - 1]?.value
              const latestTimestamp = streamData.data[streamData.data.length - 1]?.timestamp

              return (
              <Card key={stream.id} className="overflow-hidden border-l-4  animate-in card-shadow" style={{ borderLeftColor: esp32?.color || '#3b82f6' }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {esp32 && (
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-1"
                        style={{ backgroundColor: esp32.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">{stream.nickname}</CardTitle>
                      </div>
                      {esp32 && (
                        <p className="text-xs text-muted-foreground mt-0.5">{esp32.name}</p>
                      )}
                        {latestTimestamp && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(latestTimestamp), 'HH:mm:ss', { locale: fr })}
                          </p>
                        )}
                    </div>
                  </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold" style={{ color: esp32?.color || 'inherit' }}>
                        {latestValue?.toFixed(stream.unit === '%' ? 1 : 2)}
                        {stream.unit && <span className="text-sm font-normal ml-1">{stream.unit}</span>}
                      </div>
                    </div>
                    <div className="w-[240px] h-[90px] flex-shrink-0">
                      {stream.displayMode === 'line' && (
                        <LineChart stream={stream} data={streamData.data.slice(-20)} compact />
                      )}
                      {stream.displayMode === 'area' && (
                        <AreaChart stream={stream} data={streamData.data.slice(-20)} compact />
                      )}
                      {stream.displayMode === 'bar' && (
                        <BarChart stream={stream} data={streamData.data.slice(-10)} compact />
                      )}
                      {stream.displayMode === 'gauge' && (
                        <GaugeChart
                          stream={stream}
                          value={latestValue}
                          min={stream.min}
                          max={stream.max}
                        />
                      )}
                      {stream.displayMode === 'donut' && (
                        <DonutChart stream={stream} data={streamData.data} />
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
