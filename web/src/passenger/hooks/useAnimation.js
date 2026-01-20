import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing fade in/out transitions
 * Keep this for modals and important dialogs
 */
export const useFadeTransition = (initialState = false, duration = 300) => {
  const [isVisible, setIsVisible] = useState(initialState);
  const [shouldRender, setShouldRender] = useState(initialState);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  return {
    isVisible,
    setIsVisible,
    shouldRender,
    style: {
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${duration}ms ease-in-out`,
      pointerEvents: isVisible ? 'auto' : 'none'
    }
  };
};

/**
 * Custom hook for managing modal animations
 * Handles backdrop and content visibility
 */
export const useModalAnimation = (isOpen = false) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return {
    shouldRender,
    isAnimating,
    backdropStyle: {
      opacity: isAnimating ? 1 : 0,
      transition: 'opacity 0.3s ease-out',
      backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)'
    },
    contentStyle: {
      transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
      opacity: isAnimating ? 1 : 0,
      transition: 'all 0.3s ease-out'
    }
  };
};

/**
 * Custom hook for managing ripple effect on click
 * Used for button feedback
 */
export const useRipple = () => {
  const ref = useRef(null);

  const createRipple = (event) => {
    const button = ref.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return { ref, createRipple };
};

/**
 * Custom hook for managing loading state with timeout
 * Useful for API calls and async operations
 */
export const useAsyncOperation = (asyncFunction, dependencies = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const executeAsync = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    executeAsync();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { isLoading, error, data };
};

/**
 * Custom hook for debounced state updates
 * Useful for form inputs and search
 */
export const useDebouncedValue = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
