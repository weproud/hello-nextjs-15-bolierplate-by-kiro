'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
interface User {
  id: string
  name: string | null
  email: string
}

interface ProjectsPageClientProps {
  user: User
}

export function ProjectsPageClient({ user }: ProjectsPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()

  const handleCreateSuccess = (newProject?: any) => {
    setIsCreateModalOpen(false)
    if (newProject) {
      // 새로 생성된 프로젝트 상세 페이지로 이동
      router.push(`/projects/${newProject.id}`)
    } else {
      // 페이지를 새로고침하여 서버 데이터도 동기화
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">프로젝트</h1>
          <p className="text-muted-foreground">
            {user?.name || user?.email}님의 프로젝트를 관리하고 추적하세요.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />새 프로젝트
        </Button>
      </div>

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
