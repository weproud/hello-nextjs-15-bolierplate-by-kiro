/**
 * Projects Components
 *
 * 프로젝트 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core project components
export { ProjectList } from './project-list'
export { ProjectListClient } from './project-list-client'
export { ProjectListServer } from './project-list-server'
export { CreateProjectModal } from './create-project-modal'

// CRUD and example components
export { ProjectCrudExamples } from './project-crud-examples'
export { ProjectCrudLazy } from './project-crud-lazy'

// Re-export types from the central types system
export type {
  ProjectWithUser,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/types'
