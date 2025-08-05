'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronsUpDown, Plus, FolderKanban, Check, LogIn } from 'lucide-react'
import { useSession, signIn } from 'next-auth/react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { CreateProjectModal } from '@/components/projects/create-project-modal'

interface ProjectSwitcherProps {
  projects: Array<{
    id: string
    title: string
    description?: string | null
  }>
}

export function ProjectSwitcher({
  projects: initialProjects,
}: ProjectSwitcherProps) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [projects, setProjects] = React.useState(initialProjects)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // URL에서 현재 프로젝트 ID 가져오기
  const currentProjectId = params?.['id'] as string

  // 현재 활성 프로젝트 결정 (URL 기반)
  const activeProject = React.useMemo(() => {
    if (currentProjectId) {
      return projects.find(p => p.id === currentProjectId) || null
    }
    return projects.length > 0 ? projects[0] : null
  }, [projects, currentProjectId])

  // Update projects when initialProjects changes
  React.useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const handleProjectSelect = (project: (typeof projects)[0]) => {
    // 이미 선택된 프로젝트인 경우 아무것도 하지 않음
    if (currentProjectId === project.id) {
      return
    }

    // 프로젝트 상세 페이지로 이동
    router.push(`/projects/${project.id}`)
  }

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = (newProject?: any) => {
    setIsCreateModalOpen(false)

    // 새로운 프로젝트가 전달되면 즉시 목록에 추가하고 해당 프로젝트로 이동
    if (newProject) {
      const projectForSwitcher = {
        id: newProject.id,
        title: newProject.title,
        description: newProject.description,
      }
      setProjects(prev => [projectForSwitcher, ...prev])

      // 새로 생성된 프로젝트 상세 페이지로 이동
      router.push(`/projects/${newProject.id}`)
    } else {
      // 페이지를 새로고침하여 서버 데이터도 동기화
      router.refresh()
    }
  }

  // 로그인하지 않은 경우 로그인 안내 표시
  if (!session?.user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            onClick={() => signIn('google')}
          >
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-muted'>
              <LogIn className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>로그인 필요</span>
              <span className='truncate text-xs'>
                프로젝트를 보려면 로그인하세요
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // 프로젝트가 없는 경우 기본 상태 표시
  if (projects.length === 0) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <FolderKanban className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      프로젝트 없음
                    </span>
                    <span className='truncate text-xs'>
                      새 프로젝트를 만들어보세요
                    </span>
                  </div>
                  <ChevronsUpDown className='ml-auto' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                align='start'
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <DropdownMenuLabel className='text-xs text-muted-foreground'>
                  프로젝트
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className='gap-2 p-2'
                  onClick={handleCreateProject}
                >
                  <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                    <Plus className='size-4' />
                  </div>
                  <div className='font-medium text-muted-foreground'>
                    새 프로젝트 만들기
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <CreateProjectModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
      </>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <FolderKanban className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {activeProject?.title || '프로젝트 선택'}
                  </span>
                  <span className='truncate text-xs'>
                    {activeProject?.description || '설명 없음'}
                  </span>
                </div>
                <ChevronsUpDown className='ml-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-xs text-muted-foreground'>
                프로젝트
              </DropdownMenuLabel>
              {projects.map((project, index) => {
                const isActive = currentProjectId === project.id
                return (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className='gap-2 p-2'
                  >
                    <div className='flex size-6 items-center justify-center rounded-sm border'>
                      {isActive ? (
                        <Check className='size-4 shrink-0' />
                      ) : (
                        <FolderKanban className='size-4 shrink-0' />
                      )}
                    </div>
                    <div className='flex flex-col'>
                      <span
                        className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}
                      >
                        {project.title}
                      </span>
                      {project.description && (
                        <span className='text-xs text-muted-foreground truncate max-w-[150px]'>
                          {project.description}
                        </span>
                      )}
                    </div>
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-2 p-2'
                onClick={handleCreateProject}
              >
                <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                  <Plus className='size-4' />
                </div>
                <div className='font-medium text-muted-foreground'>
                  새 프로젝트 만들기
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
