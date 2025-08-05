/**
 * Editor Type Definitions
 *
 * 에디터 관련 타입들을 정의합니다.
 */

import type { Editor } from '@tiptap/react'
import type { BaseComponentProps } from './common'

// Tiptap Editor Types - Tiptap 에디터 관련 타입들
export interface TiptapEditorProps extends BaseComponentProps {
  content: string
  onChange: (content: string) => void | Promise<void>
  placeholder?: string
  editable?: boolean
  showToolbar?: boolean
  onFocus?: () => void | Promise<void>
  onBlur?: () => void | Promise<void>
  onUpdate?: (content: string) => void | Promise<void>
}

export interface TiptapEditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  clear: () => void
  isEmpty: () => boolean
  getHTML: () => string
  getJSON: () => any
  getCharacterCount: () => number
  getWordCount: () => number
}

// Editor Toolbar Types - 에디터 툴바 타입들
export interface EditorToolbarProps extends BaseComponentProps {
  editor: Editor | null
  showAdvanced?: boolean
  compact?: boolean
}

export interface ToolbarButton {
  type:
    | 'heading'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strike'
    | 'code'
    | 'bulletList'
    | 'orderedList'
    | 'blockquote'
    | 'codeBlock'
    | 'horizontalRule'
    | 'link'
    | 'image'
    | 'table'
    | 'undo'
    | 'redo'
    | 'clear'
  level?: 1 | 2 | 3 | 4 | 5 | 6 // 헤딩 레벨
  icon: string
  label?: string
  shortcut?: string
  isActive?: (editor: Editor) => boolean
  action: (editor: Editor) => void
  disabled?: (editor: Editor) => boolean
}

export interface ToolbarGroup {
  name: string
  buttons: ToolbarButton[]
  separator?: boolean
}

// Editor Extension Configuration - 에디터 확장 설정 타입들
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
    blockquote: boolean
    codeBlock: boolean
    horizontalRule: boolean
    history: boolean
  }
  link: {
    openOnClick: boolean
    HTMLAttributes: {
      class?: string
      target?: string
      rel?: string
    }
  }
  image: {
    inline: boolean
    allowBase64: boolean
    HTMLAttributes: {
      class?: string
    }
  }
  table: {
    resizable: boolean
    handleWidth: number
    cellMinWidth: number
  }
  placeholder: {
    placeholder: string
    showOnlyWhenEditable: boolean
    showOnlyCurrent: boolean
  }
}

// Editor State Types - 에디터 상태 타입들
export interface EditorState {
  isLoading: boolean
  hasChanges: boolean
  lastSaved?: Date
  error?: string
  wordCount: number
  characterCount: number
  readingTime: number
}

export interface EditorHistory {
  canUndo: boolean
  canRedo: boolean
  undoDepth: number
  redoDepth: number
}

// Editor Content Types - 에디터 콘텐츠 타입들
export interface EditorContent {
  html: string
  json: any
  text: string
  markdown?: string
}

export interface EditorSelection {
  from: number
  to: number
  empty: boolean
  text: string
}

// Editor Plugin Types - 에디터 플러그인 타입들
export interface EditorPlugin {
  name: string
  version: string
  enabled: boolean
  config?: Record<string, any>
  dependencies?: string[]
}

export interface EditorPluginManager {
  plugins: EditorPlugin[]
  install: (plugin: EditorPlugin) => void
  uninstall: (pluginName: string) => void
  enable: (pluginName: string) => void
  disable: (pluginName: string) => void
  getPlugin: (pluginName: string) => EditorPlugin | undefined
}

// Editor Theme Types - 에디터 테마 타입들
export interface EditorTheme {
  name: string
  colors: {
    background: string
    foreground: string
    border: string
    selection: string
    cursor: string
  }
  typography: {
    fontFamily: string
    fontSize: string
    lineHeight: string
  }
  spacing: {
    padding: string
    margin: string
  }
}

// Editor Shortcut Types - 에디터 단축키 타입들
export interface EditorShortcut {
  key: string
  description: string
  action: (editor: Editor) => void
  category: 'formatting' | 'navigation' | 'editing' | 'misc'
}

export interface EditorShortcutGroup {
  category: string
  shortcuts: EditorShortcut[]
}

// Editor Menu Types - 에디터 메뉴 타입들
export interface EditorMenuItem {
  type: 'button' | 'dropdown' | 'separator'
  label?: string
  icon?: string
  action?: (editor: Editor) => void
  items?: EditorMenuItem[]
  disabled?: (editor: Editor) => boolean
  active?: (editor: Editor) => boolean
}

export interface EditorMenu {
  items: EditorMenuItem[]
  position: 'top' | 'bottom' | 'floating'
  sticky?: boolean
}

// Editor Collaboration Types - 에디터 협업 타입들
export interface EditorCollaborationUser {
  id: string
  name: string
  color: string
  cursor?: {
    from: number
    to: number
  }
}

export interface EditorCollaborationState {
  users: EditorCollaborationUser[]
  isConnected: boolean
  roomId: string
  version: number
}

// Editor Auto-save Types - 에디터 자동 저장 타입들
export interface EditorAutoSaveConfig {
  enabled: boolean
  interval: number // milliseconds
  onSave: (content: EditorContent) => Promise<void>
  onError: (error: Error) => void
}

export interface EditorAutoSaveState {
  lastSaved?: Date
  isSaving: boolean
  hasUnsavedChanges: boolean
  error?: string
}

// Editor Validation Types - 에디터 유효성 검사 타입들
export interface EditorValidationRule {
  name: string
  validate: (content: EditorContent) => boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface EditorValidationResult {
  isValid: boolean
  errors: EditorValidationRule[]
  warnings: EditorValidationRule[]
  info: EditorValidationRule[]
}

// Editor Export Types - 에디터 내보내기 타입들
export interface EditorExportOptions {
  format: 'html' | 'markdown' | 'json' | 'text' | 'pdf'
  includeStyles: boolean
  minify: boolean
  metadata?: Record<string, any>
}

export interface EditorExportResult {
  content: string | Buffer
  filename: string
  mimeType: string
  size: number
}

// Editor Import Types - 에디터 가져오기 타입들
export interface EditorImportOptions {
  format: 'html' | 'markdown' | 'json' | 'text'
  sanitize: boolean
  preserveFormatting: boolean
}

export interface EditorImportResult {
  content: EditorContent
  warnings: string[]
  errors: string[]
}

// Editor Event Types - 에디터 이벤트 타입들
export interface EditorEvent {
  type: string
  timestamp: Date
  data?: any
}

export interface EditorEventHandlers {
  onCreate?: (editor: Editor) => void | Promise<void>
  onUpdate?: (editor: Editor) => void | Promise<void>
  onSelectionUpdate?: (editor: Editor) => void | Promise<void>
  onFocus?: (editor: Editor) => void | Promise<void>
  onBlur?: (editor: Editor) => void | Promise<void>
  onDestroy?: () => void | Promise<void>
}

// Editor Performance Types - 에디터 성능 타입들
export interface EditorPerformanceMetrics {
  renderTime: number
  updateTime: number
  memoryUsage: number
  nodeCount: number
  characterCount: number
}

export interface EditorPerformanceConfig {
  enableMetrics: boolean
  logThreshold: number
  optimizeRendering: boolean
  debounceDelay: number
}
