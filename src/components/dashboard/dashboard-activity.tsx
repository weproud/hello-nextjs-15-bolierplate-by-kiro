import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  updatedAt: Date
}

interface Post {
  id: string
  title: string
  published: boolean
  updatedAt: Date
}

interface DashboardActivityProps {
  projects: Project[]
  posts: Post[]
}

export function DashboardActivity({ projects, posts }: DashboardActivityProps) {
  if (projects.length === 0 && posts.length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 프로젝트</CardTitle>
            <CardDescription>최근 업데이트된 프로젝트들입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {project.title}
                    </Link>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/projects">
                <Button variant="outline" size="sm" className="w-full">
                  모든 프로젝트 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 게시글</CardTitle>
            <CardDescription>최근 작성한 게시글들입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {post.published ? '게시됨' : '초안'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/posts">
                <Button variant="outline" size="sm" className="w-full">
                  모든 게시글 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
