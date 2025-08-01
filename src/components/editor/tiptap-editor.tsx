'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Placeholder from '@tiptap/extension-placeholder'
import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  lazy,
  Suspense,
} from 'react'
import { cn } from '@/lib/utils'
import type { TiptapEditorProps, TiptapEditorRef } from '@/types'

// Lazy load the editor toolbar for better performance
const EditorToolbar = lazy(() =>
  import('./editor-toolbar').then(module => ({
    default: module.EditorToolbar,
  }))
)

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  (
    {
      content,
      onChange,
      placeholder = '내용을 입력하세요...',
      editable = true,
      showToolbar = false,
      className,
    },
    ref
  ) => {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false, // Heading 확장을 별도로 설정하므로 비활성화
        }),
        Heading.configure({
          levels: [1, 2, 3], // H1, H2, H3 지원
        }),
        Placeholder.configure({
          placeholder,
        }),
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            'prose-headings:font-bold prose-headings:text-foreground',
            'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6',
            'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5',
            'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4',
            'prose-p:text-foreground prose-p:leading-7',
            'prose-strong:text-foreground prose-strong:font-semibold',
            'prose-em:text-foreground',
            'prose-ul:text-foreground prose-ol:text-foreground',
            'prose-li:text-foreground',
            'dark:prose-invert',
            'min-h-[200px] p-4'
          ),
        },
      },
    })

    useImperativeHandle(ref, () => ({
      getContent: () => editor?.getHTML() || '',
      setContent: (content: string) => {
        editor?.commands.setContent(content)
      },
      focus: () => {
        editor?.commands.focus()
      },
      clear: () => {
        editor?.commands.clearContent()
      },
      isEmpty: () => editor?.isEmpty || true,
      getHTML: () => editor?.getHTML() || '',
      getJSON: () => editor?.getJSON() || {},
      getCharacterCount: () =>
        editor?.storage.characterCount?.characters() || 0,
      getWordCount: () => editor?.storage.characterCount?.words() || 0,
    }))

    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content)
      }
    }, [content, editor])

    if (!editor) {
      return (
        <div
          className={cn(
            'min-h-[200px] p-4 border border-input rounded-md bg-background',
            'animate-pulse',
            className
          )}
        >
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className
        )}
      >
        {showToolbar && (
          <Suspense
            fallback={
              <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/50 h-12">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 bg-muted rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            }
          >
            <EditorToolbar editor={editor} />
          </Suspense>
        )}
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    )
  }
)

TiptapEditor.displayName = 'TiptapEditor'
