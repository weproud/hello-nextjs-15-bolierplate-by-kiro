'use client'

import {
  createPostsStore,
  type PostsState,
  type PostsStore,
} from '@/stores/posts-store'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'

const PostsStoreContext = createContext<PostsStore | null>(null)

export interface PostsStoreProviderProps {
  children: ReactNode
  initialState?: Partial<PostsState>
}

export const PostsStoreProvider = ({
  children,
  initialState,
}: PostsStoreProviderProps) => {
  const storeRef = useRef<PostsStore | undefined>(undefined)

  if (!storeRef.current) {
    storeRef.current = createPostsStore()

    // 초기 상태가 제공된 경우 설정
    if (initialState) {
      const state = storeRef.current.getState()
      storeRef.current.setState({ ...state, ...initialState })
    }
  }

  return (
    <PostsStoreContext.Provider value={storeRef.current}>
      {children}
    </PostsStoreContext.Provider>
  )
}

// 기본 usePostsStore 훅
export const usePostsStore = <T,>(selector: (state: PostsState) => T): T => {
  const postsStoreContext = useContext(PostsStoreContext)

  if (!postsStoreContext) {
    throw new Error('usePostsStore must be used within PostsStoreProvider')
  }

  return useStore(postsStoreContext, selector)
}

// 편의를 위한 특화된 훅들
export const usePosts = () => usePostsStore(state => state.posts)
export const useCurrentPost = () => usePostsStore(state => state.currentPost)
export const usePostsLoading = () =>
  usePostsStore(state => ({
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    isDeleting: state.isDeleting,
  }))
export const usePostsError = () => usePostsStore(state => state.error)
export const usePostsPagination = () => usePostsStore(state => state.pagination)
export const usePostsFilters = () => usePostsStore(state => state.filters)

// 액션 훅들
export const usePostsActions = () =>
  usePostsStore(state => ({
    setPosts: state.setPosts,
    addPost: state.addPost,
    updatePost: state.updatePost,
    removePost: state.removePost,
    setCurrentPost: state.setCurrentPost,
    setLoading: state.setLoading,
    setCreating: state.setCreating,
    setUpdating: state.setUpdating,
    setDeleting: state.setDeleting,
    setError: state.setError,
    setPagination: state.setPagination,
    setPage: state.setPage,
    setFilters: state.setFilters,
    setSearch: state.setSearch,
    clearFilters: state.clearFilters,
    resetState: state.resetState,
  }))

// 데이터 관련 액션들
export const usePostsDataActions = () =>
  usePostsStore(state => ({
    setPosts: state.setPosts,
    addPost: state.addPost,
    updatePost: state.updatePost,
    removePost: state.removePost,
    setCurrentPost: state.setCurrentPost,
  }))

// 로딩 관련 액션들
export const usePostsLoadingActions = () =>
  usePostsStore(state => ({
    setLoading: state.setLoading,
    setCreating: state.setCreating,
    setUpdating: state.setUpdating,
    setDeleting: state.setDeleting,
  }))

// 필터 관련 액션들
export const usePostsFilterActions = () =>
  usePostsStore(state => ({
    setFilters: state.setFilters,
    setSearch: state.setSearch,
    clearFilters: state.clearFilters,
  }))

// 페이지네이션 관련 액션들
export const usePostsPaginationActions = () =>
  usePostsStore(state => ({
    setPagination: state.setPagination,
    setPage: state.setPage,
  }))
