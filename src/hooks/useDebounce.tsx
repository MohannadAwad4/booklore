import { useRef, useCallback, useEffect } from 'react';

function useDebounce(callback: (...args: any[]) => void, delay = 1000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: any[]) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as (...args: Parameters<typeof callback>) => void;
}

export default useDebounce;