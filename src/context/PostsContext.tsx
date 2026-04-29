import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';
import type { Post } from '../types/domain';

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  addPost: (post: Omit<Post, 'id'>) => Promise<void>;
  editPost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPosts(await apiGet<Post[]>('/api/posts'));
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('投稿データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const addPost = async (post: Omit<Post, 'id'>) => {
    try {
      await apiPost('/api/posts', post);
      await refreshPosts();
    } catch (err) {
      console.error('Error adding post:', err);
      throw new Error('投稿の追加に失敗しました');
    }
  };

  const editPost = async (id: string, updatedPost: Partial<Post>) => {
    try {
      await apiPut(`/api/posts/${id}`, updatedPost);
      await refreshPosts();
    } catch (err) {
      console.error('Error updating post:', err);
      throw new Error('投稿の更新に失敗しました');
    }
  };

  const deletePost = async (id: string) => {
    try {
      await apiDelete(`/api/posts/${id}`);
      await refreshPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      throw new Error('投稿の削除に失敗しました');
    }
  };

  return (
    <PostsContext.Provider value={{
      posts,
      isLoading,
      error,
      addPost,
      editPost,
      deletePost,
      refreshPosts
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
}
