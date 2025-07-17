# Project Structure & Organization

## Root Directory Structure

```
├── .kiro/              # Kiro AI assistant configuration
├── prisma/             # Database schema and migrations
├── public/             # Static assets
├── src/                # Application source code
├── docs/               # Documentation files
└── [config files]      # Various configuration files
```

## Source Code Organization (`src/`)

### Core Application (`src/app/`)

- **App Router structure** following Next.js 15 conventions
- **Parallel routes** with `@modal` for modal overlays
- **Route groups** for organization (e.g., `(.)auth` for intercepted routes)
- **API routes** in `api/` subdirectory
- **Page components** with co-located client components when needed

### Components (`src/components/`)

- **Feature-based organization** (auth/, forms/, projects/)
- **UI components** in `ui/` (shadcn/ui base components)
- **Shared components** at root level
- **Test files** co-located in `__tests__/` subdirectories

### Library Code (`src/lib/`)

- **actions/** - Server actions with type safety
- **cache/** - Caching strategies and utilities
- **prisma/** - Database utilities and extensions
- **validations/** - Zod schemas for data validation
- **Core utilities** (auth, error handling, performance)

### Supporting Directories

- **hooks/** - Custom React hooks
- **stores/** - Zustand state management
- **types/** - TypeScript type definitions
- **contexts/** - React context providers
- **services/** - External service integrations

## File Naming Conventions

### Components

- **PascalCase** for component files: `SignInForm.tsx`
- **kebab-case** for page files: `signin/page.tsx`
- **Descriptive names** that indicate purpose

### Utilities & Actions

- **kebab-case** for utility files: `form-actions.ts`
- **Grouped by feature** when possible
- **Clear separation** between client and server code

### Test Files

- **Co-located** with source files in `__tests__/` directories
- **Descriptive names** ending in `.test.tsx` or `.test.ts`
- **Integration tests** in dedicated test directories

## Architecture Patterns

### Component Architecture

- **Server Components by default** for better performance
- **Client Components** only when interactivity is needed
- **Composition over inheritance** for reusable components
- **Props interfaces** defined inline or in separate types

### Data Flow

- **Server Actions** for mutations with type safety
- **Zod validation** at API boundaries
- **Error boundaries** for graceful error handling
- **Optimistic updates** where appropriate

### State Management

- **Local state** with useState/useReducer for component state
- **Global state** with Zustand for cross-component data
- **Form state** with React Hook Form
- **Server state** cached appropriately

## Import Organization

### Import Order

1. React and Next.js imports
2. Third-party library imports
3. Internal imports (components, utilities)
4. Type-only imports (marked with `type`)

### Path Aliases

- **`@/`** for src directory imports
- **Relative imports** for co-located files
- **Absolute imports** for cross-feature dependencies

## Code Organization Principles

### Separation of Concerns

- **Business logic** separated from UI components
- **Data access** isolated in service layers
- **Validation** centralized in schema files
- **Configuration** in dedicated files

### Feature Organization

- **Vertical slicing** by feature when possible
- **Shared utilities** in common directories
- **Clear boundaries** between features
- **Minimal coupling** between modules

### Testing Strategy

- **Unit tests** for utilities and pure functions
- **Component tests** for UI behavior
- **Integration tests** for feature workflows
- **E2E tests** for critical user journeys
