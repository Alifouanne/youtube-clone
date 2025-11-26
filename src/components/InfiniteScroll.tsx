"use client";

// InfiniteScroll component: provides automatic or manual "infinite loading" for lists (e.g., comments).
// It leverages an intersection observer and a fallback "Load More" button for accessibility and manual fetching.

import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

// Props for the InfiniteScroll component
interface InfiniteScrollProps {
  isManual?: boolean; // If true, disables automatic loading on scroll, only allows manual loading via button
  hasNextPage: boolean; // If there are more pages/items to fetch
  isFetchingNextPage: boolean; // If a page fetch is currently in progress
  fetchNextPage: () => void; // Callback to fetch the next page
}

// InfiniteScroll functional component
const InfiniteScroll = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isManual = false, // Default: automatic infinite scroll unless set to manual
}: InfiniteScrollProps) => {
  // Setup intersection observer to watch when the sentinel div comes into view
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5, // 50% visibility before triggering
    rootMargin: "100px", // Start observing "early" before the sentinel enters the viewport
  });

  // Auto-fetch next page when sentinel div is in view, unless set to manual
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManual,
    fetchNextPage,
  ]);

  return (
    // Container for the infinite scroll controls and sentinel
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Sentinel div: observed by intersection observer */}
      <div ref={targetRef} className="h-1" />
      {/* Show "Load More" button if there's more to load; otherwise show end message */}
      {hasNextPage ? (
        <Button
          variant="secondary"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={fetchNextPage}
        >
          {isFetchingNextPage ? (
            // Show loading spinner alongside text while loading
            <>
              Loading...
              <Spinner />
            </>
          ) : (
            "Load More"
          )}
        </Button>
      ) : (
        // End-of-list message
        <p className="text-xs text-muted-foreground">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
};

export default InfiniteScroll;
