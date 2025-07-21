import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AuthErrorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error details */}
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Help text */}
            <div className="text-center">
              <Skeleton className="h-4 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
