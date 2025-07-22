'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ProjectForm } from '@/components/forms/project-form'
import {
  deleteProjectAction,
  getProjectAction,
} from '@/lib/actions/project-actions'
import { toast } from 'sonner'
import {
  X,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Plus,
  Settings,
  ExternalLink,
  Loader2,
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

interface ProjectDetailModalProps {
  params: Promise<{ id: string }>
  onClose: () => void
  onFallbackToFullPage: () => void
}

export function ProjectDetailModal({
  params: paramsPromise,
  onClose,
  onFallbackToFullPage,
}: ProjectDetailModalProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        const params = await paramsPromise
        const result = await getProjectAction({ id: params.id })

        if (!result?.data?.success || !result.data.project) {
          throw new Error('프로젝트를 찾을 수 없습니다.')
        }

        setProject(result.data.project)
        // User info is included in the project data
        setUser({
          id: result.data.project.user.id,
          name: result.data.project.user.name,
          email: result.data.project.user.email,
        })
      } catch (err) {
        console.error('Failed to load project:', err)
        setError(
          err instanceof Error
            ? err.message
            : '프로젝트를 불러오는 중 오류가 발생했습니다.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [paramsPromise])

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    // Reload project data
    window.location.reload()
  }

  const handleDelete = async () => {
    if (
      !project ||
      !confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?`)
    ) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteProjectAction({ id: project.id })

      if (result?.data?.success) {
        toast.success('프로젝트가 삭제되었습니다.')
        onClose()
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

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-background rounded-lg p-6 shadow-lg border max-w-md w-full mx-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-foreground">
              프로젝트 정보를 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !project || !user) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-lg border max-w-md w-full">
          <div className="p-6 text-center">
            <div className="text-destructive mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {error || '프로젝트를 불러올 수 없습니다'}
            </h3>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                닫기
              </Button>
              <Button onClick={onFallbackToFullPage} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                전체 페이지에서 보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg border max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                <span>{project.user.name || project.user.email}</span>
                <span>•</span>
                <Calendar className="h-3 w-3" />
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onFallbackToFullPage}
              title="전체 페이지에서 보기"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    프로젝트 설명
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      프로젝트 설명이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">생성일</span>
                    <span className="font-medium">
                      {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최종 수정</span>
                    <span className="font-medium">
                      {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">소유자</span>
                    <span className="font-medium truncate">
                      {project.user.name || project.user.email}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    프로젝트 수정
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    단계 추가
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? '삭제 중...' : '프로젝트 삭제'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>프로젝트 수정</DialogTitle>
              <DialogDescription>프로젝트 정보를 수정하세요.</DialogDescription>
            </DialogHeader>
            <ProjectForm
              mode="edit"
              initialData={project}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
