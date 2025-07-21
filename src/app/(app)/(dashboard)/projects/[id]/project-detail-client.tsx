'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { ProjectForm } from '@/components/forms/project-form'
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
  Settings,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useDataLoading, useComponentLoading } from '@/hooks/use-loading-state'
import { ServerLoadingWrapper } from '@/components/loading/server-client-coordination'
import { LoadingOverlay } from '@/components/ui/progress-indicators'

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
  phases: Array<{
    id: string
    title: string
    description: string | null
    order: number
    createdAt: Date
    updatedAt: Date
  }>
  _count: {
    phases: number
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
  const router = useRouter()

  // 통합 로딩 상태 관리
  const deleteLoading = useDataLoading(`delete-project-${project.id}`)
  const componentLoading = useComponentLoading(`project-detail-${project.id}`)

  // 컴포넌트 마운트 시 로딩 상태 설정 (Server에서 Client로 전환)
  useEffect(() => {
    componentLoading.setLoading(true)

    // 컴포넌트가 완전히 로드되면 로딩 해제
    const timer = setTimeout(() => {
      componentLoading.setLoading(false)
    }, 300)

    return () => {
      clearTimeout(timer)
      componentLoading.clearLoading()
    }
  }, [componentLoading])

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?`)) {
      return
    }

    deleteLoading.setLoading(true)

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
      deleteLoading.setLoading(false)
    }
  }

  return (
    <ServerLoadingWrapper
      loadingKey={`project-detail-${project.id}`}
      loadingType="component"
      isLoading={componentLoading.isLoading}
      message="프로젝트 상세 정보 로딩 중..."
    >
      <LoadingOverlay
        isLoading={deleteLoading.isLoading}
        message="프로젝트 삭제 중..."
      >
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    프로젝트 목록
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">{project.title}</h1>
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
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={deleteLoading.isLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading.isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteLoading.isLoading ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </div>

            {/* Project Info */}
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

                {/* Phases */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        프로젝트 단계 ({project._count.phases}개)
                      </CardTitle>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        단계 추가
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.phases.length > 0 ? (
                      <div className="space-y-4">
                        {project.phases.map((phase, index) => (
                          <div
                            key={phase.id}
                            className="flex items-start gap-4 p-4 border rounded-lg"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium">{phase.title}</h4>
                              {phase.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {phase.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  단계 {phase.order}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(phase.createdAt),
                                    {
                                      addSuffix: true,
                                      locale: ko,
                                    }
                                  )}{' '}
                                  생성
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          아직 프로젝트 단계가 없습니다.
                        </p>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />첫 번째 단계 추가
                        </Button>
                      </div>
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
                      <span className="text-muted-foreground">총 단계</span>
                      <span className="font-medium">
                        {project._count.phases}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">생성일</span>
                      <span className="font-medium">
                        {new Date(project.createdAt).toLocaleDateString(
                          'ko-KR'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">최종 수정</span>
                      <span className="font-medium">
                        {new Date(project.updatedAt).toLocaleDateString(
                          'ko-KR'
                        )}
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
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      보고서 생성
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
                <DialogDescription>
                  프로젝트 정보를 수정하세요.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                mode="edit"
                initialData={project}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </main>
      </LoadingOverlay>
    </ServerLoadingWrapper>
  )
}
