"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface VideoDescriptionProps {
  description: string | null;
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
}

const VideoDescription = ({
  description,
  compactDate,
  compactViews,
  expandedDate,
  expandedViews,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(
        isExpanded ? contentRef.current.scrollHeight : undefined
      );
    }
  }, [isExpanded]);

  const parseDescription = (text: string | null) => {
    if (!text) return "No Description";

    // Split by URLs, hashtags, and timestamps
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
    const timestampRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;

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
            onClick={(e) => e.stopPropagation()}
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
              console.log("Seek to:", part);
            }}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            {part}
          </button>
        );
      }

      return part;
    });
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

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
      <div className="flex gap-2 text-sm font-semibold mb-3">
        <span className="text-foreground">
          {isExpanded ? expandedViews : compactViews} views
        </span>
        <span className="text-muted-foreground">
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>

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
