/**
 * Projects Components
 *
 * 프로젝트 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core project components
export { CreateProjectModal } from '@/components/projects/create-project-modal'
export { ProjectList } from '@/components/projects/project-list'
export { ProjectListClient } from '@/components/projects/project-list-client'
export { ProjectListServer } from '@/components/projects/project-list-server'

// CRUD and example components
export { ProjectCrudExamples } from '@/components/projects/project-crud-examples'
export { ProjectCrudLazy } from '@/components/projects/project-crud-lazy'

// Re-export types from the central types system
export type {
  CreateProjectInput,
  ProjectWithUser,
  UpdateProjectInput,
} from '@/types'
