import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ESP32 Data Visualisation',
  description: 'Application de visualisation des données ESP32 en temps réel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

