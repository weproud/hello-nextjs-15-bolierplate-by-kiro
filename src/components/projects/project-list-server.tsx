import { ProjectListClient } from '@/components/projects/project-list-client'

interface Project {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface ProjectListServerProps {
  projects: Project[]
  searchParams?: { search?: string; status?: string }
}

/**
 * Server Component - Project list with static layout and client interactions
 * 정적 레이아웃과 클라이언트 상호작용을 포함한 프로젝트 목록 서버 컴포넌트
 */
export function ProjectListServer({
  projects,
  searchParams,
}: ProjectListServerProps) {
  return (
    <div className='space-y-6'>
      {/* Dynamic project list - Client Component */}
      <ProjectListClient
        projects={projects}
        initialSearch={searchParams?.search}
      />
    </div>
  )
}
