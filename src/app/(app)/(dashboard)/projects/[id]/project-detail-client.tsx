'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { ProjectForm } from '@/components/forms/project-form'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
import { deleteProjectAction } from '@/lib/actions/project-actions'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Plus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

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

interface ProjectDetailClientProps {
  project: Project
  user: User
}

export function ProjectDetailClient({
  project,
  user,
}: ProjectDetailClientProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    window.location.reload()
  }

  const handleCreateSuccess = (newProject?: any) => {
    setIsCreateDialogOpen(false)
    if (newProject) {
      // 새로 생성된 프로젝트 상세 페이지로 이동
      router.push(`/projects/${newProject.id}`)
    } else {
      // 프로젝트 목록 페이지로 이동
      router.push('/projects')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?`)) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteProjectAction({ id: project.id })

      if (result?.data?.success) {
        toast.success('프로젝트가 삭제되었습니다.')
        router.push('/projects')
      } else {
        throw new Error(
          result?.data?.message || '프로젝트 삭제에 실패했습니다.'
        )
      }
    } catch (error) {
      console.error('Delete project error:', error)
      toast.error(
        error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='relative'>
      {isDeleting && (
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='flex items-center space-x-3'>
            <div className='w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin' />
            <span>프로젝트 삭제 중...</span>
          </div>
        </div>
      )}
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/projects'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                프로젝트 목록
              </Button>
            </Link>
            <div>
              <h1 className='text-3xl font-bold'>{project.title}</h1>
              <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                <User className='h-3 w-3' />
                <span>{project.user.name || project.user.email}</span>
                <span>•</span>
                <Calendar className='h-3 w-3' />
                <span>
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                    locale: ko,
                  })}{' '}
                  업데이트
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(true)}
              disabled={isDeleting}
            >
              <Edit className='mr-2 h-4 w-4' />
              수정
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>

        {/* Project Info */}
        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  프로젝트 설명
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.description ? (
                  <p className='text-muted-foreground whitespace-pre-wrap'>
                    {project.description}
                  </p>
                ) : (
                  <p className='text-muted-foreground italic'>
                    프로젝트 설명이 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 정보</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>생성일</span>
                  <span className='font-medium'>
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>최종 수정</span>
                  <span className='font-medium'>
                    {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>소유자</span>
                  <span className='font-medium truncate'>
                    {project.user.name || project.user.email}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
          <ProjectForm
            mode='edit'
            initialData={project}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
            showCard={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
