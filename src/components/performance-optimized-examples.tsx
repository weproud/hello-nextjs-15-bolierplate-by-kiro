'use client'

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  lazy,
  Suspense,
} from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDebounce,
  useThrottle,
  useMemoizedCalculation,
  useRenderCount,
  PerformanceTracker,
} from '@/lib/performance-utils'

// Loading skeletons for heavy components
function TodoListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-16" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border rounded">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CounterSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Skeleton className="h-12 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}

function ScrollComponentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}

// 성능 최적화된 검색 컴포넌트
const OptimizedSearchComponent = memo(function OptimizedSearchComponent({
  onSearch,
  placeholder = '검색어를 입력하세요...',
}: {
  onSearch: (query: string) => void
  placeholder?: string
}) {
  useRenderCount('OptimizedSearchComponent')

  const [query, setQuery] = useState('')

  // 디바운스된 검색 함수 - 300ms 지연 후 실행
  const debouncedSearch = useDebounce(onSearch, 300)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      debouncedSearch(value)
    },
    [debouncedSearch]
  )

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full"
      />
      <p className="text-sm text-muted-foreground">
        검색어: {query || '(없음)'}
      </p>
    </div>
  )
})

// 성능 최적화된 카운터 컴포넌트
const OptimizedCounter = memo(function OptimizedCounter({
  initialValue = 0,
  step = 1,
}: {
  initialValue?: number
  step?: number
}) {
  useRenderCount('OptimizedCounter')

  const [count, setCount] = useState(initialValue)

  // 메모이제이션된 계산 - 복잡한 계산 결과를 캐시
  const expensiveCalculation = useMemoizedCalculation(() => {
    PerformanceTracker.start('fibonacci-calculation')

    // 피보나치 수열 계산 (성능 테스트용)
    const fibonacci = (n: number): number => {
      if (n <= 1) return n
      return fibonacci(n - 1) + fibonacci(n - 2)
    }

    const result = count > 0 ? fibonacci(Math.min(count, 35)) : 0
    PerformanceTracker.end('fibonacci-calculation')

    return result
  }, [count])

  // 안정적인 콜백 함수들
  const increment = useCallback(() => {
    setCount(prev => prev + step)
  }, [step])

  const decrement = useCallback(() => {
    setCount(prev => prev - step)
  }, [step])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  return (
    <Card>
      <CardHeader>
        <CardTitle>최적화된 카운터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{count}</div>
          <div className="text-sm text-muted-foreground">
            피보나치 값: {expensiveCalculation}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={decrement} variant="outline" size="sm">
            -{step}
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            리셋
          </Button>
          <Button onClick={increment} variant="outline" size="sm">
            +{step}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

// 성능 최적화된 리스트 아이템
const OptimizedListItem = memo(function OptimizedListItem({
  item,
  onToggle,
  onDelete,
}: {
  item: { id: string; text: string; completed: boolean }
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  useRenderCount(`OptimizedListItem-${item.id}`)

  const handleToggle = useCallback(() => {
    onToggle(item.id)
  }, [item.id, onToggle])

  const handleDelete = useCallback(() => {
    onDelete(item.id)
  }, [item.id, onDelete])

  return (
    <div className="flex items-center gap-2 p-2 border rounded">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={handleToggle}
        className="rounded"
      />
      <span
        className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
      >
        {item.text}
      </span>
      <Button onClick={handleDelete} variant="destructive" size="sm">
        삭제
      </Button>
    </div>
  )
})

// 성능 최적화된 할 일 목록
const OptimizedTodoList = memo(function OptimizedTodoList() {
  useRenderCount('OptimizedTodoList')

  const [todos, setTodos] = useState([
    { id: '1', text: '성능 최적화 학습하기', completed: false },
    { id: '2', text: 'React.memo 적용하기', completed: true },
    { id: '3', text: 'useMemo와 useCallback 사용하기', completed: false },
  ])

  const [newTodo, setNewTodo] = useState('')

  // 메모이제이션된 필터링된 목록들
  const completedTodos = useMemo(
    () => todos.filter(todo => todo.completed),
    [todos]
  )

  const pendingTodos = useMemo(
    () => todos.filter(todo => !todo.completed),
    [todos]
  )

  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: completedTodos.length,
      pending: pendingTodos.length,
      completionRate:
        todos.length > 0
          ? Math.round((completedTodos.length / todos.length) * 100)
          : 0,
    }),
    [todos.length, completedTodos.length, pendingTodos.length]
  )

  // 안정적인 콜백 함수들
  const addTodo = useCallback(() => {
    if (newTodo.trim()) {
      setTodos(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: newTodo.trim(),
          completed: false,
        },
      ])
      setNewTodo('')
    }
  }, [newTodo])

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewTodo(e.target.value)
    },
    []
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        addTodo()
      }
    },
    [addTodo]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>최적화된 할 일 목록</CardTitle>
        <div className="text-sm text-muted-foreground">
          전체: {stats.total} | 완료: {stats.completed} | 대기: {stats.pending}{' '}
          | 완료율: {stats.completionRate}%
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="새 할 일을 입력하세요..."
            className="flex-1"
          />
          <Button onClick={addTodo}>추가</Button>
        </div>

        <div className="space-y-2">
          {todos.map(todo => (
            <OptimizedListItem
              key={todo.id}
              item={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            할 일이 없습니다. 새로운 할 일을 추가해보세요!
          </div>
        )}
      </CardContent>
    </Card>
  )
})

// 스크롤 이벤트 최적화 예제
const OptimizedScrollComponent = memo(function OptimizedScrollComponent() {
  useRenderCount('OptimizedScrollComponent')

  const [scrollY, setScrollY] = useState(0)

  // 스로틀된 스크롤 핸들러 - 16ms(60fps)마다 실행
  const throttledScrollHandler = useThrottle(() => {
    setScrollY(window.scrollY)
  }, 16)

  React.useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler)
    return () => window.removeEventListener('scroll', throttledScrollHandler)
  }, [throttledScrollHandler])

  return (
    <Card>
      <CardHeader>
        <CardTitle>스크롤 최적화</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-2xl font-bold">{Math.round(scrollY)}px</div>
          <div className="text-sm text-muted-foreground">현재 스크롤 위치</div>
        </div>
      </CardContent>
    </Card>
  )
})

// Lazy load heavy components
const LazyOptimizedCounter = lazy(() =>
  Promise.resolve().then(() => ({ default: OptimizedCounter }))
)

const LazyOptimizedTodoList = lazy(() =>
  Promise.resolve().then(() => ({ default: OptimizedTodoList }))
)

const LazyOptimizedScrollComponent = lazy(() =>
  Promise.resolve().then(() => ({ default: OptimizedScrollComponent }))
)

// 메인 성능 최적화 예제 컴포넌트
export const PerformanceOptimizedExamples = memo(
  function PerformanceOptimizedExamples() {
    useRenderCount('PerformanceOptimizedExamples')

    const [searchResults, setSearchResults] = useState<string[]>([])

    const handleSearch = useCallback((query: string) => {
      // 실제 검색 로직 시뮬레이션
      const mockResults = query
        ? [
            `"${query}"에 대한 결과 1`,
            `"${query}"에 대한 결과 2`,
            `"${query}"에 대한 결과 3`,
          ]
        : []
      setSearchResults(mockResults)
    }, [])

    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">성능 최적화 예제</h1>
          <p className="text-muted-foreground">
            React.memo, useMemo, useCallback을 활용한 성능 최적화 데모
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>최적화된 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <OptimizedSearchComponent onSearch={handleSearch} />
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">검색 결과:</h4>
                  <ul className="space-y-1">
                    {searchResults.map((result, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Suspense fallback={<CounterSkeleton />}>
            <LazyOptimizedCounter initialValue={5} step={2} />
          </Suspense>

          <Suspense fallback={<ScrollComponentSkeleton />}>
            <LazyOptimizedScrollComponent />
          </Suspense>
        </div>

        <Suspense fallback={<TodoListSkeleton />}>
          <LazyOptimizedTodoList />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>성능 팁</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                • <strong>React.memo</strong>: props가 변경되지 않으면
                리렌더링을 방지
              </li>
              <li>
                • <strong>useMemo</strong>: 비용이 큰 계산 결과를 메모이제이션
              </li>
              <li>
                • <strong>useCallback</strong>: 함수 참조를 안정화하여 불필요한
                리렌더링 방지
              </li>
              <li>
                • <strong>useDebounce</strong>: 빈번한 이벤트 호출을 지연시켜
                성능 향상
              </li>
              <li>
                • <strong>useThrottle</strong>: 이벤트 호출 빈도를 제한하여 성능
                향상
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }
)
