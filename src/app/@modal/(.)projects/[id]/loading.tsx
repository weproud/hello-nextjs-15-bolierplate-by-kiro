export default function ProjectModalLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg border max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header Skeleton */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="w-48 h-6 bg-muted rounded animate-pulse" />
              <div className="w-32 h-4 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="w-6 h-6 bg-muted rounded animate-pulse" />
        </div>

        {/* Modal Content Skeleton */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <div className="border rounded-lg p-6">
                <div className="w-32 h-5 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-1/2 h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>

              {/* Phases Card */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-40 h-5 bg-muted rounded animate-pulse" />
                  <div className="w-20 h-8 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-muted rounded animate-pulse" />
                        <div className="flex gap-2">
                          <div className="w-16 h-5 bg-muted rounded animate-pulse" />
                          <div className="w-24 h-5 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info Card */}
              <div className="border rounded-lg p-6">
                <div className="w-24 h-5 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between">
                      <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                      <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="border rounded-lg p-6">
                <div className="w-20 h-5 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="w-full h-9 bg-muted rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
