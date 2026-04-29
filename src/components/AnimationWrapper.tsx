import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

function AnimationWrapper({ children, className = '' }: AnimationWrapperProps) {
  const location = useLocation();
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    // Check if this page has been visited before
    const visitedPages = JSON.parse(sessionStorage.getItem('visitedPages') || '[]');
    const hasVisited = visitedPages.includes(location.pathname);
    setIsVisited(hasVisited);

    // If not visited, add to visited pages
    if (!hasVisited) {
      sessionStorage.setItem('visitedPages', JSON.stringify([...visitedPages, location.pathname]));
    }
  }, [location.pathname]);

  return (
    <div className={`${className} ${isVisited ? 'visited-page' : ''}`}>
      {children}
    </div>
  );
}

export default AnimationWrapper;