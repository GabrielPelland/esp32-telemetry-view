'use client'

import { useState, useEffect } from 'react'
import { useConfigStore, Command } from '@/store/configStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CommandDialog({
  open,
  onOpenChange,
  esp32Id,
  editingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  esp32Id: string
  editingId?: string | null
}) {
  const { addCommand, updateCommand, config } = useConfigStore()
  const [label, setLabel] = useState('')
  const [command, setCommand] = useState('')

  const editing = editingId ? config.commands.find((c) => c.id === editingId) : null

  useEffect(() => {
    if (editing && open) {
      setLabel(editing.label)
      setCommand(editing.command)
    } else if (!open) {
      setLabel('')
      setCommand('')
    }
  }, [open, editing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!label.trim() || !command.trim()) return

    // Valider que la commande est du JSON valide
    try {
      JSON.parse(command)
    } catch (error) {
      alert('La commande doit être du JSON valide')
      return
    }

    if (editingId && editing) {
      updateCommand(editingId, { label, command })
    } else {
      const newCommand: Command = {
        id: `cmd-${Date.now()}`,
        esp32Id,
        label,
        command,
      }
      addCommand(newCommand)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Modifier la commande' : 'Ajouter une commande'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Libellé</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Allumer LED"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="command">Commande JSON</Label>
            <textarea
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder='{"action": "led", "value": true}'
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            <p className="text-xs text-muted-foreground">
              La commande doit être du JSON valide qui sera envoyé à l'ESP32
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{editingId ? 'Modifier' : 'Ajouter'}</Button>
          </div>
        </form>
        <DialogClose onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}

