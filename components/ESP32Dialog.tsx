'use client'

import { useState, useEffect } from 'react'
import { useConfigStore, ESP32 } from '@/store/configStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#a855f7'
]

export default function ESP32Dialog({
  open,
  onOpenChange,
  editingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId: string | null
}) {
  const { config, addESP32, updateESP32, getESP32 } = useConfigStore()
  const [name, setName] = useState('')
  const [ip, setIP] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [initialized, setInitialized] = useState(false)

  // Ne réinitialiser que lorsque le dialog s'ouvre ou que l'editingId change
  useEffect(() => {
    if (open && !initialized) {
      if (editingId) {
        const editing = getESP32(editingId)
        if (editing) {
          setName(editing.name)
          setIP(editing.ip)
          setColor(editing.color)
        }
      } else {
        setName('')
        setIP('')
        setColor(COLORS[0])
      }
      setInitialized(true)
    } else if (!open) {
      setInitialized(false)
    }
  }, [open, editingId, initialized, getESP32])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !ip.trim()) return

    if (editingId) {
      updateESP32(editingId, { name, ip, color })
    } else {
      const newESP32: ESP32 = {
        id: `esp32-${Date.now()}`,
        name,
        ip,
        color,
      }
      addESP32(newESP32)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Modifier ESP32' : 'Ajouter un ESP32'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: ESP32 Salon"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip">Adresse IP</Label>
            <Input
              id="ip"
              value={ip}
              onChange={(e) => setIP(e.target.value)}
              placeholder="192.168.1.100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingId ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
        <DialogClose onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}

