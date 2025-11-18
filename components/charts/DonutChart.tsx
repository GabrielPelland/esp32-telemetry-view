'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { DataStream } from '@/store/configStore'
import { DataPoint } from '@/store/dataStore'
import { useConfigStore } from '@/store/configStore'

interface DonutChartProps {
  stream: DataStream
  data: DataPoint[]
}

export default function DonutChart({ stream, data }: DonutChartProps) {
  const { getESP32 } = useConfigStore()
  
  const chartData = useMemo(() => {
    if (data.length === 0) return []
    
    // Prendre les dernières valeurs et créer des segments
    const recentData = data.slice(-10)
    const latest = recentData[recentData.length - 1]?.value || 0
    const average = recentData.reduce((sum, p) => sum + p.value, 0) / recentData.length
    const min = stream.min !== undefined ? stream.min : Math.min(...recentData.map(p => p.value))
    const max = stream.max !== undefined ? stream.max : Math.max(...recentData.map(p => p.value))
    
    // Calculer les pourcentages
    const range = max - min
    if (range === 0) {
      return [
        { name: 'Valeur', value: 100, color: getESP32(stream.esp32Id)?.color || '#3b82f6' }
      ]
    }
    
    const currentPercent = ((latest - min) / range) * 100
    const remainingPercent = 100 - currentPercent
    
    const esp32Color = getESP32(stream.esp32Id)?.color || '#3b82f6'
    
    return [
      { name: 'Actuel', value: currentPercent, color: esp32Color },
      { name: 'Restant', value: remainingPercent, color: '#e5e7eb' }
    ]
  }, [data, stream, getESP32])

  const esp32Color = useMemo(() => {
    const esp32 = getESP32(stream.esp32Id)
    return esp32?.color || '#3b82f6'
  }, [stream.esp32Id, getESP32])

  const latestValue = data.length > 0 ? data[data.length - 1]?.value : 0

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Aucune donnée
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center py-2">
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value: any) => `${Number(value).toFixed(1)}%`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-1">
        <div className="text-xl font-bold" style={{ color: esp32Color }}>
          {latestValue.toFixed(stream.unit === '%' ? 1 : 2)}
          {stream.unit && <span className="text-sm font-normal ml-1">{stream.unit}</span>}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate px-2">{stream.nickname}</div>
      </div>
    </div>
  )
}

