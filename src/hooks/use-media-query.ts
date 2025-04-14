import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a media query list to track the query
    const mediaQueryList = window.matchMedia(query);

    // Set the initial value
    setMatches(mediaQueryList.matches);

    // Define the handler function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers: addEventListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => {
        mediaQueryList.removeEventListener('change', handleChange);
      };
    }
    // Legacy browsers: addListener
    else {
      mediaQueryList.addListener(handleChange);
      return () => {
        mediaQueryList.removeListener(handleChange);
      };
    }
  }, [query]);

  return matches;
}
