import { auth } from '@/auth'
import { HybridExamplesClient } from '@/components/patterns/hybrid-examples-client'
import { prisma } from '@/lib/prisma'
import { ReactNode, Suspense } from 'react'

/**
 * Example 1: Server-Client Boundary Pattern
 * 서버-클라이언트 경계 패턴 예제
 */
export async function UserDashboardHybrid() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className='text-center py-8'>
        <h2 className='text-xl font-semibold mb-2'>로그인이 필요합니다</h2>
        <p className='text-muted-foreground'>
          대시보드를 보려면 로그인해주세요.
        </p>
      </div>
    )
  }

  // Server-side data fetching
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projects: {
        select: { id: true, title: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      },
      posts: {
        select: { id: true, title: true, published: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!userData) {
    return <div>사용자 데이터를 찾을 수 없습니다.</div>
  }

  return (
    <div className='space-y-6'>
      {/* Static header - Server Component */}
      <div className='border-b pb-4'>
        <h1 className='text-2xl font-bold'>
          안녕하세요, {userData.name || '사용자'}님!
        </h1>
        <p className='text-muted-foreground'>오늘도 목표를 향해 나아가세요.</p>
      </div>

      {/* Dynamic interactions - Client Component */}
      <HybridExamplesClient
        user={userData}
        projects={userData.projects}
        posts={userData.posts}
      />
    </div>
  )
}

/**
 * Example 2: Static-Dynamic Separation Pattern
 * 정적-동적 분리 패턴 예제
 */
export function FormWithStaticLabels({
  title,
  description,
  fields,
  children,
}: {
  title: string
  description: string
  fields: Array<{
    name: string
    label: string
    description?: string
    required?: boolean
  }>
  children: ReactNode
}) {
  return (
    <div className='max-w-2xl mx-auto p-6'>
      {/* Static form structure - Server Component */}
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold mb-2'>{title}</h1>
        <p className='text-muted-foreground'>{description}</p>
      </div>

      <div className='space-y-6'>
        {fields.map(field => (
          <div key={field.name} className='space-y-2'>
            <label className='text-sm font-medium leading-none'>
              {field.label}
              {field.required && <span className='text-red-500 ml-1'>*</span>}
            </label>
            {field.description && (
              <p className='text-xs text-muted-foreground'>
                {field.description}
              </p>
            )}
            {/* Dynamic form inputs will be inserted here by Client Component */}
          </div>
        ))}

        {/* Dynamic form logic - Client Component */}
        {children}
      </div>
    </div>
  )
}

/**
 * Example 3: Conditional Client Loading Pattern
 * 조건부 클라이언트 로딩 패턴 예제
 */
export async function ConditionalFeatureLoader({
  featureFlag,
  userRole,
}: {
  featureFlag: string
  userRole?: string
}) {
  const session = await auth()

  // Server-side feature flag check
  const isFeatureEnabled =
    process.env[`FEATURE_${featureFlag.toUpperCase()}`] === 'true'
  const hasPermission = userRole === 'admin' || userRole === 'premium'

  if (!session?.user) {
    return (
      <div className='text-center py-4 bg-muted rounded-lg'>
        <p className='text-sm text-muted-foreground'>
          이 기능을 사용하려면 로그인이 필요합니다.
        </p>
      </div>
    )
  }

  if (!isFeatureEnabled) {
    return (
      <div className='text-center py-4 bg-muted rounded-lg'>
        <p className='text-sm text-muted-foreground'>
          이 기능은 현재 사용할 수 없습니다.
        </p>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className='text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <p className='text-sm text-yellow-800'>
          이 기능은 프리미엄 사용자만 이용할 수 있습니다.
        </p>
      </div>
    )
  }

  // Load Client Component only when all conditions are met
  return (
    <Suspense fallback={<div>기능을 로딩 중...</div>}>
      <HybridExamplesClient
        user={session.user}
        featureFlag={featureFlag}
        hasPermission={hasPermission}
      />
    </Suspense>
  )
}

/**
 * Example 4: Progressive Enhancement Pattern
 * 점진적 향상 패턴 예제
 */
export function ProgressiveForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Record<string, string>
}) {
  return (
    <div className='max-w-md mx-auto'>
      {/* Basic form functionality - Server Component */}
      <form action={action} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium mb-1'>
            이메일
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            defaultValue={defaultValues?.email}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label htmlFor='message' className='block text-sm font-medium mb-1'>
            메시지
          </label>
          <textarea
            id='message'
            name='message'
            required
            defaultValue={defaultValues?.message}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            rows={4}
          />
        </div>

        <button
          type='submit'
          className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          제출
        </button>
      </form>

      {/* Enhanced functionality - Client Component */}
      <HybridExamplesClient enhanceForm={true} defaultValues={defaultValues} />
    </div>
  )
}

/**
 * Example 5: Layout-Content Separation Pattern
 * 레이아웃-콘텐츠 분리 패턴 예제
 */
export function HybridPageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: {
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Static layout structure - Server Component */}
      <div className='border-b'>
        <div className='container mx-auto px-4 py-6'>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className='mb-4'>
              <ol className='flex items-center space-x-2 text-sm text-muted-foreground'>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className='flex items-center'>
                    {index > 0 && <span className='mx-2'>/</span>}
                    {crumb.href ? (
                      <a href={crumb.href} className='hover:text-foreground'>
                        {crumb.label}
                      </a>
                    ) : (
                      <span className='text-foreground'>{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
              {description && (
                <p className='text-muted-foreground mt-2'>{description}</p>
              )}
            </div>
            {actions && (
              <div className='flex items-center gap-2'>{actions}</div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic content area */}
      <main className='container mx-auto px-4 py-6'>{children}</main>
    </div>
  )
}

/**
 * Example 6: Data Streaming Pattern
 * 데이터 스트리밍 패턴 예제
 */
export async function StreamingDataExample() {
  // Initial data load on server
  const initialData = await prisma.project.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  return (
    <div className='space-y-6'>
      {/* Static header - Server Component */}
      <div>
        <h2 className='text-xl font-semibold mb-2'>실시간 프로젝트 목록</h2>
        <p className='text-muted-foreground'>
          프로젝트가 실시간으로 업데이트됩니다.
        </p>
      </div>

      {/* Streaming data display - Client Component */}
      <Suspense fallback={<div>데이터를 로딩 중...</div>}>
        <HybridExamplesClient streamingData={true} initialData={initialData} />
      </Suspense>
    </div>
  )
}
