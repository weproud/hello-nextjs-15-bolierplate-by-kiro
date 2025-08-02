# 에디터 컴포넌트 문서

TipTap 기반의 리치 텍스트 에디터 컴포넌트들입니다. 블로그 포스트 작성과 콘텐츠 편집을 위한 완전한
에디터 솔루션을 제공합니다.

## 주요 컴포넌트

### TiptapEditor

메인 리치 텍스트 에디터 컴포넌트입니다.

```typescript
import { TiptapEditor } from '@/components/editor/tiptap-editor'

// 기본 사용법
<TiptapEditor
  content=""
  onChange={(content) => console.log(content)}
/>

// 초기 콘텐츠와 함께
<TiptapEditor
  content="<p>초기 콘텐츠</p>"
  onChange={(content) => setContent(content)}
  placeholder="여기에 내용을 입력하세요..."
/>

// 읽기 전용 모드
<TiptapEditor
  content={savedContent}
  editable={false}
/>

// 커스텀 설정
<TiptapEditor
  content=""
  onChange={handleChange}
  minHeight={200}
  maxHeight={600}
  showWordCount={true}
  enableCollaboration={false}
/>
```

**Props:**

- `content: string` - 에디터 초기 콘텐츠 (HTML 형식)
- `onChange: (content: string) => void` - 콘텐츠 변경 콜백
- `placeholder?: string` - 플레이스홀더 텍스트
- `editable?: boolean` - 편집 가능 여부 (기본값: true)
- `minHeight?: number` - 최소 높이 (px)
- `maxHeight?: number` - 최대 높이 (px)
- `showWordCount?: boolean` - 단어 수 표시 여부
- `enableCollaboration?: boolean` - 협업 기능 활성화
- `className?: string` - 추가 CSS 클래스

### EditorToolbar

에디터 도구 모음 컴포넌트입니다.

```typescript
import { EditorToolbar } from '@/components/editor/editor-toolbar'
import { useEditor } from '@tiptap/react'

function MyEditor() {
  const editor = useEditor({
    // 에디터 설정
  })

  return (
    <div>
      <EditorToolbar editor={editor} />
      <div className="editor-content">
        {/* 에디터 콘텐츠 */}
      </div>
    </div>
  )
}

// 커스텀 도구 모음
<EditorToolbar
  editor={editor}
  tools={[
    'bold', 'italic', 'underline',
    'heading', 'bulletList', 'orderedList',
    'link', 'image', 'code'
  ]}
/>

// 그룹화된 도구 모음
<EditorToolbar
  editor={editor}
  groups={[
    {
      name: '텍스트 서식',
      tools: ['bold', 'italic', 'underline', 'strikethrough']
    },
    {
      name: '제목',
      tools: ['heading1', 'heading2', 'heading3']
    },
    {
      name: '목록',
      tools: ['bulletList', 'orderedList', 'taskList']
    }
  ]}
/>
```

**Props:**

- `editor: Editor | null` - TipTap 에디터 인스턴스
- `tools?: string[]` - 표시할 도구 목록
- `groups?: ToolGroup[]` - 그룹화된 도구 설정
- `compact?: boolean` - 컴팩트 모드
- `className?: string` - 추가 CSS 클래스

## 지원 기능

### 텍스트 서식

```typescript
// 기본 텍스트 서식
- 굵게 (Bold) - Ctrl+B
- 기울임 (Italic) - Ctrl+I
- 밑줄 (Underline) - Ctrl+U
- 취소선 (Strikethrough)
- 코드 (Inline Code) - Ctrl+E

// 제목
- 제목 1 (H1) - Ctrl+Alt+1
- 제목 2 (H2) - Ctrl+Alt+2
- 제목 3 (H3) - Ctrl+Alt+3
- 제목 4 (H4) - Ctrl+Alt+4
- 제목 5 (H5) - Ctrl+Alt+5
- 제목 6 (H6) - Ctrl+Alt+6
```

### 목록과 구조

```typescript
// 목록
- 글머리 기호 목록 - Ctrl+Shift+8
- 번호 매기기 목록 - Ctrl+Shift+7
- 작업 목록 (체크박스)

// 구조 요소
- 인용구 - Ctrl+Shift+B
- 코드 블록 - Ctrl+Alt+C
- 구분선 (Horizontal Rule)
- 표 (Table)
```

### 링크와 미디어

```typescript
// 링크
<TiptapEditor
  content=""
  onChange={handleChange}
  onLinkAdd={(url, text) => {
    // 링크 추가 처리
  }}
/>

// 이미지
<TiptapEditor
  content=""
  onChange={handleChange}
  onImageUpload={async (file) => {
    const url = await uploadImage(file)
    return url
  }}
/>

// 임베드 콘텐츠
- YouTube 비디오
- Twitter 트윗
- CodePen 임베드
```

### 고급 기능

```typescript
// 협업 기능
<TiptapEditor
  content=""
  onChange={handleChange}
  enableCollaboration={true}
  collaborationConfig={{
    appId: 'your-app-id',
    token: 'your-token',
    document: 'document-id'
  }}
/>

// 자동 저장
<TiptapEditor
  content=""
  onChange={handleChange}
  autoSave={{
    enabled: true,
    delay: 2000,
    onSave: async (content) => {
      await saveContent(content)
    }
  }}
/>

// 버전 관리
<TiptapEditor
  content=""
  onChange={handleChange}
  enableVersioning={true}
  onVersionSave={(version) => {
    // 버전 저장 처리
  }}
/>
```

## 커스터마이징

### 커스텀 확장 기능

```typescript
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  addCommands() {
    return {
      customCommand: () => ({ commands }) => {
        // 커스텀 명령 구현
        return true
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.editor.commands.customCommand()
    }
  }
})

// 에디터에 확장 기능 추가
<TiptapEditor
  content=""
  onChange={handleChange}
  extensions={[CustomExtension]}
/>
```

### 커스텀 스타일링

```css
/* 에디터 스타일 커스터마이징 */
.tiptap-editor {
  /* 에디터 컨테이너 스타일 */
}

.tiptap-editor .ProseMirror {
  /* 에디터 콘텐츠 영역 스타일 */
  outline: none;
  padding: 1rem;
  min-height: 200px;
}

.tiptap-editor .ProseMirror h1 {
  /* 제목 1 스타일 */
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
}

.tiptap-editor .ProseMirror blockquote {
  /* 인용구 스타일 */
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}
```

### 커스텀 도구 버튼

```typescript
import { Button } from '@/components/ui/button'

function CustomToolButton({
  editor,
  command,
  icon,
  tooltip
}: {
  editor: Editor | null
  command: string
  icon: ReactNode
  tooltip: string
}) {
  const handleClick = () => {
    if (editor) {
      editor.chain().focus()[command]().run()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={editor?.isActive(command) ? 'bg-accent' : ''}
      title={tooltip}
    >
      {icon}
    </Button>
  )
}
```

## 폼 통합

### React Hook Form과 통합

```typescript
import { useForm, Controller } from 'react-hook-form'
import { TiptapEditor } from '@/components/editor/tiptap-editor'

interface FormData {
  title: string
  content: string
}

function PostForm() {
  const { control, handleSubmit } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log('제목:', data.title)
    console.log('내용:', data.content)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="title" placeholder="제목을 입력하세요" />

      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <TiptapEditor
            content={field.value || ''}
            onChange={field.onChange}
            placeholder="내용을 입력하세요..."
          />
        )}
      />

      <button type="submit">저장</button>
    </form>
  )
}
```

### Zod 스키마 검증

```typescript
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(10, '내용을 10자 이상 입력해주세요'),
})

// HTML 태그 제거 후 텍스트 길이 검증
const contentSchema = z.string().refine(
  content => {
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    return textContent.length >= 10
  },
  { message: '내용을 10자 이상 입력해주세요' }
)
```

## 접근성 기능

### 키보드 네비게이션

```typescript
// 기본 키보드 단축키
- Ctrl+B: 굵게
- Ctrl+I: 기울임
- Ctrl+U: 밑줄
- Ctrl+Z: 실행 취소
- Ctrl+Y: 다시 실행
- Ctrl+A: 전체 선택
- Tab: 들여쓰기
- Shift+Tab: 내어쓰기

// 커스텀 키보드 단축키 추가
<TiptapEditor
  content=""
  onChange={handleChange}
  keyboardShortcuts={{
    'Mod-s': () => {
      // 저장 단축키
      handleSave()
      return true
    },
    'Mod-/': () => {
      // 도움말 단축키
      showHelp()
      return true
    }
  }}
/>
```

### 스크린 리더 지원

```typescript
<TiptapEditor
  content=""
  onChange={handleChange}
  ariaLabel="블로그 포스트 내용 편집기"
  ariaDescription="리치 텍스트 에디터입니다. 도구 모음을 사용하여 텍스트를 서식화할 수 있습니다."
/>
```

## 성능 최적화

### 지연 로딩

```typescript
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(
  () => import('@/components/editor/tiptap-editor'),
  {
    loading: () => <div>에디터 로딩 중...</div>,
    ssr: false
  }
)
```

### 메모이제이션

```typescript
import { memo, useMemo } from 'react'

const OptimizedEditor = memo(function OptimizedEditor({
  content,
  onChange
}: {
  content: string
  onChange: (content: string) => void
}) {
  const editorConfig = useMemo(() => ({
    content,
    extensions: [
      // 확장 기능들
    ]
  }), [content])

  return (
    <TiptapEditor
      {...editorConfig}
      onChange={onChange}
    />
  )
})
```

## 테스트 예제

### 에디터 컴포넌트 테스트

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TiptapEditor } from '../tiptap-editor'

describe('TiptapEditor', () => {
  it('초기 콘텐츠를 올바르게 렌더링한다', () => {
    render(
      <TiptapEditor
        content="<p>테스트 콘텐츠</p>"
        onChange={() => {}}
      />
    )

    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument()
  })

  it('텍스트 입력 시 onChange가 호출된다', async () => {
    const handleChange = vi.fn()
    render(
      <TiptapEditor
        content=""
        onChange={handleChange}
      />
    )

    const editor = screen.getByRole('textbox')
    await userEvent.type(editor, '새로운 텍스트')

    expect(handleChange).toHaveBeenCalled()
  })

  it('굵게 버튼이 작동한다', async () => {
    render(
      <TiptapEditor
        content=""
        onChange={() => {}}
      />
    )

    const boldButton = screen.getByTitle('굵게')
    await userEvent.click(boldButton)

    expect(boldButton).toHaveClass('bg-accent')
  })
})
```

## 문제 해결

### 일반적인 문제들

1. **에디터가 로드되지 않는 경우**
   - SSR 환경에서는 `ssr: false` 옵션 사용
   - 동적 임포트로 클라이언트에서만 로드

2. **스타일이 적용되지 않는 경우**
   - TipTap CSS 파일이 올바르게 임포트되었는지 확인
   - 커스텀 스타일의 CSS 우선순위 확인

3. **협업 기능이 작동하지 않는 경우**
   - WebSocket 연결 상태 확인
   - 서버 설정과 클라이언트 설정 일치 여부 확인

4. **성능 문제**
   - 큰 문서의 경우 가상화 고려
   - 불필요한 확장 기능 제거
   - 디바운싱을 통한 onChange 최적화

### 디버깅 팁

```typescript
// 에디터 상태 디버깅
console.log('Editor state:', editor?.getJSON())
console.log('Editor HTML:', editor?.getHTML())
console.log('Editor text:', editor?.getText())

// 확장 기능 디버깅
console.log('Active extensions:', editor?.extensionManager.extensions)
```
