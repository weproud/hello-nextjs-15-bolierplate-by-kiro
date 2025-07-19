'use client'

import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import {
  uploadFile,
  batchDeleteItems,
  searchItems,
  subscribeNewsletter,
} from '@/lib/actions/form-actions'

import {
  fileUploadFormSchema,
  type FileUploadFormInput,
  batchDeleteFormSchema,
  type BatchDeleteFormInput,
  newsletterFormSchema,
  type NewsletterFormInput,
  searchFormSchema,
  type SearchFormInput,
} from '@/lib/validations/component-schemas'

type FileUploadInput = FileUploadFormInput

export function FileUploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FileUploadInput>({
    resolver: zodResolver(fileUploadFormSchema),
  })

  const { execute, status, result } = useAction(uploadFile, {
    onExecute: () => {
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)
    },
    onSuccess: data => {
      setUploadProgress(100)
      toast.success('파일이 성공적으로 업로드되었습니다!')
      console.log('File uploaded:', data)
      reset()
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: error => {
      setUploadProgress(0)
      toast.error(error.error.serverError || '파일 업로드에 실패했습니다.')
      console.error('File upload failed:', error)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValue('file', file)
    }
  }

  const onSubmit = (data: FileUploadInput) => {
    execute(data)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>파일 업로드</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">파일 선택</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={status === 'executing'}
              accept="image/*,.pdf,.doc,.docx"
            />
            {selectedFile && (
              <div className="text-sm text-gray-600">
                선택된 파일: {selectedFile.name} (
                {Math.round(selectedFile.size / 1024)}KB)
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  disabled={status === 'executing'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avatar">프로필 이미지</SelectItem>
                    <SelectItem value="document">문서</SelectItem>
                    <SelectItem value="image">일반 이미지</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {status === 'executing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>업로드 중...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === 'executing' || !selectedFile}
          >
            {status === 'executing' ? '업로드 중...' : '파일 업로드'}
          </Button>

          {result?.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">업로드 완료!</p>
              <p className="text-sm text-green-600">
                파일 ID: {result.data.id}
              </p>
              <p className="text-sm text-green-600">URL: {result.data.url}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Batch Delete Form
type BatchDeleteInput = BatchDeleteFormInput

export function BatchDeleteForm() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const mockItems = [
    { id: '1', name: 'Project Alpha', type: 'projects' },
    { id: '2', name: 'Design Document', type: 'files' },
    { id: '3', name: 'User Feedback', type: 'comments' },
    { id: '4', name: 'Project Beta', type: 'projects' },
    { id: '5', name: 'Meeting Notes', type: 'files' },
  ]

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchDeleteInput>({
    resolver: zodResolver(batchDeleteFormSchema),
  })

  const { execute, status, result } = useAction(batchDeleteItems, {
    onSuccess: data => {
      toast.success(`${data.successCount}개 항목이 삭제되었습니다.`)
      if (data.failedCount > 0) {
        toast.warning(`${data.failedCount}개 항목 삭제에 실패했습니다.`)
      }
      console.log('Batch delete result:', data)
      setSelectedItems([])
      reset()
    },
    onError: error => {
      toast.error(error.error.serverError || '일괄 삭제에 실패했습니다.')
      console.error('Batch delete failed:', error)
    },
  })

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const onSubmit = (data: BatchDeleteInput) => {
    execute({
      ids: selectedItems,
      type: data.type,
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>일괄 삭제</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>삭제할 항목 선택</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {mockItems.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                    disabled={status === 'executing'}
                  />
                  <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                    {item.name}
                  </Label>
                  <Badge variant="secondary">{item.type}</Badge>
                </div>
              ))}
            </div>
            {selectedItems.length === 0 && (
              <p className="text-sm text-red-500">
                삭제할 항목을 선택해주세요.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">항목 유형</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  disabled={status === 'executing'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="projects">프로젝트</SelectItem>
                    <SelectItem value="files">파일</SelectItem>
                    <SelectItem value="comments">댓글</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={status === 'executing' || selectedItems.length === 0}
            variant="destructive"
          >
            {status === 'executing'
              ? '삭제 중...'
              : `${selectedItems.length}개 항목 삭제`}
          </Button>

          {result?.data && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium">삭제 완료</p>
              <p className="text-sm text-blue-600">
                성공: {result.data.successCount}개
              </p>
              {result.data.failedCount > 0 && (
                <p className="text-sm text-red-600">
                  실패: {result.data.failedCount}개
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Search Form
type SearchInput = SearchFormInput

export function SearchForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchInput>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      sortBy: 'relevance',
    },
  })

  const { execute, status, result } = useAction(searchItems, {
    onSuccess: data => {
      toast.success(`${data.items.length}개의 검색 결과를 찾았습니다.`)
      console.log('Search results:', data)
    },
    onError: error => {
      toast.error(error.error.serverError || '검색에 실패했습니다.')
      console.error('Search failed:', error)
    },
  })

  const onSubmit = (data: SearchInput) => {
    execute({
      query: data.query,
      filters: {
        category: data.category,
        sortBy: data.sortBy,
        sortOrder: 'desc',
      },
      page: 1,
      limit: 10,
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>고급 검색</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">검색어</Label>
              <Input
                id="query"
                {...register('query')}
                placeholder="검색어를 입력하세요"
                disabled={status === 'executing'}
              />
              {errors.query && (
                <p className="text-sm text-red-500">{errors.query.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="카테고리 (선택사항)"
                disabled={status === 'executing'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">정렬 기준</Label>
              <Controller
                name="sortBy"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={status === 'executing'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">관련성</SelectItem>
                      <SelectItem value="date">날짜</SelectItem>
                      <SelectItem value="name">이름</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={status === 'executing'}
          >
            {status === 'executing' ? '검색 중...' : '검색'}
          </Button>

          {result?.data && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">검색 결과</h3>
                <Badge variant="outline">
                  {result.data.items.length}개 결과 (
                  {result.data.searchTime.toFixed(0)}ms)
                </Badge>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {result.data.items.map(item => (
                  <div key={item.id} className="p-3 border rounded-md">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="text-xs text-gray-500">
                        {item.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  페이지 {result.data.pagination.page} /{' '}
                  {result.data.pagination.totalPages}
                  (총 {result.data.pagination.total}개)
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Newsletter Subscription Form
type NewsletterInput = NewsletterFormInput

export function NewsletterForm() {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterFormSchema),
  })

  const { execute, status, result } = useAction(subscribeNewsletter, {
    onSuccess: data => {
      toast.success(data.message)
      console.log('Newsletter subscription:', data)
      reset()
      setSelectedPreferences([])
    },
    onError: error => {
      toast.error(error.error.serverError || '뉴스레터 구독에 실패했습니다.')
      console.error('Newsletter subscription failed:', error)
    },
  })

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    )
  }

  const onSubmit = (data: NewsletterInput) => {
    execute({
      ...data,
      preferences: selectedPreferences as NewsletterInput['preferences'],
    })
  }

  const preferenceOptions = [
    { value: 'tech', label: '기술' },
    { value: 'design', label: '디자인' },
    { value: 'business', label: '비즈니스' },
    { value: 'marketing', label: '마케팅' },
  ]

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>뉴스레터 구독</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="이메일 주소를 입력하세요"
              disabled={status === 'executing'}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>관심사</Label>
            <div className="grid grid-cols-2 gap-2">
              {preferenceOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedPreferences.includes(option.value)}
                    onCheckedChange={() => handlePreferenceToggle(option.value)}
                    disabled={status === 'executing'}
                  />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedPreferences.length === 0 && (
              <p className="text-sm text-red-500">
                최소 하나의 관심사를 선택해주세요.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">수신 빈도</Label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  disabled={status === 'executing'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="수신 빈도를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">매일</SelectItem>
                    <SelectItem value="weekly">매주</SelectItem>
                    <SelectItem value="monthly">매월</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.frequency && (
              <p className="text-sm text-red-500">{errors.frequency.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              status === 'executing' || selectedPreferences.length === 0
            }
          >
            {status === 'executing' ? '구독 중...' : '뉴스레터 구독'}
          </Button>

          {result?.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{result.data.message}</p>
              <p className="text-sm text-green-600">
                구독 ID: {result.data.subscriptionId}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Combined Advanced Examples Component
export function AdvancedSafeActionExamples() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Advanced Next Safe Action Examples
        </h1>
        <p className="text-gray-600">
          파일 업로드, 일괄 작업, 검색, 뉴스레터 구독 등 고급 기능을 포함한
          next-safe-action 예제들
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FileUploadForm />
        <BatchDeleteForm />
        <SearchForm />
        <NewsletterForm />
      </div>

      <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-md">
        <h3 className="font-semibold text-purple-800 mb-2">고급 기능:</h3>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• 파일 업로드 with 진행률 표시 및 파일 타입 검증</li>
          <li>• 일괄 삭제 with 선택적 항목 처리</li>
          <li>• 고급 검색 with 필터링 및 정렬</li>
          <li>• 뉴스레터 구독 with 다중 선택 및 검증</li>
          <li>• 실시간 상태 업데이트 및 에러 처리</li>
          <li>• 사용자 친화적인 피드백 시스템</li>
        </ul>
      </div>
    </div>
  )
}
