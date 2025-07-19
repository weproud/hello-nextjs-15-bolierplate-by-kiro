/**
 * Advanced TypeScript utility types for enhanced type safety
 */

// Utility types for better type inference
export type NonEmptyArray<T> = [T, ...T[]]

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// Utility types for object manipulation
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// Function utility types
export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> =
  T extends (...args: any[]) => Promise<infer R> ? R : never

export type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never

export type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any

// API response types
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: Record<string, unknown>
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// Form types
export interface FormState<T = unknown> {
  data: T
  errors: Record<string, string[]>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

export type FormField<T> = {
  value: T
  error?: string
  touched: boolean
  dirty: boolean
}

export type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>
}

// Database types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface FilterParams<T = Record<string, unknown>> {
  filters: T
  search?: string
}

// Cache types
export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalSize: number
  entryCount: number
}

// Event types
export interface BaseEvent {
  type: string
  timestamp: number
  id: string
}

export interface DataEvent<T = unknown> extends BaseEvent {
  data: T
}

export type EventHandler<T extends BaseEvent = BaseEvent> = (
  event: T
) => void | Promise<void>

// Validation types
export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean | string
  message?: string
}

export type ValidationSchema<T = Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

export interface ValidationResult<T = unknown> {
  isValid: boolean
  data?: T
  errors: Record<string, string[]>
}

// Component prop types (simplified to avoid JSX dependency issues)
export type PropsWithChildren<P = Record<string, unknown>> = P & {
  children?: React.ReactNode
}

// Utility functions for type checking
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`)
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null
}

// Type-safe object key iteration
export function typedKeys<T extends Record<string, unknown>>(
  obj: T
): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

export function typedEntries<T extends Record<string, unknown>>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

export function typedValues<T extends Record<string, unknown>>(
  obj: T
): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}

// Type-safe array operations
export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0
}

export function head<T>(arr: NonEmptyArray<T>): T {
  return arr[0]
}

export function tail<T>(arr: NonEmptyArray<T>): T[] {
  return arr.slice(1)
}

// Type-safe promise operations
export async function safeAsync<T, E = Error>(
  promise: Promise<T>
): Promise<[T, null] | [null, E]> {
  try {
    const data = await promise
    return [data, null]
  } catch (error) {
    return [null, error as E]
  }
}

// Type-safe JSON operations
export function safeJsonParse<T = unknown>(
  json: string,
  fallback?: T
): T | undefined {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export function safeJsonStringify(value: unknown, fallback = '{}'): string {
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

// Type-safe environment variable access
export function getEnvVar(key: string): string | undefined
export function getEnvVar(key: string, defaultValue: string): string
export function getEnvVar(
  key: string,
  defaultValue?: string
): string | undefined {
  const value = process.env[key]
  return value ?? defaultValue
}

export function requireEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

// Type-safe local storage operations
export function safeLocalStorageGet<T = unknown>(
  key: string,
  fallback?: T
): T | undefined {
  if (typeof window === 'undefined') return fallback

  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

export function safeLocalStorageSet(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Type-safe URL operations
export function safeUrl(url: string, base?: string): URL | null {
  try {
    return new URL(url, base)
  } catch {
    return null
  }
}

export function isValidUrl(url: string, base?: string): boolean {
  return safeUrl(url, base) !== null
}

// Type-safe number operations
export function safeParseInt(value: string, fallback = 0): number {
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

export function safeParseFloat(value: string, fallback = 0): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}

// Type-safe date operations
export function safeDate(value: string | number | Date): Date | null {
  try {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export function isValidDate(value: string | number | Date): boolean {
  return safeDate(value) !== null
}

// Branded types for better type safety
export type Brand<T, B> = T & { __brand: B }

export type UserId = Brand<string, 'UserId'>
export type ProjectId = Brand<string, 'ProjectId'>
export type Email = Brand<string, 'Email'>
export type Url = Brand<string, 'Url'>

// Type guards for branded types
export function isUserId(value: string): value is UserId {
  return /^[a-zA-Z0-9_-]+$/.test(value)
}

export function isProjectId(value: string): value is ProjectId {
  return /^[a-zA-Z0-9_-]+$/.test(value)
}

export function isEmail(value: string): value is Email {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isUrl(value: string): value is Url {
  return isValidUrl(value)
}

// Helper to create branded types
export function createBrand<T, B>(value: T): Brand<T, B> {
  return value as Brand<T, B>
}
