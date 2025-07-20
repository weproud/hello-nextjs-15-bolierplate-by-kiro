'use client'

import { useState } from 'react'
import { TiptapEditor } from './tiptap-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EditorTest() {
  const [content, setContent] = useState(
    '<h1>안녕하세요!</h1><p>이것은 Tiptap 에디터 테스트입니다.</p>'
  )

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const clearContent = () => {
    setContent('')
  }

  const setTestContent = () => {
    setContent(`
      <h1>제목 1</h1>
      <p>이것은 일반 텍스트입니다.</p>
      <h2>제목 2</h2>
      <p>이것은 <strong>굵은 텍스트</strong>와 <em>기울임 텍스트</em>입니다.</p>
      <h3>제목 3</h3>
      <ul>
        <li>순서 없는 목록 항목 1</li>
        <li>순서 없는 목록 항목 2</li>
      </ul>
      <ol>
        <li>순서 있는 목록 항목 1</li>
        <li>순서 있는 목록 항목 2</li>
      </ol>
    `)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tiptap 에디터 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={setTestContent} variant="outline">
              테스트 콘텐츠 로드
            </Button>
            <Button onClick={clearContent} variant="outline">
              내용 지우기
            </Button>
          </div>

          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            placeholder="여기에 내용을 입력하세요..."
            showToolbar={true}
            className="min-h-[300px]"
          />

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">HTML 출력:</h3>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
              {content}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
