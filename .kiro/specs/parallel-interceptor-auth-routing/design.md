# Design Document

## Overview

This design implements Next.js 13+ parallel routing combined with interceptor routing for the
auth/signin functionality. The solution provides dual access patterns: a full-page signin experience
for direct navigation and a modal overlay for contextual signin from other pages.

The implementation leverages Next.js App Router's advanced routing features:

- **Parallel Routes**: Using `@modal` slot to render modal content alongside main content
- **Intercepting Routes**: Using `(.)` prefix to intercept signin routes and display them as modals
- **Conditional Rendering**: Smart routing logic to determine when to show modal vs full page

## Architecture

### File Structure

```
src/app/
├── layout.tsx                    # Root layout with parallel slot support
├── @modal/                       # Parallel route slot for modal content
│   ├── (.)auth/                  # Interceptor route for auth pages
│   │   └── signin/
│   │       └── page.tsx          # Modal signin page
│   └── default.tsx               # Default slot content (empty)
├── auth/
│   └── signin/
│       └── page.tsx              # Full page signin (existing)
└── [other routes...]
```

### Routing Flow

1. **Direct Navigation** (`/auth/signin`): Shows full page signin
2. **Intercepted Navigation** (link from other pages): Shows modal signin
3. **Modal Dismissal**: Returns to previous page state
4. **Successful Auth**: Handles redirect based on context

## Components and Interfaces

### Core Components

#### 1. Root Layout Enhancement

```typescript
// src/app/layout.tsx
interface RootLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode // Parallel route slot
}
```

**Responsibilities:**

- Render main content and modal slot simultaneously
- Maintain existing providers and global styles
- Handle modal backdrop and overlay positioning

#### 2. Modal Signin Page

```typescript
// src/app/@modal/(.)auth/signin/page.tsx
interface ModalSigninPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}
```

**Responsibilities:**

- Render signin form in modal context
- Handle modal-specific styling and behavior
- Manage modal dismissal and navigation
- Preserve callback URL handling

#### 3. Modal Container Component

```typescript
// src/components/auth/signin-modal.tsx
interface SigninModalProps {
  onClose: () => void
  callbackUrl?: string
}
```

**Responsibilities:**

- Provide modal UI structure (backdrop, container, close button)
- Handle keyboard navigation (ESC key)
- Manage focus trapping
- Responsive design for mobile devices

#### 4. Enhanced Signin Form

```typescript
// src/components/auth/signin-form.tsx (enhanced)
interface SigninFormProps {
  isModal?: boolean
  onSuccess?: () => void
  callbackUrl?: string
}
```

**Responsibilities:**

- Maintain existing authentication logic
- Handle context-aware redirects
- Provide modal-specific success callbacks
- Consistent error handling across contexts

### Shared Interfaces

#### Authentication Context

```typescript
interface AuthContextType {
  isModal: boolean
  callbackUrl: string
  onAuthSuccess: (redirectUrl?: string) => void
  onAuthError: (error: string) => void
}
```

#### Modal State Management

```typescript
interface ModalState {
  isOpen: boolean
  returnUrl: string
  preserveScroll: boolean
}
```

## Data Models

### Route Parameters

```typescript
interface SigninRouteParams {
  callbackUrl?: string
  returnUrl?: string
  modal?: 'true' | 'false'
}
```

### Modal Configuration

```typescript
interface ModalConfig {
  showBackdrop: boolean
  allowBackdropClose: boolean
  showCloseButton: boolean
  trapFocus: boolean
  restoreScroll: boolean
}
```

### Authentication State

```typescript
interface AuthState {
  isLoading: boolean
  error: string | null
  redirectUrl: string | null
  context: 'modal' | 'page'
}
```

## Error Handling

### Modal-Specific Errors

- **Route Interception Failure**: Fallback to full page signin
- **Modal Rendering Error**: Display error boundary within modal
- **Authentication Error**: Show inline errors without closing modal
- **Network Error**: Provide retry mechanism with loading states

### Error Boundaries

```typescript
// Modal Error Boundary
interface ModalErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error }>
  onError: (error: Error) => void
}
```

### Error Recovery Strategies

1. **Graceful Degradation**: Fall back to full page if modal fails
2. **Retry Logic**: Allow users to retry failed authentication
3. **Error Persistence**: Maintain error state across modal/page transitions
4. **User Feedback**: Clear error messages with actionable guidance

## Testing Strategy

### Unit Tests

- **Modal Component**: Rendering, event handling, accessibility
- **Signin Form**: Authentication logic, error handling, callbacks
- **Route Interception**: URL handling, parameter passing
- **Error Boundaries**: Error catching and fallback rendering

### Integration Tests

- **Full Page Flow**: Direct navigation to signin page
- **Modal Flow**: Intercepted navigation from various pages
- **Authentication Success**: Redirect handling in both contexts
- **Authentication Failure**: Error display and recovery
- **Mobile Responsiveness**: Touch interactions and viewport handling

### E2E Tests

- **User Journey**: Complete signin flow from different entry points
- **Cross-Browser**: Modal behavior across different browsers
- **Accessibility**: Screen reader navigation and keyboard controls
- **Performance**: Modal rendering speed and smooth transitions

### Test Scenarios

```typescript
describe('Parallel Interceptor Auth Routing', () => {
  describe('Modal Signin', () => {
    it('should intercept signin links and show modal')
    it('should handle modal dismissal correctly')
    it('should preserve page state behind modal')
    it('should handle authentication success in modal context')
  })

  describe('Full Page Signin', () => {
    it('should show full page for direct navigation')
    it('should handle authentication success with proper redirect')
    it('should maintain existing functionality')
  })

  describe('Error Handling', () => {
    it('should fallback to full page if modal fails')
    it('should display errors appropriately in each context')
  })
})
```

### Accessibility Testing

- **Focus Management**: Proper focus trapping in modal
- **Keyboard Navigation**: ESC key handling, tab order
- **Screen Reader**: Proper ARIA labels and announcements
- **Color Contrast**: Sufficient contrast for modal overlay
- **Mobile Accessibility**: Touch target sizes and gestures

## Implementation Notes

### Next.js Specific Considerations

- **App Router**: Leverages latest routing features
- **Server Components**: Maintains server-side rendering where possible
- **Client Components**: Minimal client-side JavaScript for interactivity
- **Route Groups**: Proper organization of interceptor routes

### Performance Optimizations

- **Code Splitting**: Modal components loaded on demand
- **Preloading**: Signin form preloaded for faster modal display
- **Caching**: Proper cache headers for static modal assets
- **Bundle Size**: Minimal additional JavaScript for modal functionality

### Browser Compatibility

- **Modern Browsers**: Full feature support
- **Legacy Browsers**: Graceful degradation to full page
- **Mobile Browsers**: Touch-optimized modal interactions
- **Safari**: Proper handling of viewport and scroll behavior
