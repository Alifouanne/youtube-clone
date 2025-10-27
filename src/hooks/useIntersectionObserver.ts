"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Custom React hook that leverages the Intersection Observer API.
 * Tracks whether the target element is currently intersecting the viewport (or root).
 *
 * @param option - Optional IntersectionObserverInit options (root, rootMargin, threshold).
 * @returns An object containing:
 *  - isIntersecting: whether the observed element is currently intersecting.
 *  - targetRef: a React ref to be attached to the element you want to observe.
 */
const useIntersectionObserver = (option?: IntersectionObserverInit) => {
  // State to hold current intersection status
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Ref to attach to the DOM element you want to observe
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create observer with callback updating isIntersecting state
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, option);

    // If target is set, start observing it
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // Cleanup by disconnecting the observer on unmount or option change
    return () => observer.disconnect();
  }, [option]);

  // Return intersection status and the ref for the target element
  return { isIntersecting, targetRef };
};

export default useIntersectionObserver;
