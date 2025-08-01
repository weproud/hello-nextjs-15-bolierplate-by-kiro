'use client'

import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import type { EditorToolbarProps } from '@/types'

interface ToolbarButton {
  type: string
  level?: number
  icon?: LucideIcon
  label: string
  isActive?: () => boolean
  onClick?: () => void
  disabled?: () => boolean
}

interface ToolbarSeparator {
  type: 'separator'
}

// 타입 가드 함수
const isToolbarButton = (
  item: ToolbarButton | ToolbarSeparator
): item is ToolbarButton => {
  return item.type !== 'separator'
}

export const EditorToolbar = ({ editor, className }: EditorToolbarProps) => {
  if (!editor) {
    return null
  }

  const toolbarButtons: (ToolbarButton | ToolbarSeparator)[] = [
    {
      type: 'heading',
      level: 1,
      icon: Heading1,
      label: 'H1',
      isActive: () => editor.isActive('heading', { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      type: 'heading',
      level: 2,
      icon: Heading2,
      label: 'H2',
      isActive: () => editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      type: 'heading',
      level: 3,
      icon: Heading3,
      label: 'H3',
      isActive: () => editor.isActive('heading', { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      type: 'separator',
    },
    {
      type: 'bold',
      icon: Bold,
      label: '굵게',
      isActive: () => editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      type: 'italic',
      icon: Italic,
      label: '기울임',
      isActive: () => editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      type: 'separator',
    },
    {
      type: 'bulletList',
      icon: List,
      label: '순서 없는 목록',
      isActive: () => editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      type: 'orderedList',
      icon: ListOrdered,
      label: '순서 있는 목록',
      isActive: () => editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      type: 'separator',
    },
    {
      type: 'undo',
      icon: Undo,
      label: '실행 취소',
      isActive: () => false,
      onClick: () => editor.chain().focus().undo().run(),
      disabled: () => !editor.can().undo(),
    },
    {
      type: 'redo',
      icon: Redo,
      label: '다시 실행',
      isActive: () => false,
      onClick: () => editor.chain().focus().redo().run(),
      disabled: () => !editor.can().redo(),
    },
  ]

  return (
    <div
      className={cn(
        'flex items-center gap-1 p-2 border-b border-border bg-muted/50',
        className
      )}
    >
      {toolbarButtons.map((item, index) => {
        if (!isToolbarButton(item)) {
          return (
            <Separator
              key={`separator-${index}`}
              orientation="vertical"
              className="h-6 mx-1"
            />
          )
        }

        const button = item as ToolbarButton
        const Icon = button.icon!
        const isActive = button.isActive?.()
        const isDisabled = button.disabled?.()

        return (
          <Button
            key={button.type + (button.level || '')}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={button.onClick}
            disabled={isDisabled}
            className={cn(
              'h-8 w-8 p-0',
              isActive && 'bg-primary text-primary-foreground',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            title={button.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}
