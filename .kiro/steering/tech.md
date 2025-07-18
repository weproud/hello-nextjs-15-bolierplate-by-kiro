# Technology Stack

## Core Framework

- **Next.js 15** with App Router and Turbopack for development
- **React 19** with latest features and optimizations
- **TypeScript 5.8+** with strict configuration and enhanced safety rules

## Styling & UI

- **Tailwind CSS 4.0** with CSS variables and utility-first approach
- **shadcn/ui** components built on Radix UI primitives
- **next-themes** for dark/light mode support
- **Lucide React** for consistent iconography

## Database & Backend

- **Prisma** ORM with PostgreSQL database
- **NextAuth.js 5.0** for authentication (Google OAuth)
- **next-safe-action** for type-safe server actions
- **Zod** for runtime schema validation

## State Management

- **Zustand** for global state management
- **React Hook Form** with Zod resolvers for form handling
- **Immer** for immutable state updates

## Development Tools

- **ESLint** with TypeScript-specific rules and Prettier integration
- **Prettier** with consistent formatting (no semicolons, single quotes)
- **Vitest** for testing with React Testing Library
- **Bundle Analyzer** for performance optimization

## Common Commands

### Development

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality

```bash
npm run quality      # Run type-check, lint, and format check
npm run quality:fix  # Fix all quality issues automatically
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Database Operations

```bash
npm run db:push      # Push schema changes to database
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

### Testing & Performance

```bash
npm run test         # Run tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run build:analyze # Analyze bundle size
```

### Project Setup

```bash
npm run setup        # Complete project setup (install + db setup)
npm run clean        # Clean build artifacts and cache
npm run reset        # Full reset and reinstall
```

## Package Manager

- **pnpm** is the preferred package manager (see pnpm-lock.yaml and pnpm-workspace.yaml)
- Use `pnpm` commands instead of `npm` when possible for consistency
