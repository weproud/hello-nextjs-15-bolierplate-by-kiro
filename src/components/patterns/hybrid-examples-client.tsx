'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
}

interface Project {
  id: string
  title: string
  updatedAt: Date
}

interface Post {
  id: string
  title: string
  published: boolean
}

interface HybridExamplesClientProps {
  user?: User
  projects?: Project[]
  posts?: Post[]
  featureFlag?: string
  hasPermission?: boolean
  enhanceForm?: boolean
  defaultValues?: Record<string, string>
  streamingData?: boolean
  initialData?: any[]
}

/**
 * Client Component - Dynamic interactions for hybrid patterns
 * 하이브리드 패턴의 동적 상호작용을 담당하는 클라이언트 컴포넌트
 */
export function HybridExamplesClient({
  user,
  projects = [],
  posts = [],
  featureFlag,
  hasPermission,
  enhanceForm,
  defaultValues,
  streamingData,
  initialData = [],
}: HybridExamplesClientProps) {
  const [activeTab, setActiveTab] = useState('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState(defaultValues || {})
  const [streamData, setStreamData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)

  // Example 1: User Dashboard with dynamic interactions
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    return projects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [posts, searchQuery])

  // Example 2: Form enhancement
  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  // Example 3: Feature flag handling
  const handleFeatureAction = useCallback(() => {
    if (!hasPermission) {
      toast.error('권한이 없습니다.')
      return
    }

    toast.success(`${featureFlag} 기능이 실행되었습니다!`)
  }, [featureFlag, hasPermission])

  // Example 4: Streaming data simulation
  useEffect(() => {
    if (!streamingData) return

    const interval = setInterval(() => {
      setStreamData(prev => [
        {
          id: Date.now().toString(),
          title: `새 프로젝트 ${new Date().toLocaleTimeString()}`,
          updatedAt: new Date(),
        },
        ...prev.slice(0, 9), // Keep only 10 items
      ])
    }, 5000) // Add new item every 5 seconds

    return () => clearInterval(interval)
  }, [streamingData])

  // Render different content based on props
  if (streamingData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            총 {streamData.length}개 항목
          </span>
          <Badge variant="outline" className="animate-pulse">
            실시간 업데이트
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {streamData.map((item, index) => (
            <Card
              key={item.id}
              className={index === 0 ? 'ring-2 ring-blue-500' : ''}
            >
              <CardContent className="p-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.updatedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (enhanceForm) {
    return (
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">실시간 검증</h3>

        {formData.email && (
          <div className="text-xs">
            이메일 형식:{' '}
            {validateEmail(formData.email) ? (
              <span className="text-green-600">✓ 올바름</span>
            ) : (
              <span className="text-red-600">✗ 잘못됨</span>
            )}
          </div>
        )}

        {formData.message && (
          <div className="text-xs mt-1">
            메시지 길이: {formData.message.length}/500자
          </div>
        )}

        <div className="mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFormData({})
              toast.success('폼이 초기화되었습니다.')
            }}
          >
            초기화
          </Button>
        </div>
      </div>
    )
  }

  if (featureFlag) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-4">{featureFlag} 기능</h3>
        <p className="text-muted-foreground mb-4">
          이 기능은 클라이언트에서 동적으로 로드되었습니다.
        </p>
        <Button onClick={handleFeatureAction}>기능 실행</Button>
      </div>
    )
  }

  // Default: User dashboard
  return (
    <div className="space-y-6">
      {/* Search functionality */}
      <div className="relative">
        <Input
          placeholder="프로젝트나 게시글 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          🔍
        </div>
      </div>

      {/* Tabbed content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">
            프로젝트 ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="posts">
            게시글 ({filteredPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProjects.map(project => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{project.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      업데이트:{' '}
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPosts.map(post => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium mb-2">{post.title}</h3>
                      <Badge variant={post.published ? 'default' : 'secondary'}>
                        {post.published ? '게시됨' : '초안'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchQuery('')
            toast.success('검색이 초기화되었습니다.')
          }}
        >
          검색 초기화
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActiveTab(activeTab === 'projects' ? 'posts' : 'projects')
          }}
        >
          탭 전환
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.info(`현재 ${user?.name || '사용자'}님이 로그인 중입니다.`)
          }}
        >
          사용자 정보
        </Button>
      </div>
    </div>
  )
}
