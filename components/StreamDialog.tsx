'use client'

import { useState, useEffect } from 'react'
import { useConfigStore, DataStream } from '@/store/configStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

const DISPLAY_MODES = [
  { value: 'line', label: 'Ligne' },
  { value: 'area', label: 'Aire' },
  { value: 'bar', label: 'Barres' },
  { value: 'gauge', label: 'Jauge' },
  { value: 'donut', label: 'Donut' },
  { value: 'table', label: 'Tableau' },
]

export default function StreamDialog({
  open,
  onOpenChange,
  esp32Id,
  editingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  esp32Id: string | null
  editingId?: string | null
}) {
  const { addStream, updateStream, config } = useConfigStore()
  const [streamId, setStreamId] = useState('')
  const [nickname, setNickname] = useState('')
  const [displayMode, setDisplayMode] = useState<'line' | 'bar' | 'gauge' | 'table' | 'area' | 'donut'>('line')
  const [unit, setUnit] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Ne réinitialiser que lorsque le dialog s'ouvre ou que l'editingId change
  useEffect(() => {
    if (open && !initialized) {
      if (editingId) {
        const editing = config.streams.find(s => s.id === editingId)
        if (editing) {
          setStreamId(editing.streamId)
          setNickname(editing.nickname)
          setDisplayMode(editing.displayMode)
          setUnit(editing.unit || '')
          setMin(editing.min?.toString() || '')
          setMax(editing.max?.toString() || '')
        }
      } else {
        setStreamId('')
        setNickname('')
        setDisplayMode('line')
        setUnit('')
        setMin('')
        setMax('')
      }
      setInitialized(true)
    } else if (!open) {
      setInitialized(false)
    }
  }, [open, editingId, initialized, config.streams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!esp32Id || !streamId.trim() || !nickname.trim()) return

    if (editingId) {
      updateStream(editingId, {
        streamId,
        nickname,
        displayMode,
        unit: unit || undefined,
        min: min ? parseFloat(min) : undefined,
        max: max ? parseFloat(max) : undefined,
      })
    } else {
      const newStream: DataStream = {
        id: `stream-${Date.now()}`,
        esp32Id,
        streamId,
        nickname,
        displayMode,
        unit: unit || undefined,
        min: min ? parseFloat(min) : undefined,
        max: max ? parseFloat(max) : undefined,
      }
      addStream(newStream)
    }

    onOpenChange(false)
  }

  if (!esp32Id) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Modifier le flux de données' : 'Ajouter un flux de données'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streamId">ID du flux</Label>
            <Input
              id="streamId"
              value={streamId}
              onChange={(e) => setStreamId(e.target.value)}
              placeholder="Ex: temperature, humidity, pressure"
              required
              disabled={!!editingId}
            />
            <p className="text-xs text-muted-foreground">
              {editingId 
                ? "L'ID du flux ne peut pas être modifié"
                : "Doit correspondre à l'ID envoyé par l'ESP32"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Surnom</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Température salon"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayMode">Mode d'affichage</Label>
            <Select
              id="displayMode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as any)}
            >
              {DISPLAY_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unité (optionnel)</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ex: °C, %, hPa"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min">Min (optionnel)</Label>
              <Input
                id="min"
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max (optionnel)</Label>
              <Input
                id="max"
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="100"
              />
            </div>
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

