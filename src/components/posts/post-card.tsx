'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Calendar, User, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import type { PostCardProps } from '@/types'
import { cn } from '@/lib/utils'

// 텍스트 요약 유틸리티 함수
function createExcerpt(content: string, maxLength: number = 150): string {
  // HTML 태그 제거
  const textContent = content.replace(/<[^>]*>/g, '')

  if (textContent.length <= maxLength) {
    return textContent
  }

  return textContent.slice(0, maxLength).trim() + '...'
}

// 날짜 포맷팅 유틸리티 함수
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// 사용자 이름 또는 이메일에서 이니셜 생성
function getInitials(name: string, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export const PostCard = memo(function PostCard({
  post,
  className,
  showActions = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const excerpt = post.excerpt || createExcerpt(post.content)
  const authorName = post.author.name || post.author.email
  const authorInitials = getInitials(post.author.name || '', post.author.email)

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]',
        'border-border/50 hover:border-border',
        'bg-card/50 backdrop-blur-sm',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/posts/${post.id}`}
              className="block group-hover:text-primary transition-colors"
            >
              <CardTitle className="text-lg line-clamp-2 leading-tight">
                {post.title}
              </CardTitle>
            </Link>

            {excerpt && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                {excerpt}
              </p>
            )}
          </div>

          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(post.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(post.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.image} alt={authorName} />
                <AvatarFallback className="text-xs">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{authorName}</span>
            </div>

            {/* 작성일 */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.createdAt.toISOString()}>
                {formatDate(post.createdAt)}
              </time>
            </div>
          </div>

          {/* 게시 상태 배지 */}
          <div className="flex items-center gap-2">
            {post.published ? (
              <Badge variant="default" className="text-xs">
                게시됨
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                초안
              </Badge>
            )}
          </div>
        </div>

        {/* 읽기 링크 */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <Link
            href={`/posts/${post.id}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Eye className="h-4 w-4" />
            자세히 보기
          </Link>
        </div>
      </CardContent>
    </Card>
  )
})

PostCard.displayName = 'PostCard'
