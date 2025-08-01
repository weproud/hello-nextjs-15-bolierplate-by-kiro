/**
 * UI Components Index
 *
 * shadcn/ui 기반 UI 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core UI Components
export { Button, buttonVariants } from './button'
export { Input, inputVariants } from './input'
export { Textarea } from './textarea'
export { Label } from './label'
export { Badge, badgeVariants } from './badge'
export { Avatar, AvatarImage, AvatarFallback } from './avatar'
export { Spinner, spinnerVariants } from './spinner'
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  skeletonVariants,
} from './skeleton'

// Layout Components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card'

// Form Components
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from './form'

export {
  FormField as EnhancedFormField,
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
} from './form-field'

export { FormError } from './form-error'

// Interactive Components
export { Checkbox } from './checkbox'
export { Switch } from './switch'
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select'

// Feedback Components
export { Alert, AlertTitle, AlertDescription, alertVariants } from './alert'
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'

export { Progress } from './progress'
export { ProgressIndicators } from './progress-indicators'

// Navigation Components
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu'

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from './menubar'

// Layout & Structure Components
export { Separator } from './separator'
export { AspectRatio } from './aspect-ratio'
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './collapsible'

// Overlay Components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog'

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet'

export { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip'

// Sidebar Components
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar'

// Data Display Components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table'

// Specialized Components
export { SelectableCard } from './selectable-card'
export { SkeletonComponents } from './skeleton-components'
export { Logo } from './logo'
export { Sonner } from './sonner'

// Variant Systems
export { variants } from './variants'
