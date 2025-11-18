'use client'

import { useMemo } from 'react'
import { DataStream } from '@/store/configStore'

interface GaugeChartProps {
  stream: DataStream
  value: number
  min?: number
  max?: number
}

export default function GaugeChart({ stream, value, min, max }: GaugeChartProps) {
  const normalizedValue = useMemo(() => {
    if (min === undefined || max === undefined) {
      return 50 // Valeur par défaut si min/max non définis
    }
    return ((value - min) / (max - min)) * 100
  }, [value, min, max])

  const percentage = Math.max(0, Math.min(100, normalizedValue))
  const angle = (percentage / 100) * 180 - 90 // -90 à 90 degrés

  const getColor = () => {
    if (percentage < 33) return '#10b981' // Vert
    if (percentage < 66) return '#f59e0b' // Orange
    return '#ef4444' // Rouge
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-2">
      <div className="relative w-full max-w-[180px] aspect-[2/1] mx-auto">
        {/* Arc de fond */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Arc de valeur */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 502.65} 502.65`}
            transform="rotate(0 100 80)"
          />
        </svg>
        {/* Aiguille */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          <div className="w-1 h-16 bg-foreground rounded-full" />
        </div>
        {/* Valeur au centre */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-3xl font-bold">{value.toFixed(2)}</div>
          {stream.unit && (
            <div className="text-sm text-muted-foreground">{stream.unit}</div>
          )}
        </div>
      </div>
      {/* Min/Max */}
      {(min !== undefined || max !== undefined) && (
        <div className="flex justify-between w-48 mt-2 text-xs text-muted-foreground">
          <span>{min?.toFixed(0) || '?'}</span>
          <span>{max?.toFixed(0) || '?'}</span>
        </div>
      )}
    </div>
  )
}

