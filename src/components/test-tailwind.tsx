import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export function TestTailwindComponent() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Tailwind CSS Variables Test
        </h2>
        <ThemeToggle />
      </div>

      {/* Background and foreground colors */}
      <div className="bg-background text-foreground p-4 border border-border rounded-lg">
        Background and foreground colors
      </div>

      {/* Primary colors */}
      <div className="bg-primary text-primary-foreground p-4 rounded-lg">
        Primary background with primary foreground
      </div>

      {/* Secondary colors */}
      <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
        Secondary background with secondary foreground
      </div>

      {/* Muted colors */}
      <div className="bg-muted text-muted-foreground p-4 rounded-lg">
        Muted background with muted foreground
      </div>

      {/* Accent colors */}
      <div className="bg-accent text-accent-foreground p-4 rounded-lg">
        Accent background with accent foreground
      </div>

      {/* Card component */}
      <div className="bg-card text-card-foreground p-4 border border-border rounded-lg shadow-sm">
        Card background with card foreground
      </div>

      {/* Destructive colors */}
      <div className="bg-destructive text-destructive-foreground p-4 rounded-lg">
        Destructive background with destructive foreground
      </div>

      {/* Border radius test */}
      <div className="bg-primary text-primary-foreground p-4 space-y-2">
        <div className="bg-secondary text-secondary-foreground p-2 rounded-lg">
          Large radius
        </div>
        <div className="bg-secondary text-secondary-foreground p-2 rounded-md">
          Medium radius
        </div>
        <div className="bg-secondary text-secondary-foreground p-2 rounded-sm">
          Small radius
        </div>
      </div>

      {/* Input styling test */}
      <input
        type="text"
        placeholder="Test input with CSS variables"
        className="w-full p-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
      />

      {/* shadcn/ui Button components test */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          shadcn/ui Button Variants
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🎨</Button>
        </div>
      </div>

      {/* shadcn/ui Card component test */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>shadcn/ui Card</CardTitle>
            <CardDescription>
              This is a card component built with shadcn/ui using CSS variables
              for theming.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The card automatically adapts to light and dark themes using CSS
              variables.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Support</CardTitle>
            <CardDescription>
              Click the theme toggle button to switch between light and dark
              modes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All components use the same CSS variable system for consistent
              theming.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
