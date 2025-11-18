'use client'

import { useConfigStore } from '@/store/configStore'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Send } from 'lucide-react'
import CommandDialog from './CommandDialog'
import { useState } from 'react'

interface CommandPanelProps {
  esp32Id: string
}

export default function CommandPanel({ esp32Id }: CommandPanelProps) {
  const { config, getCommandsForESP32, removeCommand } = useConfigStore()
  const [commandDialogOpen, setCommandDialogOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<string | null>(null)
  const esp32 = config.esp32s.find((e) => e.id === esp32Id)
  const commands = getCommandsForESP32(esp32Id)

  const handleSendCommand = async (commandId: string) => {
    const command = commands.find((c) => c.id === commandId)
    if (!command || !esp32) return

    try {
      if (window.electronAPI) {
        await window.electronAPI.sendUDPCommand(
          esp32.ip,
          8888,
          JSON.parse(command.command)
        )
      }
    } catch (error) {
      console.error('Erreur envoi commande:', error)
    }
  }

  if (!esp32) return null

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Commandes ({commands.length})</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setEditingCommand(null)
              setCommandDialogOpen(true)
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        </div>
        {commands.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            Aucune commande
          </p>
        ) : (
          <div className="space-y-1">
            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className="flex items-center justify-between p-2 rounded border bg-background"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{cmd.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {cmd.command.substring(0, 40)}
                    {cmd.command.length > 40 ? '...' : ''}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleSendCommand(cmd.id)}
                    title="Envoyer"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setEditingCommand(cmd.id)
                      setCommandDialogOpen(true)
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeCommand(cmd.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CommandDialog
        open={commandDialogOpen}
        onOpenChange={(open) => {
          setCommandDialogOpen(open)
          if (!open) setEditingCommand(null)
        }}
        esp32Id={esp32Id}
        editingId={editingCommand}
      />
    </>
  )
}

