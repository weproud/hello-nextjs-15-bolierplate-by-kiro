'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Calendar,
  User,
  FolderOpen,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  createProjectAction as createProject,
  updateProjectAction as updateProject,
  deleteProjectAction as deleteProject,
  getUserProjectsAction as getProjects,
} from '@/lib/actions/project-actions'

// Form schemas
const createProjectSchema = z.object({
  title: z.string().min(1, '프로젝트 제목을 입력해주세요.').max(255),
  description: z.string().max(1000).optional(),
})

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, '프로젝트 제목을 입력해주세요.').max(255),
  description: z.string().max(1000).optional(),
})

// Type definitions
type CreateProjectInput = z.infer<typeof createProjectSchema>
type UpdateProjectInput = z.infer<typeof updateProjectSchema>

// Project Creation Form
function ProjectCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  })

  const { execute, status } = useAction(createProject, {
    onSuccess: data => {
      toast.success(data.data.message)
      reset()
      setIsOpen(false)
      onSuccess?.()
    },
    onError: error => {
      toast.error(error.error.serverError || '프로젝트 생성에 실패했습니다.')
    },
  })

  const onSubmit = (data: CreateProjectInput) => {
    execute(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />새 프로젝트
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 프로젝트 생성</DialogTitle>
          <DialogDescription>
            새로운 프로젝트를 생성하여 작업을 시작하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">프로젝트 제목</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="프로젝트 제목을 입력하세요"
              disabled={status === 'executing'}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">프로젝트 설명 (선택사항)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
              disabled={status === 'executing'}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={status === 'executing'}
            >
              취소
            </Button>
            <Button type="submit" disabled={status === 'executing'}>
              {status === 'executing' ? '생성 중...' : '프로젝트 생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Project Edit Form
function ProjectEditForm({
  project,
  onSuccess,
}: {
  project: any
  onSuccess?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      id: project.id,
      title: project.title,
      description: project.description || '',
    },
  })

  const { execute, status } = useAction(updateProject, {
    onSuccess: data => {
      toast.success(data.data.message)
      setIsOpen(false)
      onSuccess?.()
    },
    onError: error => {
      toast.error(error.error.serverError || '프로젝트 수정에 실패했습니다.')
    },
  })

  const onSubmit = (data: UpdateProjectInput) => {
    execute(data)
  }

  useEffect(() => {
    if (isOpen) {
      reset({
        id: project.id,
        title: project.title,
        description: project.description || '',
      })
    }
  }, [isOpen, project, reset])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <Edit className="h-4 w-4 mr-2" />
          수정
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로젝트 수정</DialogTitle>
          <DialogDescription>프로젝트 정보를 수정하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">프로젝트 제목</Label>
            <Input
              id="title"
              {...register('title')}
              disabled={status === 'executing'}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">프로젝트 설명</Label>
            <Textarea
              id="description"
              {...register('description')}
              disabled={status === 'executing'}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={status === 'executing'}
            >
              취소
            </Button>
            <Button type="submit" disabled={status === 'executing'}>
              {status === 'executing' ? '수정 중...' : '프로젝트 수정'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Project Delete Confirmation
function ProjectDeleteDialog({
  project,
  onSuccess,
}: {
  project: any
  onSuccess?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const { execute, status } = useAction(deleteProject, {
    onSuccess: data => {
      toast.success(data.data.message)
      setIsOpen(false)
      onSuccess?.()
    },
    onError: error => {
      toast.error(error.error.serverError || '프로젝트 삭제에 실패했습니다.')
    },
  })

  const handleDelete = () => {
    execute({ id: project.id })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={e => {
          e.preventDefault()
          setIsOpen(true)
        }}
        className="text-red-600"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        삭제
      </DropdownMenuItem>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            "{project.title}" 프로젝트를 정말 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없으며, 모든 관련 데이터가 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === 'executing'}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={status === 'executing'}
            className="bg-red-600 hover:bg-red-700"
          >
            {status === 'executing' ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Project Card Component
function ProjectCard({
  project,
  onRefresh,
}: {
  project: any
  onRefresh: () => void
}) {
  // Duplicate functionality temporarily disabled - not implemented in actions
  const handleDuplicate = () => {
    toast.info('복사 기능은 준비 중입니다.')
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {project.title}
            </CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ProjectEditForm project={project} onSuccess={onRefresh} />
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                복사
              </DropdownMenuItem>
              <ProjectDeleteDialog project={project} onSuccess={onRefresh} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-1" />
              {project._count.phases}개 단계
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge variant="secondary">
            {project.user.name || project.user.email}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Project Statistics Dashboard - Simplified version without stats action
function ProjectStatsDashboard() {
  // Temporarily disabled - stats action not implemented
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                총 프로젝트
              </p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                총 단계
              </p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                평균 단계/프로젝트
              </p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Plus className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                이번 달
              </p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Project CRUD Component
export function ProjectCrudExamples() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>(
    'createdAt'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  const { execute, status, result } = useAction(getProjects, {
    onError: error => {
      toast.error(error.error.serverError || '프로젝트 조회에 실패했습니다.')
    },
  })

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    execute({
      limit: 12,
      offset: 0,
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    execute({
      limit: 12,
      offset: (page - 1) * 12,
    })
  }

  useEffect(() => {
    execute({
      limit: 12,
      offset: (currentPage - 1) * 12,
    })
  }, [execute, currentPage, refreshKey])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">프로젝트 관리</h1>
        <p className="text-gray-600">
          next-safe-action을 사용한 완전한 CRUD 작업 예제
        </p>
      </div>

      {/* Statistics Dashboard */}
      <ProjectStatsDashboard />

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={status === 'executing'}>
            검색
          </Button>
        </div>

        <div className="flex gap-2">
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">생성일</SelectItem>
              <SelectItem value="updatedAt">수정일</SelectItem>
              <SelectItem value="title">제목</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value: any) => setSortOrder(value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">내림차순</SelectItem>
              <SelectItem value="asc">오름차순</SelectItem>
            </SelectContent>
          </Select>

          <ProjectCreateForm onSuccess={handleRefresh} />
        </div>
      </div>

      {/* Projects Grid */}
      {status === 'executing' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : result?.data?.projects?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.projects.map((project: any) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRefresh={handleRefresh}
              />
            ))}
          </div>

          {/* Pagination */}
          {result.data.pagination.hasMore && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              <span className="px-4 py-2 text-sm text-muted-foreground">
                페이지 {currentPage}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!result.data.pagination.hasMore}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mt-4">
            총 {result.data.pagination.total}개 프로젝트 중{' '}
            {result.data.pagination.offset + 1}-
            {Math.min(
              result.data.pagination.offset + result.data.pagination.limit,
              result.data.pagination.total
            )}
            개 표시
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            프로젝트가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? '검색 결과가 없습니다.'
              : '첫 번째 프로젝트를 생성해보세요.'}
          </p>
          {!searchQuery && <ProjectCreateForm onSuccess={handleRefresh} />}
        </div>
      )}
    </div>
  )
}
