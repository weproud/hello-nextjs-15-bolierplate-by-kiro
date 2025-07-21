import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function NewPostLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Editor form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Content editor */}
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                {/* Editor toolbar */}
                <div className="border rounded-t-lg p-2 bg-muted/50">
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-8" />
                    ))}
                  </div>
                </div>
                {/* Editor content area */}
                <div className="border border-t-0 rounded-b-lg p-4 min-h-[400px]">
                  <Skeleton className="h-4 w-48 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post settings */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Category */}
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Tags */}
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Featured image */}
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-8 w-24 mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* SEO settings */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
