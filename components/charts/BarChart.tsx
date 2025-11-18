'use client'

import { useMemo } from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DataStream } from '@/store/configStore'
import { DataPoint } from '@/store/dataStore'
import { useConfigStore } from '@/store/configStore'
import { format } from 'date-fns'

interface BarChartProps {
  stream: DataStream
  data: DataPoint[]
  compact?: boolean
}

export default function BarChart({ stream, data, compact = false }: BarChartProps) {
  const { getESP32 } = useConfigStore()
  
  const chartData = useMemo(() => {
    // Prendre les 20 derniers points pour les barres (moins en mode compact)
    const recentData = data.slice(compact ? -10 : -20)
    return recentData.map((point) => ({
      time: format(new Date(point.timestamp), compact ? 'HH:mm' : 'HH:mm:ss'),
      value: point.value,
      timestamp: point.timestamp,
    }))
  }, [data, compact])

  const esp32Color = useMemo(() => {
    const esp32 = getESP32(stream.esp32Id)
    return esp32?.color || '#3b82f6'
  }, [stream.esp32Id, getESP32])

  const margins = compact 
    ? { top: 5, right: 5, left: 0, bottom: 20 }
    : { top: 10, right: 10, left: 5, bottom: 50 }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart 
        data={chartData}
        margin={margins}
      >
        {!compact && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        {!compact && (
          <XAxis
            dataKey="time"
            className="text-xs"
            tick={{ fill: 'currentColor', fontSize: 10 }}
            interval="preserveStartEnd"
            angle={-30}
            textAnchor="end"
            height={40}
            tickMargin={3}
          />
        )}
        {!compact && (
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor', fontSize: 11 }}
            width={60}
            domain={stream.min !== undefined && stream.max !== undefined 
              ? [stream.min, stream.max] 
              : ['auto', 'auto']}
          />
        )}
        {!compact && (
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            labelFormatter={(label) => `Heure: ${label}`}
            formatter={(value: any) => [
              `${Number(value).toFixed(2)}${stream.unit || ''}`,
              stream.nickname,
            ]}
          />
        )}
        <Bar dataKey="value" fill={esp32Color} radius={compact ? [2, 2, 0, 0] : [4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

