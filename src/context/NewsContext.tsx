import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  publishDate: string;
  headerImage?: string;
  images?: string[];
  twitterUrl?: string;
}

interface NewsContextType {
  news: NewsItem[];
  addNews: (item: Omit<NewsItem, 'id'>) => void;
  editNews: (id: string, item: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([]);

  const addNews = (item: Omit<NewsItem, 'id'>) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    setNews(prev => [newItem, ...prev]);
  };

  const editNews = (id: string, updatedItem: Partial<NewsItem>) => {
    setNews(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
  };

  const deleteNews = (id: string) => {
    setNews(prev => prev.filter(item => item.id !== id));
  };

  return (
    <NewsContext.Provider value={{ news, addNews, editNews, deleteNews }}>
      {children}
    </NewsContext.Provider>
  );
}

function useNewsContext() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNewsContext must be used within a NewsProvider');
  }
  return context;
}