# hello-nextjs-15-bolierplate-by-kiro

This is a [Next.js](https://nextjs.org) project bootstrapped with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

A modern, full-stack Next.js 15 application with TypeScript, Tailwind CSS, Prisma, and NextAuth.js.
This project follows strict type safety, code quality standards, and modern development practices.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or remote)
- Google OAuth credentials (for authentication)

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   npm run setup
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your actual values in `.env.local`:
   - Database connection strings
   - Google OAuth credentials
   - Auth secret key

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠 Technology Stack

### Core Framework

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5.8+** - Strict type safety with enhanced settings

### Styling & UI

- **Tailwind CSS 4.0** - Utility-first CSS with CSS variables
- **shadcn/ui** - High-quality accessible components
- **next-themes** - Dark/light mode support

### Database & Auth

- **Prisma** - Type-safe ORM with PostgreSQL
- **NextAuth.js 5.0** - Authentication with Google OAuth
- **Zod** - Runtime type validation

### State Management

- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **next-safe-action** - Type-safe server actions

### Development Tools

- **ESLint** - Code linting with TypeScript rules
- **Prettier** - Code formatting
- **Bundle Analyzer** - Bundle size optimization

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # dashboard pages
│   ├── projects/          # Project management pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── forms/            # Form components
│   ├── projects/         # Project-specific components
│   └── ui/               # shadcn/ui base components
├── lib/                  # Utilities and configurations
│   ├── actions/          # Server actions
│   ├── cache/            # Caching utilities
│   ├── prisma/           # Database utilities
│   ├── validations/      # Zod schemas
│   └── utils.ts          # Common utilities
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
```

## 🔧 Development Scripts

### Core Development

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
npm run quality      # Run all quality checks
npm run quality:fix  # Fix all quality issues
```

### Database Operations

```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create and run migrations
npm run db:migrate:reset # Reset database and run all migrations
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with sample data
```

### Performance & Analysis

```bash
npm run build:analyze    # Analyze bundle size
npm run perf:bundle-size # Check bundle size
npm run perf:lighthouse  # Run Lighthouse performance audit
```

### Utility Scripts

```bash
npm run setup        # Complete project setup
npm run clean        # Clean build artifacts and cache
npm run reset        # Full reset and reinstall
```

## 🔐 Environment Variables

### Required Variables

Create `.env.local` from `.env.example` and configure:

#### Database

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
DIRECT_URL="postgresql://user:password@localhost:5432/database"
```

#### Authentication

```env
AUTH_SECRET="your-secret-key-here"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

#### Application

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 🏗 Development Workflow

### 1. Feature Development

1. Create feature branch from `main`
2. Run `npm run quality` before committing
3. Write tests for new functionality
4. Update documentation as needed
5. Create pull request

### 2. Code Quality Standards

- **TypeScript**: Strict mode enabled with additional safety rules
- **ESLint**: TypeScript-specific rules, no unused variables
- **Prettier**: No semicolons, single quotes, 2-space indentation
- **Line Length**: 80 characters maximum

### 3. Database Changes

1. Update Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Test migration with `npm run db:migrate:reset`
4. Update seed data if needed

### 4. Authentication Flow

- Google OAuth integration via NextAuth.js
- JWT session strategy with Prisma adapter
- Protected routes with middleware
- Type-safe session management

## 🧪 Testing Strategy

### Unit Tests

- Component testing with React Testing Library
- Utility function tests
- Zod schema validation tests

### Integration Tests

- Server action testing
- Database integration tests
- Authentication flow tests

### E2E Tests

- Critical user journeys
- Authentication and authorization
- Responsive design validation

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

1. Set production environment variables
2. Run database migrations: `npm run db:migrate:deploy`
3. Seed production data if needed
4. Configure domain and SSL

### Performance Optimization

- Server Components by default
- Dynamic imports for large components
- Image optimization with Next.js Image
- Bundle analysis and tree shaking

## 🔧 Troubleshooting

### Common Issues

#### Database Connection

```bash
# Check database connection
npm run db:studio

# Reset database if needed
npm run db:migrate:reset
```

#### Build Issues

```bash
# Clean and rebuild
npm run clean
npm run build
```

#### Type Errors

```bash
# Check TypeScript errors
npm run type-check

# Regenerate Prisma client
npm run db:generate
```

### Development Tips

1. **Hot Reload**: Uses Turbopack for fast development
2. **Type Safety**: Strict TypeScript configuration catches errors early
3. **Code Quality**: Pre-commit hooks ensure code standards
4. **Performance**: Bundle analyzer helps optimize build size

## 🛡️ Type Safety & Code Quality

This project maintains **100% TypeScript coverage** with strict type safety standards.

### Type Safety Features

- **Strict TypeScript Configuration**: All strict mode options enabled
- **Zero `any` Types**: Complete type coverage across the codebase
- **Runtime Validation**: Zod schemas for all data inputs
- **Type-Safe Server Actions**: Using `next-safe-action` for form handling
- **Database Type Safety**: Prisma-generated types for all queries

### Quality Assurance

```bash
# Run complete quality check
npm run quality

# Individual checks
npm run type-check    # TypeScript compilation
npm run lint         # ESLint rules
npm run format:check # Prettier formatting
```

### Type Safety Documentation

- [TypeScript Maintenance Guide](./docs/typescript-maintenance-guide.md)
- [Type Definitions Changelog](./docs/type-definitions-changelog.md)
- [Error Resolution Summary](./TYPESCRIPT_ERROR_RESOLUTION_SUMMARY.md)

## 📚 Best Practices

### Component Development

- Use Server Components by default
- Client Components only when needed (interactivity, hooks)
- Implement proper error boundaries
- Follow accessibility guidelines
- **Always define Props interfaces** with proper TypeScript types

### State Management

- Use Zustand for global state
- React Hook Form for form state
- Server state with React Query patterns
- **Type all state interfaces** and avoid `any` types

### Database Queries

- Use Prisma for type-safe queries
- Implement proper error handling
- Cache frequently accessed data
- Use transactions for complex operations
- **Leverage Prisma-generated types** for complete type safety

### Form Handling

- Use `EnhancedForm` component for consistent form UX
- Define Zod schemas for all form validations
- Use `createTypedFormAction` for type-safe server actions
- Implement proper error handling and loading states

### Security

- Validate all inputs with Zod
- Use environment variables for secrets
- Implement proper authentication checks
- Sanitize user-generated content
- **Type all API responses** and validate at runtime

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow code quality standards
4. Write tests for new features
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
