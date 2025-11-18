'use client'

import { useState, useEffect } from 'react'
import { useConfigStore } from '@/store/configStore'
import { useDataStore } from '@/store/dataStore'
import { Plus, Settings, Trash2, Edit2, Radio, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import ESP32Dialog from './ESP32Dialog'
import StreamDialog from './StreamDialog'
import CommandPanel from './CommandPanel'
import { getESP32Status } from '@/lib/esp32Status'

export default function Sidebar() {
  const { config, removeESP32, getStreamsForESP32 } = useConfigStore()
  const dataStore = useDataStore()
  const [esp32DialogOpen, setESP32DialogOpen] = useState(false)
  const [streamDialogOpen, setStreamDialogOpen] = useState(false)
  const [editingESP32, setEditingESP32] = useState<string | null>(null)
  const [selectedESP32, setSelectedESP32] = useState<string | null>(null)
  const [editingStream, setEditingStream] = useState<string | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Mettre à jour le statut toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleEditESP32 = (id: string) => {
    setEditingESP32(id)
    setESP32DialogOpen(true)
  }

  const handleAddStream = (esp32Id: string) => {
    setSelectedESP32(esp32Id)
    setStreamDialogOpen(true)
  }

  return (
    <aside className="w-80 border-r border-border/40 bg-card/50 backdrop-blur-xl overflow-y-auto overflow-x-hidden flex-shrink-0">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ESP32</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingESP32(null)
              setESP32DialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <Accordion>
          {config.esp32s.map((esp32) => {
            const streams = getStreamsForESP32(esp32.id)
            // Utiliser updateTrigger pour forcer le re-render
            const status = getESP32Status(esp32, dataStore)
            const isOnline = status === 'online'
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = updateTrigger // Force re-render
            
            return (
              <AccordionItem key={esp32.id} value={esp32.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: esp32.color }}
                    />
                    <span className="text-sm font-medium truncate">{esp32.name}</span>
                    {esp32.autoDetected && (
                      <span title="Auto-détecté">
                        <Radio className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </span>
                    )}
                    <span title={isOnline ? 'En ligne' : status === 'offline' ? 'Hors ligne' : 'Statut inconnu'}>
                      <Circle
                        className={`h-2 w-2 flex-shrink-0 ml-auto ${
                          isOnline
                            ? 'text-green-500 fill-green-500'
                            : status === 'offline'
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-400 fill-gray-400'
                        }`}
                      />
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {/* En-tête avec IP et statut */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{esp32.ip}</span>
                      <span className={`${
                        isOnline
                          ? 'text-green-600 dark:text-green-400'
                          : status === 'offline'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                      }`}>
                        {isOnline ? 'En ligne' : status === 'offline' ? 'Hors ligne' : 'Inconnu'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditESP32(esp32.id)}
                      >
                        <Edit2 className="h-3 w-3 mr-1.5" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeESP32(esp32.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Flux de données */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Flux ({streams.length})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleAddStream(esp32.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                      {streams.length > 0 ? (
                        <div className="space-y-1">
                          {streams.map((stream) => (
                            <StreamItem 
                              key={stream.id} 
                              stream={stream} 
                              onEdit={() => {
                                setEditingStream(stream.id)
                                setSelectedESP32(esp32.id)
                                setStreamDialogOpen(true)
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Aucun flux configuré
                        </p>
                      )}
                    </div>

                    {/* Commandes */}
                    <CommandPanel esp32Id={esp32.id} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {config.esp32s.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun ESP32 configuré
              <br />
              Cliquez sur "Ajouter" pour commencer
            </CardContent>
          </Card>
        )}
      </div>

      <ESP32Dialog
        open={esp32DialogOpen}
        onOpenChange={setESP32DialogOpen}
        editingId={editingESP32}
      />

      <StreamDialog
        open={streamDialogOpen}
        onOpenChange={(open) => {
          setStreamDialogOpen(open)
          if (!open) {
            setEditingStream(null)
            setSelectedESP32(null)
          }
        }}
        esp32Id={selectedESP32}
        editingId={editingStream}
      />
    </aside>
  )
}

function StreamItem({ stream, onEdit }: { stream: any; onEdit: () => void }) {
  const { removeStream } = useConfigStore()

  return (
    <div className="flex items-center justify-between p-2 rounded border bg-background">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{stream.nickname}</div>
        <div className="text-xs text-muted-foreground">
          ID: {stream.streamId} • {stream.displayMode}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onEdit}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => removeStream(stream.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

