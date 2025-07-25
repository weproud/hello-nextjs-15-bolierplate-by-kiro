/**
 * Type guard utilities for enhanced type safety
 */

// Basic type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function isFile(value: unknown): value is File {
  return value instanceof File
}

// Null/undefined checks
export function isNull(value: unknown): value is null {
  return value === null
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isNullish(value: unknown): value is null | undefined {
  return value == null
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value != null
}

// Complex type guards
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj
}

export function hasProperties<K extends string>(
  obj: unknown,
  keys: K[]
): obj is Record<K, unknown> {
  return isObject(obj) && keys.every(key => key in obj)
}

// API response type guards
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

export function isApiResponse<T = unknown>(
  value: unknown
): value is ApiResponse<T> {
  return (
    isObject(value) && hasProperty(value, 'status') && isNumber(value['status'])
  )
}

export function isSuccessResponse<T = unknown>(
  value: unknown
): value is ApiResponse<T> & { data: T } {
  return (
    isApiResponse<T>(value) &&
    value.status >= 200 &&
    value.status < 300 &&
    hasProperty(value, 'data')
  )
}

export function isErrorResponse(
  value: unknown
): value is ApiResponse & { error: string } {
  return (
    isApiResponse(value) &&
    (value.status < 200 || value.status >= 400) &&
    hasProperty(value, 'error') &&
    isString(value.error)
  )
}

// Form data type guards
export function isFormData(value: unknown): value is FormData {
  return value instanceof FormData
}

export function isValidFormField(
  value: unknown
): value is string | File | string[] {
  return (
    isString(value) ||
    isFile(value) ||
    (isArray<string>(value) && value.every(isString))
  )
}

// Prisma error type guards
export interface PrismaError {
  code: string
  message: string
  meta?: Record<string, unknown>
}

export function isPrismaError(error: unknown): error is PrismaError {
  return (
    isObject(error) &&
    hasProperty(error, 'code') &&
    isString(error['code']) &&
    hasProperty(error, 'message') &&
    isString(error['message'])
  )
}

export function isUniqueConstraintError(error: unknown): error is PrismaError {
  return isPrismaError(error) && error.code === 'P2002'
}

export function isForeignKeyConstraintError(
  error: unknown
): error is PrismaError {
  return isPrismaError(error) && error.code === 'P2003'
}

export function isRecordNotFoundError(error: unknown): error is PrismaError {
  return isPrismaError(error) && error.code === 'P2025'
}

// Validation result type guards
export interface ValidationSuccess<T> {
  success: true
  data: T
  errors?: never
}

export interface ValidationFailure {
  success: false
  data?: never
  errors: Record<string, string[]>
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

export function isValidationSuccess<T>(
  result: ValidationResult<T>
): result is ValidationSuccess<T> {
  return result.success === true
}

export function isValidationFailure<T>(
  result: ValidationResult<T>
): result is ValidationFailure {
  return result.success === false
}

// Next.js specific type guards
export function isServerSide(): boolean {
  return typeof window === 'undefined'
}

export function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

// Environment type guards
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

// Generic utility type guards
export function isOneOf<T extends readonly unknown[]>(
  value: unknown,
  options: T
): value is T[number] {
  return options.includes(value)
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard)
}

export function isRecordOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is Record<string, T> {
  return isObject(value) && Object.values(value).every(guard)
}

// Enhanced type guards for better type safety
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

export function isArrayOfStrings(value: unknown): value is string[] {
  return isArrayOf(value, isString)
}

export function isArrayOfNumbers(value: unknown): value is number[] {
  return isArrayOf(value, isNumber)
}

export function isStringRecord(
  value: unknown
): value is Record<string, string> {
  return isRecordOf(value, isString)
}

// Form-specific type guards
export function isFormDataEntry(value: unknown): value is FormDataEntryValue {
  return isString(value) || isFile(value)
}

export function isValidFormDataObject(
  value: unknown
): value is Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  return (
    isObject(value) &&
    Object.values(value).every(
      val =>
        isFormDataEntry(val) || (isArray(val) && val.every(isFormDataEntry))
    )
  )
}

// JSON type guards
export function isJsonValue(
  value: unknown
): value is string | number | boolean | null | JsonObject | JsonArray {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true
  }
  if (isArray(value)) {
    return value.every(isJsonValue)
  }
  if (isObject(value)) {
    return Object.values(value).every(isJsonValue)
  }
  return false
}

export interface JsonObject {
  [key: string]: string | number | boolean | null | JsonObject | JsonArray
}

export interface JsonArray
  extends Array<string | number | boolean | null | JsonObject | JsonArray> {}

export function isJsonObject(value: unknown): value is JsonObject {
  return isObject(value) && Object.values(value).every(isJsonValue)
}

export function isJsonArray(value: unknown): value is JsonArray {
  return isArray(value) && value.every(isJsonValue)
}

// HTTP-specific type guards
export function isHttpMethod(
  value: unknown
): value is 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' {
  return isOneOf(value, [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'HEAD',
    'OPTIONS',
  ])
}

export function isHttpStatus(value: unknown): value is number {
  return isInteger(value) && value >= 100 && value < 600
}

// Database-specific type guards
export function isValidId(value: unknown): value is string {
  return (
    isNonEmptyString(value) &&
    (isValidUuid(value) || /^[a-zA-Z0-9_-]+$/.test(value))
  )
}

// Environment type guards with better specificity
export function isNodeEnvironment(
  value: unknown
): value is 'development' | 'production' | 'test' {
  return isOneOf(value, ['development', 'production', 'test'])
}

// Email validation type guard
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

// URL validation type guard
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

// UUID validation type guard
export function isValidUuid(value: unknown): value is string {
  if (!isString(value)) return false
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}
