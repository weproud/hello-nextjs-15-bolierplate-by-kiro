import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SignInModalLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <div className="absolute right-4 top-4">
            <Skeleton className="h-6 w-6" />
          </div>
          <div className="text-center">
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OAuth providers */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Skeleton className="h-px w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Email form */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Footer links */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
