'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ProjectList } from '@/components/projects/project-list'
import { ProjectForm } from '@/components/forms/project-form'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
import { Plus, FolderOpen, Clock, CheckCircle } from 'lucide-react'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent } from '@radix-ui/react-dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { DialogDescription } from '@radix-ui/react-dialog'
import { DialogDescription } from '@radix-ui/react-dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { DialogContent } from '@radix-ui/react-dialog'
import { Dialog } from '@radix-ui/react-dialog'

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

interface User {
  id: string
  name: string | null
  email: string
}

interface ProjectsPageClientProps {
  initialProjects: Project[]
  user: User
}

export function ProjectsPageClient({
  initialProjects,
  user,
}: ProjectsPageClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    // Refresh projects - in a real app, you might want to refetch or use optimistic updates
    window.location.reload()
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingProject(null)
    // Refresh projects
    window.location.reload()
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  const totalProjects = projects.length
  const activeProjects = projects.length // For now, all projects are considered active
  const completedProjects = 0 // We don't have status field yet
  const completionRate =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='space-y-8'>
        {/* Header Section */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold'>프로젝트</h1>
            <p className='text-muted-foreground'>
              {user?.name || user?.email}님의 프로젝트를 관리하세요
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />새 프로젝트
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <FolderOpen className='h-4 w-4 text-muted-foreground' />
                <div className='text-2xl font-bold'>{totalProjects}</div>
              </div>
              <p className='text-xs text-muted-foreground'>총 프로젝트</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <Clock className='h-4 w-4 text-blue-500' />
                <div className='text-2xl font-bold'>{activeProjects}</div>
              </div>
              <p className='text-xs text-muted-foreground'>진행 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <CheckCircle className='h-4 w-4 text-green-500' />
                <div className='text-2xl font-bold'>{completedProjects}</div>
              </div>
              <p className='text-xs text-muted-foreground'>완료됨</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='text-2xl font-bold'>{completionRate}%</div>
              <p className='text-xs text-muted-foreground'>완료율</p>
            </CardContent>
          </Card>
        </div>

        {/* Project List */}
        <ProjectList
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Quick Actions - Only show when there are projects */}
        {projects.length > 0 && (
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 템플릿</CardTitle>
                <CardDescription>
                  미리 준비된 템플릿으로 빠르게 시작하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    📚 개인 성장 프로젝트
                  </Button>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    💼 커리어 전환 프로젝트
                  </Button>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    🚀 사업 시작 프로젝트
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>
                  최근 프로젝트 활동 내역을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {projects.slice(0, 3).map(project => (
                    <div
                      key={project.id}
                      className='flex items-center justify-between p-2 bg-muted/50 rounded'
                    >
                      <span className='text-sm truncate'>{project.title}</span>
                      <span className='text-xs text-muted-foreground'>
                        {new Date(project.updatedAt).toLocaleDateString(
                          'ko-KR'
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
            <DialogDescription>프로젝트 정보를 수정하세요.</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              mode='edit'
              initialData={editingProject}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingProject(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
