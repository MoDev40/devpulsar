
import { useState, useEffect } from 'react';

export function useFirstVisit(): boolean {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('has-visited');
    if (!hasVisitedBefore) {
      localStorage.setItem('has-visited', 'true');
      setIsFirstVisit(true);
    } else {
      setIsFirstVisit(false);
    }
  }, []);
  
  return isFirstVisit;
}
