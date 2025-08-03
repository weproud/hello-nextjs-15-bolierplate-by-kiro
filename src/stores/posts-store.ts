import type { PaginationMeta } from '@/types'
import type { Post } from '@prisma/client'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createStore } from 'zustand/vanilla'

// Post with author information
export interface PostWithAuthor extends Post {
  author: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// Posts state interface
export interface PostsState {
  // Data
  posts: PostWithAuthor[]
  currentPost: PostWithAuthor | null

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Error states
  error: string | null

  // Pagination
  pagination: PaginationMeta

  // Filters
  filters: {
    search: string
    published?: boolean
    authorId?: string
  }

  // Actions
  setPosts: (posts: PostWithAuthor[]) => void
  addPost: (post: PostWithAuthor) => void
  updatePost: (id: string, updates: Partial<PostWithAuthor>) => void
  removePost: (id: string) => void
  setCurrentPost: (post: PostWithAuthor | null) => void

  // Loading actions
  setLoading: (loading: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void
  setDeleting: (deleting: boolean) => void

  // Error actions
  setError: (error: string | null) => void

  // Pagination actions
  setPagination: (pagination: PaginationMeta) => void
  setPage: (page: number) => void

  // Filter actions
  setFilters: (filters: Partial<PostsState['filters']>) => void
  setSearch: (search: string) => void
  clearFilters: () => void

  // Reset action
  resetState: () => void
}

// Initial state
const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {
    search: '',
    published: undefined,
    authorId: undefined,
  },
}

export type PostsStore = ReturnType<typeof createPostsStore>

// Create posts store factory
export const createPostsStore = () => {
  return createStore<PostsState>()(
    devtools(
      immer(set => ({
        ...initialState,

        // Data actions
        setPosts: (posts: PostWithAuthor[]) =>
          set(state => {
            state.posts = posts
          }),

        addPost: (post: PostWithAuthor) =>
          set(state => {
            state.posts.unshift(post)
            state.pagination.totalCount += 1
          }),

        updatePost: (id: string, updates: Partial<PostWithAuthor>) =>
          set(state => {
            const index = state.posts.findIndex(p => p.id === id)
            if (index !== -1) {
              state.posts[index] = {
                ...state.posts[index],
                ...updates,
              } as PostWithAuthor
            }

            // 현재 포스트도 업데이트
            if (state.currentPost?.id === id) {
              state.currentPost = {
                ...state.currentPost,
                ...updates,
              } as PostWithAuthor
            }
          }),

        removePost: (id: string) =>
          set(state => {
            state.posts = state.posts.filter(p => p.id !== id)
            state.pagination.totalCount = Math.max(
              0,
              state.pagination.totalCount - 1
            )

            // 현재 포스트가 삭제된 포스트라면 초기화
            if (state.currentPost?.id === id) {
              state.currentPost = null
            }
          }),

        setCurrentPost: (post: PostWithAuthor | null) =>
          set(state => {
            state.currentPost = post
          }),

        // Loading actions
        setLoading: (loading: boolean) =>
          set(state => {
            state.isLoading = loading
          }),

        setCreating: (creating: boolean) =>
          set(state => {
            state.isCreating = creating
          }),

        setUpdating: (updating: boolean) =>
          set(state => {
            state.isUpdating = updating
          }),

        setDeleting: (deleting: boolean) =>
          set(state => {
            state.isDeleting = deleting
          }),

        // Error actions
        setError: (error: string | null) =>
          set(state => {
            state.error = error
          }),

        // Pagination actions
        setPagination: (pagination: PaginationMeta) =>
          set(state => {
            state.pagination = pagination
          }),

        setPage: (page: number) =>
          set(state => {
            state.pagination.page = page
          }),

        // Filter actions
        setFilters: (filters: Partial<PostsState['filters']>) =>
          set(state => {
            state.filters = { ...state.filters, ...filters }
          }),

        setSearch: (search: string) =>
          set(state => {
            state.filters.search = search
          }),

        clearFilters: () =>
          set(state => {
            state.filters = {
              search: '',
              published: undefined,
              authorId: undefined,
            }
          }),

        // Reset action
        resetState: () =>
          set(state => {
            Object.assign(state, initialState)
          }),
      })),
      {
        name: 'posts-store',
      }
    )
  )
}
