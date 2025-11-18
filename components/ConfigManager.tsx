'use client'

import { useState } from 'react'
import { useConfigStore } from '@/store/configStore'
import { Button } from '@/components/ui/button'
import { Save, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function ConfigManager() {
  const { config, loadConfig } = useConfigStore()
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const handleSaveConfig = async () => {
    if (!window.electronAPI) return

    try {
      const result = await window.electronAPI.saveConfigFile(config)
      
      if (result.canceled) {
        return
      }

      if (result.success) {
        setStatus({ type: 'success', message: `Configuration sauvegardée : ${result.filePath}` })
        setTimeout(() => setStatus({ type: null, message: '' }), 3000)
      } else {
        setStatus({ type: 'error', message: result.error || 'Erreur lors de la sauvegarde' })
        setTimeout(() => setStatus({ type: null, message: '' }), 5000)
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Erreur lors de la sauvegarde' })
      setTimeout(() => setStatus({ type: null, message: '' }), 5000)
    }
  }

  const handleLoadConfig = async () => {
    if (!window.electronAPI) return

    try {
      const result = await window.electronAPI.loadConfigFile()
      
      if (result.canceled) {
        return
      }

      if (result.success && result.config) {
        // Valider la structure de la configuration
        if (!result.config.esp32s || !result.config.streams) {
          setStatus({ type: 'error', message: 'Format de configuration invalide' })
          setTimeout(() => setStatus({ type: null, message: '' }), 5000)
          return
        }

        // Mettre à jour la configuration
        const configStore = useConfigStore.getState()
        configStore.config = {
          esp32s: result.config.esp32s || [],
          streams: result.config.streams || [],
          commands: result.config.commands || [],
          autoDetection: result.config.autoDetection !== undefined ? result.config.autoDetection : true,
        }
        await configStore.saveConfig()
        await loadConfig()

        setStatus({ type: 'success', message: `Configuration chargée : ${result.filePath}` })
        setTimeout(() => setStatus({ type: null, message: '' }), 3000)
      } else {
        setStatus({ type: 'error', message: result.error || 'Erreur lors du chargement' })
        setTimeout(() => setStatus({ type: null, message: '' }), 5000)
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Erreur lors du chargement' })
      setTimeout(() => setStatus({ type: null, message: '' }), 5000)
    }
  }

  return (
    <Card className="px-3 py-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveConfig}
          className="h-8 px-3"
          title="Sauvegarder la configuration"
        >
          <Save className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadConfig}
          className="h-8 px-3"
          title="Charger une configuration"
        >
          <FolderOpen className="h-3.5 w-3.5" />
        </Button>
      </div>
      {status.type && (
        <div className={`mt-2 flex items-center gap-1.5 text-xs ${
          status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="truncate text-[10px]">{status.message}</span>
        </div>
      )}
    </Card>
  )
}

