import { Skeleton } from '@/components/ui'

// Se muestra mientras se resuelven los params de la ruta dinámica
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-64 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    </div>
  )
}
