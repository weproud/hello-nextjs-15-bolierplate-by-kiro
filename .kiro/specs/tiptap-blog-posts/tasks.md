# 구현 계획

- [x] 1. 프로젝트 설정 및 의존성 설치
  - pnpm을 사용하여 Tiptap 관련 패키지 설치 (@tiptap/react, @tiptap/pm, @tiptap/starter-kit,
    @tiptap/extension-heading)
  - 필요한 shadcn/ui 컴포넌트 추가 설치 (필요시)
  - TypeScript 타입 정의 파일 생성
  - _요구사항: 1.1, 1.8_

- [x] 2. 데이터베이스 스키마 확장 및 마이그레이션
  - Prisma 스키마에 Post 모델 추가 (id, title, content, createdAt, updatedAt, authorId 필드 포함)
  - User 모델과 Post 모델 간 관계 설정 (1:N 관계)
  - 데이터베이스 마이그레이션 파일 생성 및 실행
  - 인덱스 설정 (authorId, createdAt 등)
  - _요구사항: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. 기본 Tiptap 에디터 컴포넌트 구현
  - TiptapEditor 컴포넌트 생성 (src/components/editor/tiptap-editor.tsx)
  - StarterKit 확장 설정 (볼드, 이탤릭, 리스트 기능 포함)
  - Heading 확장 설정 (H1, H2, H3 지원)
  - 기본 에디터 스타일링 적용
  - _요구사항: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 4. 포스트 타입 정의 구현
  - src/types/post.ts의 Post 인터페이스와 Prisma 스키마 일치성 확인
  - PostFormData, PostCardProps 등 관련 타입 정의 완료
  - _요구사항: 2.1, 2.2_

- [x] 5. 에디터 툴바 컴포넌트 타입 에러 수정
  - EditorToolbar 컴포넌트의 TypeScript 타입 에러 수정
  - 툴바 버튼과 구분자 타입 분리 처리
  - 타입 가드 함수 추가하여 안전한 타입 체크
  - _요구사항: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1_

- [x] 6. 포스트 유효성 검사 스키마 구현
  - src/lib/validations/post.ts 파일 생성
  - 포스트 생성/수정을 위한 Zod 스키마 정의
  - 제목 및 내용 필드 검증 규칙 설정
  - 에러 메시지 한국어 지원
  - _요구사항: 3.5, 3.6_

- [x] 7. 포스트 CRUD Server Actions 구현
  - src/lib/actions/post-actions.ts 파일 생성
  - createPost Server Action 구현 (타입 안전한 데이터 처리)
  - updatePost Server Action 구현 (작성자 권한 검증 포함)
  - deletePost Server Action 구현 (작성자 권한 검증 포함)
  - getPost Server Action 구현
  - getPosts Server Action 구현 (페이지네이션 지원)
  - Zod 스키마를 사용한 입력 검증
  - _요구사항: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1_

- [x] 8. 포스트 컴포넌트 디렉토리 생성 및 기본 구조 설정
  - src/components/posts/ 디렉토리 생성
  - 포스트 관련 컴포넌트들을 위한 기본 구조 설정
  - _요구사항: 프로젝트 구조 정리_

- [x] 9. 포스트 폼 컴포넌트 구현
  - src/components/posts/post-form.tsx 파일 생성
  - TiptapEditor와 통합된 포스트 작성/편집 폼
  - React Hook Form과 Zod 검증 통합
  - 로딩 상태 및 에러 처리
  - 자동 저장 기능 (선택사항)
  - _요구사항: 3.1, 3.2, 5.4, 5.5_

- [x] 10. 포스트 카드 컴포넌트 구현
  - src/components/posts/post-card.tsx 파일 생성
  - 제목, 요약, 작성일, 작성자 정보 표시
  - shadcn/ui Card 컴포넌트 사용
  - 프로젝트 기존 그리드 레이아웃 패턴 적용
  - 다크 테마 스타일링
  - _요구사항: 4.3, 4.6, 5.1, 5.2_

- [x] 11. 무한 스크롤 훅 구현
  - src/hooks/use-infinite-posts.ts 파일 생성
  - Intersection Observer API 사용
  - 로딩 상태 관리
  - 에러 상태 처리
  - 더 이상 로드할 데이터가 없을 때 처리
  - _요구사항: 4.2, 4.4, 4.5_

- [x] 12. 무한 스크롤 포스트 목록 컴포넌트 구현
  - src/components/posts/infinite-post-list.tsx 파일 생성
  - useInfinitePosts 훅 통합
  - 스켈레톤 로더 구현
  - "더 이상 포스트가 없습니다" 메시지 표시
  - _요구사항: 4.1, 4.2, 4.4, 4.5, 5.4_

- [x] 13. 포스트 작성 페이지 구현
  - src/app/posts/new/page.tsx 생성
  - PostForm 컴포넌트 통합
  - 인증 미들웨어 적용 (비인증 사용자 리다이렉트)
  - 폼 제출 시 Server Action 호출
  - 로딩 상태 및 에러 처리
  - _요구사항: 3.1, 6.2, 6.3, 5.4, 5.5_

- [x] 14. 포스트 편집 페이지 구현
  - src/app/posts/[id]/edit/page.tsx 생성
  - 기존 포스트 데이터 로드 및 에디터에 설정
  - 작성자 권한 검증 (다른 사용자 포스트 편집 방지)
  - 수정된 내용 저장 기능
  - 404 페이지 처리 (존재하지 않는 포스트)
  - _요구사항: 3.2, 3.3, 6.4, 6.5, 6.6_

- [x] 15. 포스트 상세 페이지 구현
  - src/app/posts/[id]/page.tsx 생성
  - 포스트 내용 렌더링 (HTML 콘텐츠 안전하게 표시)
  - 작성자 정보 및 메타데이터 표시
  - 편집/삭제 버튼 (작성자만 표시)
  - 반응형 레이아웃 적용
  - _요구사항: 6.4, 5.3, 5.6_

- [ ] 16. 포스트 목록 페이지 업데이트
  - 기존 src/app/posts/page.tsx를 실제 포스트 목록 페이지로 변경 (현재 에디터 테스트 페이지임)
  - InfinitePostList 컴포넌트 통합
  - 무한 스크롤 기능 적용
  - _요구사항: 4.1, 4.2, 4.4, 4.5, 5.4_

- [ ] 17. 에디터 테스트 페이지를 별도 경로로 이동
  - 현재 /posts에 있는 에디터 테스트를 /posts/editor-test로 이동
  - EditorTest 컴포넌트를 개발용 테스트 페이지로 유지
  - _요구사항: 개발 및 테스트 편의성_

- [ ] 18. 라우팅 구조 및 네비게이션 설정
  - Next.js App Router 패턴 준수
  - 포스트 관련 라우트 설정 확인
  - 네비게이션 메뉴에 포스트 링크 추가
  - 브레드크럼 네비게이션 구현
  - _요구사항: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_

- [ ] 19. 권한 관리 및 보안 구현
  - 포스트 작성/편집 권한 검증 미들웨어
  - 작성자 본인만 편집/삭제 가능하도록 제한
  - XSS 방지를 위한 HTML 새니타이제이션
  - CSRF 보호 적용
  - _요구사항: 3.3, 6.3_

- [ ] 20. 반응형 디자인 구현
  - 모바일 디바이스 대응 스타일링
  - 태블릿 디바이스 레이아웃 최적화
  - 에디터 모바일 사용성 개선
  - 터치 인터페이스 최적화
  - _요구사항: 5.3_

- [ ] 21. 로딩 상태 및 에러 처리 구현
  - 전역 에러 바운더리 설정
  - 포스트별 에러 페이지 구현
  - 로딩 스피너 및 스켈레톤 UI
  - 네트워크 에러 처리
  - 사용자 친화적 에러 메시지
  - _요구사항: 5.4, 5.5_

- [ ] 22. 성능 최적화 구현
  - 에디터 컴포넌트 동적 로딩
  - 이미지 최적화 (Next.js Image 컴포넌트)
  - 메모이제이션 적용 (React.memo, useMemo)
  - 번들 크기 최적화
  - _요구사항: 설계 문서의 성능 최적화 섹션_

- [ ] 23. 통합 테스트 작성
  - 포스트 CRUD 기능 테스트
  - 에디터 컴포넌트 테스트
  - 무한 스크롤 기능 테스트
  - 권한 검증 테스트
  - E2E 테스트 시나리오 작성
  - _요구사항: 모든 기능 요구사항 검증_
