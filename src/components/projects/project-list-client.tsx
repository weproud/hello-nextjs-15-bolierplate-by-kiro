'use client'

import { useState, memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { deleteProjectAction } from '@/lib/actions/project-actions'
import { toast } from 'sonner'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FolderOpen,
  Plus,
  Search,
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
  _count: {
    phases: number
  }
}

interface ProjectListClientProps {
  projects: Project[]
  initialSearch?: string
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
}

// ProjectCard 컴포넌트를 별도로 분리하여 최적화
const ProjectCard = memo(function ProjectCard({
  project,
  onEdit,
  onDelete,
  deletingId,
}: {
  project: Project
  onEdit?: (project: Project) => void
  onDelete: (project: Project) => Promise<void>
  deletingId: string | null
}) {
  const handleEditClick = useCallback(() => {
    onEdit?.(project)
  }, [onEdit, project])

  const handleDeleteClick = useCallback(() => {
    onDelete(project)
  }, [onDelete, project])

  const formattedDate = useMemo(
    () =>
      formatDistanceToNow(new Date(project.updatedAt), {
        addSuffix: true,
        locale: ko,
      }),
    [project.updatedAt]
  )

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-1">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">
                {project.user.name || project.user.email}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={deletingId === project.id}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  모달로 보기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  전체 페이지에서 보기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
                disabled={deletingId === project.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deletingId === project.id ? '삭제 중...' : '삭제'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {project.description && (
          <CardDescription className="line-clamp-3 mb-4">
            {project.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {project._count.phases}개 단계
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              프로젝트 보기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * Client Component - Interactive project list
 * 상호작용이 가능한 프로젝트 목록 클라이언트 컴포넌트
 */
export const ProjectListClient = memo(function ProjectListClient({
  projects: initialProjects,
  initialSearch = '',
  onEdit,
  onDelete,
}: ProjectListClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects

    const query = searchQuery.toLowerCase()
    return projects.filter(
      project =>
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  const handleDelete = useCallback(
    async (project: Project) => {
      if (!confirm(`"${project.title}" 프로젝트를 정말 삭제하시겠습니까?`)) {
        return
      }

      setDeletingId(project.id)

      try {
        const result = await deleteProjectAction({ id: project.id })

        if (result?.data?.success) {
          toast.success('프로젝트가 삭제되었습니다.')
          setProjects(prev => prev.filter(p => p.id !== project.id))
          onDelete?.(project.id)
        } else {
          throw new Error(
            result?.data?.message || '프로젝트 삭제에 실패했습니다.'
          )
        }
      } catch (error) {
        console.error('Delete project error:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : '삭제 중 오류가 발생했습니다.'
        )
      } finally {
        setDeletingId(null)
      }
    },
    [onDelete]
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const emptyState = useMemo(() => {
    if (filteredProjects.length !== 0) return null

    if (searchQuery.trim()) {
      return (
        <Card className="text-center py-16">
          <CardContent>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">검색 결과가 없습니다</CardTitle>
            <CardDescription className="mb-4">
              "{searchQuery}"에 대한 프로젝트를 찾을 수 없습니다.
            </CardDescription>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              검색 초기화
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="text-center py-16">
        <CardContent>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">아직 프로젝트가 없습니다</CardTitle>
          <CardDescription className="mb-4">
            첫 번째 프로젝트를 만들어 목표 달성을 시작해보세요!
          </CardDescription>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />첫 프로젝트 만들기
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }, [filteredProjects.length, searchQuery])

  const projectCards = useMemo(
    () =>
      filteredProjects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )),
    [filteredProjects, onEdit, handleDelete, deletingId]
  )

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="프로젝트 검색..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Project grid or empty state */}
      {emptyState || (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projectCards}
        </div>
      )}
    </div>
  )
})
