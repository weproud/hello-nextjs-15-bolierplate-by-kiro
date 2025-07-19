# 데이터베이스 및 상태 관리 가이드

## 6. 데이터베이스 및 상태 관리

### 6.1 Prisma 스키마 구조

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()"))
  name          String?   @db.VarChar(255)
  displayName   String?   @map("display_name") @db.VarChar(255)
  email         String    @unique @db.VarChar(255)
  emailVerified DateTime? @map("email_verified")
  image         String?
  isAdmin       Boolean   @default(false) @map("is_admin")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 관계
  accounts Account[]
  sessions Session[]
  projects Project[]

  @@map("users")
}

model Project {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String   @db.VarChar(255)
  description String?  @db.Text
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phases      Phase[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("projects")
}
```

### 6.2 Server Actions 패턴

```typescript
// 타입 안전 Server Action 클라이언트
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getCurrentSession()

  if (!session?.user) {
    throw new AuthenticationError('로그인이 필요합니다.')
  }

  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
      session,
    },
  })
})

// 사용 예시
export const updateProjectAction = authActionClient
  .schema(projectSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput
    const { userId } = ctx

    const project = await prisma.project.update({
      where: { id, userId },
      data,
    })

    revalidateTag('projects')
    return { project }
  })
```

### 6.3 캐싱 전략

```typescript
// Next.js 캐싱 활용
export const getProjectsWithCache = unstable_cache(
  async (userId: string) => {
    return await prisma.project.findMany({
      where: { userId },
      include: {
        phases: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { phases: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  },
  ['user-projects'],
  {
    tags: ['projects'],
    revalidate: 3600,
  }
)

// 캐시 무효화
import { revalidateTag } from 'next/cache'

export async function invalidateProjectsCache() {
  revalidateTag('projects')
}
```

### 6.4 Zustand 상태 관리

```typescript
// src/stores/app-store.ts
interface AppState {
  user: User | null
  theme: Theme
  notifications: Notification[]
  isLoading: boolean
  error: string | null
}

interface AppActions {
  setUser: (user: User | null) => void
  setTheme: (theme: Theme) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // 초기 상태
  user: null,
  theme: 'system',
  notifications: [],
  isLoading: false,
  error: null,

  // 액션
  setUser: user => set({ user }),
  setTheme: theme => set({ theme }),
  addNotification: notification =>
    set(state => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: generateId() },
      ],
    })),
  removeNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
}))
```

### 6.5 데이터베이스 연결 관리

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 6.6 데이터베이스 쿼리 최적화

```typescript
// 관계 데이터 효율적 로딩
export async function getProjectsWithPhases(userId: string) {
  return await prisma.project.findMany({
    where: { userId },
    include: {
      phases: {
        select: {
          id: true,
          title: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { phases: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

// 페이지네이션
export async function getProjectsPaginated(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.project.count({
      where: { userId },
    }),
  ])

  return {
    projects,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1,
    },
  }
}
```
