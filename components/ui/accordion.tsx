'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  value: string
  children: React.ReactNode
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContext = React.createContext<{
  openItems: Set<string>
  toggleItem: (value: string) => void
}>({
  openItems: new Set(),
  toggleItem: () => {},
})

export function Accordion({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    defaultValue ? new Set([defaultValue]) : new Set()
  )

  const toggleItem = React.useCallback((value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }, [])

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="space-y-2">{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  const { openItems, toggleItem } = React.useContext(AccordionContext)
  const isOpen = openItems.has(value)

  return (
    <div className="border rounded-lg overflow-hidden">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionTrigger) {
            return React.cloneElement(child, { value, isOpen, toggleItem } as any)
          }
          if (child.type === AccordionContent) {
            return React.cloneElement(child, { isOpen } as any)
          }
        }
        return child
      })}
    </div>
  )
}

export function AccordionTrigger({ children, className, value, isOpen, toggleItem }: AccordionTriggerProps & { value?: string; isOpen?: boolean; toggleItem?: (value: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => value && toggleItem?.(value)}
      className={cn(
        'flex w-full items-center justify-between p-3 text-sm font-medium transition-all hover:bg-muted/50',
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn('h-4 w-4 transition-transform', isOpen && 'transform rotate-180')}
      />
    </button>
  )
}

export function AccordionContent({ children, className, isOpen }: AccordionContentProps & { isOpen?: boolean }) {
  return (
    <div
      className={cn(
        'overflow-hidden transition-all',
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        className
      )}
    >
      <div className="p-3 pt-0">{children}</div>
    </div>
  )
}

