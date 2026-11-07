import { Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-96 max-w-full" />
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
      </div>
    </div>
  )
}
