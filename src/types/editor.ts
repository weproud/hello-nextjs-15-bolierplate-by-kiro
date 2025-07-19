import type { Editor } from '@tiptap/react'

// Tiptap 에디터 관련 타입 정의
export interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

export interface TiptapEditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  clear: () => void
}

export interface EditorToolbarProps {
  editor: Editor | null
  className?: string
}

// 툴바 버튼 타입
export interface ToolbarButton {
  type:
    | 'heading'
    | 'bold'
    | 'italic'
    | 'bulletList'
    | 'orderedList'
    | 'undo'
    | 'redo'
  level?: 1 | 2 | 3 // 헤딩 레벨
  icon: string
  label?: string
}

// 에디터 확장 설정 타입
export interface EditorExtensionConfig {
  heading: {
    levels: number[]
  }
  starterKit: {
    bold: boolean
    italic: boolean
    strike: boolean
    code: boolean
    bulletList: boolean
    orderedList: boolean
    listItem: boolean
    history: boolean
  }
}

// 에디터 상태 타입
export interface EditorState {
  isLoading: boolean
  hasChanges: boolean
  lastSaved?: Date
  error?: string
}
