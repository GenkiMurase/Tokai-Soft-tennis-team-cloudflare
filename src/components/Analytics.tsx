import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (
      key: string,
      trackingId: string,
      config: { page_path: string }
    ) => void;
  }
}

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-0EDBZTH5DQ', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
}

export default Analytics;