import { ProtectedRoute } from '@/components/auth/protected-route'
import { NavigationHeader } from '@/components/auth/navigation-header'
import { ProjectForm } from '@/components/forms/project-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  프로젝트 목록
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">새 프로젝트 만들기</h1>
                <p className="text-muted-foreground">
                  새로운 프로젝트를 만들어 목표를 체계적으로 관리해보세요.
                </p>
              </div>
            </div>

            {/* Project Form */}
            <div className="max-w-2xl mx-auto">
              <ProjectForm mode="create" />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
