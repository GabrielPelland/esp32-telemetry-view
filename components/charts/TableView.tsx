'use client'

import { useMemo } from 'react'
import { DataStream } from '@/store/configStore'
import { DataPoint } from '@/store/dataStore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TableViewProps {
  stream: DataStream
  data: DataPoint[]
}

export default function TableView({ stream, data }: TableViewProps) {
  const tableData = useMemo(() => {
    // Prendre les 20 derniers points
    return data.slice(-20).reverse()
  }, [data])

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card z-10 border-b">
          <tr>
            <th className="text-left p-2 font-medium text-xs">Heure</th>
            <th className="text-right p-2 font-medium text-xs">Valeur</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((point, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              <td className="p-1.5 text-muted-foreground text-xs">
                {format(new Date(point.timestamp), 'HH:mm:ss', { locale: fr })}
              </td>
              <td className="p-1.5 text-right font-medium text-xs">
                {point.value.toFixed(2)}
                {stream.unit && <span className="ml-1 text-muted-foreground">{stream.unit}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tableData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Aucune donnée disponible
        </div>
      )}
    </div>
  )
}

