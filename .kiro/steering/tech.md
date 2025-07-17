# Technology Stack

## Core Framework

- **Next.js 15** with App Router and React 19
- **TypeScript 5.8+** with strict configuration and enhanced safety rules
- **Turbopack** for fast development builds

## UI & Styling

- **Tailwind CSS 4.0** with CSS variables and utility-first approach
- **shadcn/ui** components built on Radix UI primitives
- **next-themes** for dark/light mode support
- **Lucide React** for consistent iconography

## Database & Backend

- **Prisma** ORM with PostgreSQL
- **NextAuth.js v5** for authentication (Google OAuth)
- **next-safe-action** for type-safe server actions
- **Zod** for runtime validation and schema definition

## State Management

- **Zustand** for global state management
- **React Hook Form** with Zod resolvers for form handling
- **Immer** for immutable state updates

## Development Tools

- **ESLint** with TypeScript rules and Prettier integration
- **Prettier** with consistent formatting (no semicolons, single quotes)
- **Vitest** for testing with React Testing Library
- **Bundle Analyzer** for performance optimization

## Common Commands

### Development

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality

```bash
npm run quality      # Run all quality checks (type-check, lint, format)
npm run quality:fix  # Fix all quality issues automatically
npm run type-check   # TypeScript type checking
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
```

### Database

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
