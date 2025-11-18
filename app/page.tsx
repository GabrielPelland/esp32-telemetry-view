'use client'

import { useEffect } from 'react'
import { useDataStore } from '@/store/dataStore'
import { useConfigStore } from '@/store/configStore'
import Dashboard from '@/components/Dashboard'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function Home() {
  const { initializeUDP } = useDataStore()
  const { loadConfig } = useConfigStore()

  useEffect(() => {
    // Charger la configuration au démarrage
    loadConfig()
    
    // Initialiser la réception UDP
    initializeUDP()
  }, [loadConfig, initializeUDP])

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

