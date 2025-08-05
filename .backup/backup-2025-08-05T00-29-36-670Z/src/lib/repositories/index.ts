/**
 * Repository 패턴 구현
 *
 * 이 모듈은 데이터베이스 액세스를 위한 Repository 패턴을 구현합니다.
 * 각 모델별로 타입 안전한 데이터베이스 작업을 제공하며,
 * 공통 인터페이스를 통해 일관된 API를 제공합니다.
 */

// Base Repository 인터페이스 및 유틸리티
export {
  AbstractRepository,
  DuplicateError,
  NotFoundError,
  RepositoryError,
  ValidationError,
  type BaseRepository,
  type PaginatedResult,
  type PaginationOptions,
  type SortOptions,
} from './base-repository'

// User Repository
export { UserRepository, userRepository } from './user-repository'

// Post Repository
export { PostRepository, postRepository } from './post-repository'

// Project Repository
export { ProjectRepository, projectRepository } from './project-repository'

/**
 * 모든 Repository 인스턴스를 포함하는 객체
 * 의존성 주입이나 테스트에서 유용합니다.
 */
export const repositories = {
  user: userRepository,
  post: postRepository,
  project: projectRepository,
} as const

/**
 * Repository 타입 정의
 */
export type Repositories = typeof repositories

/**
 * Repository 키 타입
 */
export type RepositoryKey = keyof Repositories

/**
 * 특정 Repository 타입 추출
 */
export type RepositoryType<K extends RepositoryKey> = Repositories[K]
