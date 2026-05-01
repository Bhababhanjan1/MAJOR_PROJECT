import { useEffect } from "react";

/**
 * Hook to scroll to top of page on component mount or when dependencies change
 * Disables browser's automatic scroll restoration to ensure top position
 * @param {Array} dependencies - Optional array of dependencies to trigger scroll
 */
export function useScrollToTop(dependencies = []) {
  useEffect(() => {
    // Disable automatic scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Also scroll after a tiny delay to ensure it takes effect
    const timer = window.setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    return () => window.clearTimeout(timer);
  }, dependencies);
}
