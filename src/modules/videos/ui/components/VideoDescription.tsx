"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

// Props for VideoDescription component
interface VideoDescriptionProps {
  description: string | null; // The video's description text
  compactViews: string; // Views in short/compact format
  expandedViews: string; // Views in expanded/long format
  compactDate: string; // Date in relative/compact format (e.g. '3 days ago')
  expandedDate: string; // Date in expanded/long format (e.g. '1 Jan 2022')
}

/**
 * VideoDescription
 *
 * Displays an expandable/collapsible area for a video's description and metadata.
 * Handles clickable timestamps, hashtags, and recognizes URLs.
 */
const VideoDescription = ({
  description,
  compactDate,
  compactViews,
  expandedDate,
  expandedViews,
}: VideoDescriptionProps) => {
  // Track expanded/collapsed state of the description
  const [isExpanded, setIsExpanded] = useState(false);

  // Track the current height of the content for transition animation
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );

  // Ref to the content div for measuring scrollHeight
  const contentRef = useRef<HTMLDivElement>(null);

  // When expanded/collapsed state changes, update the maxHeight for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(
        isExpanded ? contentRef.current.scrollHeight : undefined
      );
    }
  }, [isExpanded]);

  /**
   * Converts plain description text into React nodes,
   * linking URLs, highlighting hashtags, and making timestamps interactive.
   */
  const parseDescription = (text: string | null) => {
    if (!text) return "No Description";

    // RegEx patterns for URLs, hashtags, and timestamps
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
    const timestampRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;

    // Split by all whitespace (preserving spaces/newlines)
    const parts = text.split(/(\s+)/);

    return parts.map((part, index) => {
      // Check for URL
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
            onClick={(e) => e.stopPropagation()} // Prevent parent click
          >
            {part}
          </a>
        );
      }

      // Check for hashtag
      if (hashtagRegex.test(part)) {
        return (
          <span key={index} className="text-primary font-medium">
            {part}
          </span>
        );
      }

      // Check for timestamp
      if (timestampRegex.test(part)) {
        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              // Placeholder for potential seeking by timestamp
              console.log("Seek to:", part);
            }}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            {part}
          </button>
        );
      }

      // Plain text and whitespace return as-is
      return part;
    });
  };

  // Toggle expansion state
  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  // Keyboard accessibility: Expand/collapse with Enter/Space
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Collapse description" : "Expand description"}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Metadata row: views and date */}
      <div className="flex gap-2 text-sm font-semibold mb-3">
        <span className="text-foreground">
          {/* Use expanded or compact views count */}
          {isExpanded ? expandedViews : compactViews} views
        </span>
        <span className="text-muted-foreground">
          {/* Use expanded or compact date */}
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>

      {/* Description text, animated collapsing/expanding with maxHeight */}
      <div
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "3rem",
          overflow: "hidden",
        }}
        className="transition-all duration-300 ease-in-out"
      >
        <p className={cn("text-sm whitespace-pre-wrap leading-relaxed")}>
          {parseDescription(description)}
        </p>
      </div>

      {/* Toggle button: Show less/more with animated arrow icon */}
      <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-foreground select-none">
        {isExpanded ? (
          <>
            Show less
            <ChevronUpIcon className="size-4 transition-transform duration-200" />
          </>
        ) : (
          <>
            ...more
            <ChevronDownIcon className="size-4 transition-transform duration-200" />
          </>
        )}
      </div>
    </div>
  );
};

export default VideoDescription;
