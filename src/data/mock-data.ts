/**
 * Mock Data
 *
 * Sample data for development and testing purposes.
 */

import type { Project, User } from '@prisma/client'

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '김개발',
    email: 'kim@example.com',
    emailVerified: new Date('2024-01-01'),
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    displayName: null,
    password: null,
    isAdmin: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    name: '이디자인',
    email: 'lee@example.com',
    emailVerified: new Date('2024-01-02'),
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    displayName: null,
    password: null,
    isAdmin: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'user-3',
    name: '박기획',
    email: 'park@example.com',
    emailVerified: new Date('2024-01-03'),
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    displayName: null,
    password: null,
    isAdmin: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
]

// Mock projects
export const mockProjects: (Project & { user: User })[] = [
  {
    id: 'project-1',
    title: 'Next.js 15 보일러플레이트',
    description: 'TypeScript와 Prisma를 사용한 현대적인 Next.js 애플리케이션',
    userId: 'user-1',
    user: mockUsers[0],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'project-2',
    title: 'React 컴포넌트 라이브러리',
    description: '재사용 가능한 UI 컴포넌트 라이브러리 개발',
    userId: 'user-2',
    user: mockUsers[1],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'project-3',
    title: '모바일 앱 프로토타입',
    description: 'React Native를 사용한 크로스 플랫폼 모바일 앱',
    userId: 'user-3',
    user: mockUsers[2],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'project-4',
    title: 'API 서버 개발',
    description: 'Node.js와 Express를 사용한 RESTful API 서버',
    userId: 'user-1',
    user: mockUsers[0],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: 'project-5',
    title: '데이터 시각화 대시보드',
    description: 'D3.js를 사용한 인터랙티브 데이터 시각화',
    userId: 'user-2',
    user: mockUsers[1],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-30'),
  },
]

// Mock statistics
export const mockStats = {
  totalProjects: mockProjects.length,
  activeProjects: mockProjects.length - 1,
  completedProjects: 1,
  projectsThisMonth: 3,
  projectsLastMonth: 2,
  monthlyGrowth: 50,
}

// Mock activity data
export const mockActivityData = [
  { day: '월', projects: 2 },
  { day: '화', projects: 1 },
  { day: '수', projects: 3 },
  { day: '목', projects: 2 },
  { day: '금', projects: 4 },
  { day: '토', projects: 1 },
  { day: '일', projects: 2 },
]

// Mock category distribution
export const mockCategoryDistribution = [
  { category: '웹 개발', count: 3, percentage: 60 },
  { category: '모바일 앱', count: 1, percentage: 20 },
  { category: 'API 개발', count: 1, percentage: 20 },
]

// Mock recent activities
export const mockRecentActivities = [
  {
    id: 'activity-1',
    type: 'project_created',
    message: '새 프로젝트 "데이터 시각화 대시보드"가 생성되었습니다.',
    timestamp: new Date('2024-01-30T10:30:00'),
    user: mockUsers[1],
  },
  {
    id: 'activity-2',
    type: 'project_updated',
    message: '프로젝트 "API 서버 개발"이 업데이트되었습니다.',
    timestamp: new Date('2024-01-28T14:20:00'),
    user: mockUsers[0],
  },
  {
    id: 'activity-3',
    type: 'project_created',
    message: '새 프로젝트 "모바일 앱 프로토타입"이 생성되었습니다.',
    timestamp: new Date('2024-01-25T09:15:00'),
    user: mockUsers[2],
  },
]

// Export all mock data
export const mockData = {
  users: mockUsers,
  projects: mockProjects,
  stats: mockStats,
  activityData: mockActivityData,
  categoryDistribution: mockCategoryDistribution,
  recentActivities: mockRecentActivities,
}
