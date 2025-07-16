/**
 * Mock Data
 *
 * Sample data for development and testing purposes.
 * This data can be used for prototyping and demonstrations.
 */

// Mock users
export const mockUsers = [
  {
    id: 'user-1',
    name: '김개발',
    email: 'kim.dev@example.com',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'user-2',
    name: '이디자인',
    email: 'lee.design@example.com',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-28'),
  },
  {
    id: 'user-3',
    name: '박매니저',
    email: 'park.manager@example.com',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-12-05'),
  },
]

// Mock projects
export const mockProjects = [
  {
    id: 'project-1',
    title: 'E-커머스 웹사이트 개발',
    description:
      '현대적인 온라인 쇼핑몰 구축 프로젝트입니다. React와 Node.js를 사용하여 확장 가능한 플랫폼을 만들고 있습니다.',
    userId: 'user-1',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-01'),
    status: 'active',
    category: 'web',
    priority: 'high',
    _count: { phases: 4 },
  },
  {
    id: 'project-2',
    title: '모바일 앱 UI/UX 디자인',
    description:
      '사용자 친화적인 모바일 애플리케이션 인터페이스 디자인 작업입니다.',
    userId: 'user-2',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-03'),
    status: 'active',
    category: 'design',
    priority: 'medium',
    _count: { phases: 3 },
  },
  {
    id: 'project-3',
    title: 'API 서버 구축',
    description: 'RESTful API 서버 개발 및 데이터베이스 설계 프로젝트입니다.',
    userId: 'user-1',
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-11-30'),
    status: 'completed',
    category: 'api',
    priority: 'high',
    _count: { phases: 5 },
  },
  {
    id: 'project-4',
    title: '마케팅 캠페인 기획',
    description: '신제품 출시를 위한 통합 마케팅 전략 수립 및 실행 계획입니다.',
    userId: 'user-3',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-02'),
    status: 'active',
    category: 'marketing',
    priority: 'medium',
    _count: { phases: 2 },
  },
  {
    id: 'project-5',
    title: '데스크톱 애플리케이션',
    description:
      'Electron을 사용한 크로스 플랫폼 데스크톱 애플리케이션 개발입니다.',
    userId: 'user-1',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-10-20'),
    status: 'archived',
    category: 'desktop',
    priority: 'low',
    _count: { phases: 6 },
  },
]

// Mock phases
export const mockPhases = [
  // Project 1 phases
  {
    id: 'phase-1-1',
    title: '요구사항 분석',
    description: '클라이언트 요구사항 수집 및 분석',
    order: 1,
    projectId: 'project-1',
    status: 'completed',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: 'phase-1-2',
    title: '시스템 설계',
    description: '아키텍처 설계 및 기술 스택 선정',
    order: 2,
    projectId: 'project-1',
    status: 'completed',
    createdAt: new Date('2024-10-16'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'phase-1-3',
    title: '프론트엔드 개발',
    description: 'React 기반 사용자 인터페이스 구현',
    order: 3,
    projectId: 'project-1',
    status: 'in_progress',
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'phase-1-4',
    title: '백엔드 개발',
    description: 'Node.js API 서버 및 데이터베이스 구현',
    order: 4,
    projectId: 'project-1',
    status: 'pending',
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
  },

  // Project 2 phases
  {
    id: 'phase-2-1',
    title: '사용자 리서치',
    description: '타겟 사용자 분석 및 페르소나 정의',
    order: 1,
    projectId: 'project-2',
    status: 'completed',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-25'),
  },
  {
    id: 'phase-2-2',
    title: '와이어프레임 제작',
    description: '앱 구조 및 화면 흐름 설계',
    order: 2,
    projectId: 'project-2',
    status: 'in_progress',
    createdAt: new Date('2024-11-26'),
    updatedAt: new Date('2024-12-03'),
  },
  {
    id: 'phase-2-3',
    title: 'UI 디자인',
    description: '최종 시각적 디자인 및 프로토타입',
    order: 3,
    projectId: 'project-2',
    status: 'pending',
    createdAt: new Date('2024-11-26'),
    updatedAt: new Date('2024-11-26'),
  },
]

// Mock notifications
export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'success' as const,
    title: '프로젝트 생성 완료',
    message: '새 프로젝트 "E-커머스 웹사이트 개발"이 생성되었습니다.',
    timestamp: new Date('2024-12-01T10:30:00'),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'info' as const,
    title: '단계 업데이트',
    message: '"프론트엔드 개발" 단계가 진행 중으로 변경되었습니다.',
    timestamp: new Date('2024-12-01T14:15:00'),
    read: true,
  },
  {
    id: 'notif-3',
    type: 'warning' as const,
    title: '마감일 임박',
    message: '"API 서버 구축" 프로젝트의 마감일이 3일 남았습니다.',
    timestamp: new Date('2024-11-30T09:00:00'),
    read: false,
  },
  {
    id: 'notif-4',
    type: 'error' as const,
    title: '동기화 실패',
    message: '프로젝트 데이터 동기화 중 오류가 발생했습니다.',
    timestamp: new Date('2024-11-29T16:45:00'),
    read: true,
  },
]

// Mock statistics
export const mockStats = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 3,
  archivedProjects: 1,
  totalPhases: 45,
  completedPhases: 28,
  inProgressPhases: 12,
  pendingPhases: 5,
  averagePhasesPerProject: 3.8,
  projectsThisMonth: 3,
  projectsLastMonth: 2,
  monthlyGrowth: 50,
  weeklyActivity: [
    { day: '월', projects: 2, phases: 5 },
    { day: '화', projects: 1, phases: 3 },
    { day: '수', projects: 3, phases: 7 },
    { day: '목', projects: 2, phases: 4 },
    { day: '금', projects: 4, phases: 8 },
    { day: '토', projects: 1, phases: 2 },
    { day: '일', projects: 0, phases: 1 },
  ],
  categoryDistribution: [
    { category: 'web', count: 5, percentage: 42 },
    { category: 'mobile', count: 3, percentage: 25 },
    { category: 'api', count: 2, percentage: 17 },
    { category: 'design', count: 1, percentage: 8 },
    { category: 'marketing', count: 1, percentage: 8 },
  ],
}

// Mock search results
export const mockSearchResults = {
  projects: [
    {
      id: 'project-1',
      title: 'E-커머스 웹사이트 개발',
      description: '현대적인 온라인 쇼핑몰 구축 프로젝트',
      type: 'project',
      relevanceScore: 0.95,
    },
    {
      id: 'project-2',
      title: '모바일 앱 UI/UX 디자인',
      description: '사용자 친화적인 모바일 애플리케이션 인터페이스',
      type: 'project',
      relevanceScore: 0.87,
    },
  ],
  phases: [
    {
      id: 'phase-1-3',
      title: '프론트엔드 개발',
      description: 'React 기반 사용자 인터페이스 구현',
      type: 'phase',
      projectTitle: 'E-커머스 웹사이트 개발',
      relevanceScore: 0.92,
    },
  ],
  totalResults: 3,
  searchTime: 45,
}

// Mock file uploads
export const mockUploads = [
  {
    id: 'upload-1',
    filename: 'project-mockup.png',
    originalName: 'E-commerce Mockup.png',
    size: 2048576, // 2MB
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600',
    category: 'image',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2024-12-01T10:00:00'),
  },
  {
    id: 'upload-2',
    filename: 'requirements.pdf',
    originalName: 'Project Requirements.pdf',
    size: 1024000, // 1MB
    type: 'application/pdf',
    url: '/uploads/documents/requirements.pdf',
    category: 'document',
    uploadedBy: 'user-2',
    uploadedAt: new Date('2024-11-30T15:30:00'),
  },
]

// Mock form submissions
export const mockFormSubmissions = [
  {
    id: 'form-1',
    type: 'contact',
    data: {
      name: '홍길동',
      email: 'hong@example.com',
      subject: 'technical',
      message: '로그인 관련 문제가 있습니다. 도움이 필요합니다.',
    },
    submittedAt: new Date('2024-12-01T09:15:00'),
    status: 'pending',
  },
  {
    id: 'form-2',
    type: 'feedback',
    data: {
      type: 'feature',
      title: '다크 모드 지원',
      description: '다크 모드 테마를 추가해주세요.',
      priority: 'medium',
    },
    submittedAt: new Date('2024-11-30T14:20:00'),
    status: 'reviewed',
  },
]

// Utility functions for mock data
export const mockDataUtils = {
  /**
   * Get random items from array
   */
  getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },

  /**
   * Generate random date within range
   */
  getRandomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
  },

  /**
   * Get projects by user ID
   */
  getProjectsByUserId(userId: string) {
    return mockProjects.filter(project => project.userId === userId)
  },

  /**
   * Get phases by project ID
   */
  getPhasesByProjectId(projectId: string) {
    return mockPhases.filter(phase => phase.projectId === projectId)
  },

  /**
   * Get user by ID
   */
  getUserById(userId: string) {
    return mockUsers.find(user => user.id === userId)
  },

  /**
   * Get project by ID
   */
  getProjectById(projectId: string) {
    return mockProjects.find(project => project.id === projectId)
  },

  /**
   * Filter projects by criteria
   */
  filterProjects(criteria: {
    search?: string
    category?: string
    status?: string
    userId?: string
  }) {
    return mockProjects.filter(project => {
      if (criteria.search) {
        const searchLower = criteria.search.toLowerCase()
        const matchesSearch =
          project.title.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (criteria.category && project.category !== criteria.category) {
        return false
      }

      if (criteria.status && project.status !== criteria.status) {
        return false
      }

      if (criteria.userId && project.userId !== criteria.userId) {
        return false
      }

      return true
    })
  },

  /**
   * Paginate array
   */
  paginate<T>(array: T[], page: number, limit: number) {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        totalCount: array.length,
        totalPages: Math.ceil(array.length / limit),
        hasNextPage: endIndex < array.length,
        hasPreviousPage: page > 1,
      },
    }
  },
}
