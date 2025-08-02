# Next Safe Action Implementation Guide

## Overview

This guide covers the complete implementation of `next-safe-action` in our Next.js application,
providing type-safe server actions with authentication, error handling, and logging.

## Installation

```bash
pnpm add next-safe-action zod
```

## Core Configuration

### 1. Safe Action Client Setup (`src/lib/safe-action.ts`)

```typescript
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

// Base action client without authentication
export const action = createSafeActionClient({
  handleServerError(e) {
    console.error('Server action error:', e)
    if (e instanceof Error) {
      return e.message
    }
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
  defineMetadataSchema() {
    return {
      actionName: '',
      userId: '',
    }
  },
})

// Authenticated action client
export const authAction = createSafeActionClient({
  handleServerError(e) {
    console.error('Authenticated server action error:', e)
    if (e instanceof Error) {
      return e.message
    }
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
  defineMetadataSchema() {
    return {
      actionName: '',
      userId: '',
    }
  },
}).use(async ({ next, metadata }) => {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return next({
    ctx: {
      user: session.user,
      userId: session.user.id || '',
    },
    metadata: {
      ...metadata,
      userId: session.user.id || '',
    },
  })
})
```

### 2. Zod Validation Schemas (`src/lib/validations/common.ts`)

The application includes comprehensive Zod schemas for various form types:

- **Basic Forms**: Contact, Project, Search
- **Authentication**: Register, Login, Password Reset
- **Advanced Forms**: File Upload, Survey, Multi-step
- **Complex Forms**: Job Application, Event Registration, Booking

## Server Actions Implementation

### 1. Basic Action Structure

```typescript
export const createProject = authAction
  .schema(projectSchema)
  .metadata({ actionName: 'createProject' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Creating project:`, parsedInput.title)

      // Your business logic here
      const project = {
        id: generateId(),
        ...parsedInput,
        userId: ctx.userId,
        createdAt: new Date(),
      }

      revalidatePath('/projects')
      return project
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to create project:`, error)
      throw new Error('프로젝트 생성 중 오류가 발생했습니다.')
    }
  })
```

### 2. File Upload Action

```typescript
export const uploadFile = authAction
  .schema(
    z.object({
      file: z.instanceof(File),
      category: z.enum(['avatar', 'document', 'image']),
    })
  )
  .metadata({ actionName: 'uploadFile' })
  .action(async ({ parsedInput, ctx }) => {
    // File validation and upload logic
    // Returns upload result with URL and metadata
  })
```

### 3. Batch Operations

```typescript
export const batchDeleteItems = authAction
  .schema(
    z.object({
      ids: z.array(z.string()).min(1).max(50),
      type: z.enum(['projects', 'files', 'comments']),
    })
  )
  .metadata({ actionName: 'batchDeleteItems' })
  .action(async ({ parsedInput, ctx }) => {
    // Batch delete logic with success/failure tracking
  })
```

## Client-Side Usage

### 1. Basic Form with React Hook Form

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

export function ProjectForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
  })

  const { execute, status, result } = useAction(createProject, {
    onSuccess: (data) => {
      toast.success('프로젝트가 성공적으로 생성되었습니다!')
      reset()
    },
    onError: (error) => {
      toast.error(error.error.serverError || '프로젝트 생성에 실패했습니다.')
    },
  })

  const onSubmit = (data: ProjectInput) => {
    execute(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button
        type="submit"
        disabled={status === 'executing'}
      >
        {status === 'executing' ? '생성 중...' : '프로젝트 생성'}
      </Button>
    </form>
  )
}
```

### 2. File Upload with Progress

```typescript
export function FileUploadForm() {
  const [uploadProgress, setUploadProgress] = useState(0)

  const { execute, status } = useAction(uploadFile, {
    onExecute: () => {
      // Simulate progress updates
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)
    },
    onSuccess: () => {
      setUploadProgress(100)
      toast.success('파일이 성공적으로 업로드되었습니다!')
    },
  })

  return (
    <form>
      {status === 'executing' && (
        <Progress value={uploadProgress} />
      )}
      {/* File input and submit button */}
    </form>
  )
}
```

## Key Features

### 1. Type Safety

- Full TypeScript support with inferred types
- Zod schema validation on both client and server
- Compile-time error checking

### 2. Authentication Integration

- Automatic session checking for protected actions
- User context available in action handlers
- Automatic redirect for unauthenticated users

### 3. Error Handling

- Centralized error handling configuration
- Custom error messages for different scenarios
- Automatic error logging with user context

### 4. Logging and Monitoring

- Structured logging with user IDs and action names
- Performance tracking and debugging information
- Error tracking with full context

### 5. Advanced Features

- File upload with validation and progress tracking
- Batch operations with partial success handling
- Search with filtering and pagination
- Newsletter subscription with preferences

## Best Practices

### 1. Schema Design

- Use descriptive error messages in Korean
- Implement proper validation rules
- Consider file size and type restrictions

### 2. Error Handling

- Always wrap business logic in try-catch blocks
- Provide user-friendly error messages
- Log errors with sufficient context for debugging

### 3. Performance

- Use `revalidatePath()` to update cached data
- Implement proper loading states
- Consider pagination for large datasets

### 4. Security

- Always validate file uploads
- Implement rate limiting for sensitive actions
- Use authentication for protected operations

## Available Examples

The application includes comprehensive examples:

1. **Basic Forms**: Project creation, Contact forms
2. **Advanced Forms**: File upload, Batch operations, Search
3. **Authentication Forms**: Login, Register, Profile update
4. **Complex Forms**: Multi-step, Conditional validation

Visit `/forms` to see all examples in action.

## Testing

```typescript
// Example test for server action
import { createProject } from '@/lib/actions/form-actions'

describe('createProject', () => {
  it('should create project successfully', async () => {
    const result = await createProject({
      title: 'Test Project',
      description: 'Test Description',
    })

    expect(result.data).toBeDefined()
    expect(result.data?.title).toBe('Test Project')
  })
})
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure session is properly configured
2. **Validation Errors**: Check Zod schema definitions
3. **Type Errors**: Verify schema and action type alignment
4. **Performance Issues**: Consider pagination and caching strategies

### Debug Mode

Enable detailed logging by setting environment variables:

```env
NODE_ENV=development
DEBUG=next-safe-action:*
```

This comprehensive implementation provides a robust foundation for handling forms and server actions
in your Next.js application with full type safety, authentication, and error handling.
