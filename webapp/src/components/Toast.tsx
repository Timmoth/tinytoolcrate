import { useEffect, useState } from 'react'

type Toast = {
  id: number
  message: string
}

let nextToastId = 0
const listeners = new Set<(toast: Toast) => void>()

export function showToast(message: string) {
  const toast = { id: nextToastId++, message }
  listeners.forEach((listener) => listener(toast))
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 2000)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return (
    <div
      data-testid="toaster"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
