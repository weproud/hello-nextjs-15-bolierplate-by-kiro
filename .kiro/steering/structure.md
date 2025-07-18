# Project Structure

## Root Directory Organization

```
├── .kiro/                  # Kiro AI assistant configuration
├── docs/                   # Project documentation
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets (SVGs, images)
├── src/                    # Main application source code
└── [config files]          # Various configuration files
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)

- **Next.js 15 App Router** with file-based routing
- **Parallel Routes**: `@modal` slot for intercepted modal routes
- **Route Groups**: `(.)auth` for intercepting auth routes
- **API Routes**: `api/` directory for server endpoints
- **Page Structure**: Each route has `page.tsx` and optional `layout.tsx`

### Components (`src/components/`)

```
components/
├── auth/                   # Authentication-related components
├── forms/                  # Form components with validation
├── projects/               # Project management components
├── ui/                     # shadcn/ui base components
├── error/                  # Error handling components
└── [shared components]     # Reusable UI components
```

### Library Code (`src/lib/`)

```
lib/
├── actions/                # Server actions for form handling
├── cache/                  # Caching strategies and utilities
├── prisma/                 # Database utilities and extensions
├── validations/            # Zod schemas for validation
├── auth-error-utils.ts     # Authentication error handling
├── safe-action.ts          # Type-safe server action setup
└── utils.ts                # Common utility functions
```

### Supporting Directories

- **`hooks/`**: Custom React hooks for reusable logic
- **`stores/`**: Zustand store definitions
- **`types/`**: TypeScript type definitions and interfaces
- **`contexts/`**: React context providers
- **`services/`**: External service integrations
- **`providers/`**: Application-wide providers

## Key Architectural Patterns

### File Naming Conventions

- **Pages**: `page.tsx` for route pages
- **Layouts**: `layout.tsx` for route layouts
- **Components**: kebab-case (e.g., `signin-form.tsx`)
- **Utilities**: kebab-case (e.g., `auth-error-utils.ts`)
- **Types**: kebab-case (e.g., `next-auth.d.ts`)

### Component Organization

- **Server Components**: Default for all components
- **Client Components**: Explicitly marked with `'use client'`
- **Shared UI**: Base components in `components/ui/`
- **Feature Components**: Grouped by domain (auth, forms, projects)

### Import Path Aliases

- **`@/*`**: Maps to `src/*` for clean imports
- **Absolute Imports**: Preferred over relative imports

### Database Schema Organization

- **Models**: User, Project, Phase, Account, Session
- **Relations**: Proper foreign key relationships with cascade deletes
- **UUIDs**: Used for all primary keys with PostgreSQL generation
- **Timestamps**: `createdAt` and `updatedAt` on all models

### Testing Structure

- **Component Tests**: Co-located in `__tests__/` directories
- **Integration Tests**: In `src/app/__tests__/`
- **Test Setup**: Centralized in `src/test/setup.ts`

## Configuration Files

### Core Configuration

- **`next.config.ts`**: Next.js configuration with optimizations
- **`tsconfig.json`**: Strict TypeScript configuration
- **`eslint.config.mjs`**: ESLint with TypeScript and Prettier rules
- **`.prettierrc`**: Code formatting rules (no semicolons, single quotes)

### Database & Environment

- **`prisma/schema.prisma`**: Database schema definition
- **`.env.example`**: Environment variable template
- **`.env.local`**: Local development environment variables

### Package Management

- **`package.json`**: Dependencies and scripts
- **`pnpm-lock.yaml`**: Lock file for pnpm
- **`pnpm-workspace.yaml`**: Workspace configuration
