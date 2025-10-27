"use client";

/**
 * FilterCarousel component displays a horizontal scrolling carousel of filter options (badges)
 * with a loading skeleton state and edge fade effects.
 *
 * Props:
 * - value: The currently selected value.
 * - isLoading: Whether options are loading.
 * - onSelect: Callback when an option is selected.
 * - data: Array of filter option objects { value, label }.
 */

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

// Type definition for props
interface FilterCarouselProps {
  value?: string | null; // Currently selected filter value (or null for 'All')
  isLoading?: boolean; // Loading state for the data
  onSelect: (value: string | null) => void; // Callback for when a badge is selected
  data: {
    value: string;
    label: string;
  }[];
}

const FilterCarousel = ({
  isLoading,
  onSelect,
  value,
  data,
}: FilterCarouselProps) => {
  // Carousel API instance
  const [api, setApi] = useState<CarouselApi>();
  // Current visible/selected carousel item index (1-based)
  const [current, setCurrent] = useState(0);
  // Number of items in the carousel
  const [count, setCount] = useState(0);

  // Initialize carousel API state and listeners
  useEffect(() => {
    if (!api) return;
    // Store the total number of items (snaps)
    setCount(api.scrollSnapList().length);
    // Set currently selected item index
    setCurrent(api.selectedScrollSnap() + 1);
    // On carousel selection change, update the current index
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="w-full relative ">
      {/* Carousel provides the horizontal scrollable interface of filter badges */}
      <Carousel
        setApi={setApi}
        opts={{ align: "start", dragFree: true }}
        className="w-full px-12"
      >
        <CarouselContent className="-ml-3">
          {/* Show 'All' option if not loading */}
          {!isLoading && (
            <CarouselItem
              className="basis-auto pl-3 select-none"
              onClick={() => onSelect(null)}
            >
              <Badge
                variant={!value ? "default" : "secondary"}
                className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm hover:animate-heartbeat animate-duration-150"
              >
                All
              </Badge>
            </CarouselItem>
          )}

          {/* Display loading skeletons while loading */}
          {isLoading &&
            Array.from({ length: 14 }).map((_, index) => (
              <CarouselItem key={index} className="pl-3 basis-auto select-none">
                <Skeleton className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold">
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))}

          {/* Render carousel items for each filter option */}
          {!isLoading &&
            data.map((item) => (
              <CarouselItem
                key={item.value}
                className="basis-auto pl-3 select-none"
                onClick={() => onSelect(item.value)}
              >
                <Badge
                  className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm md:hover:animate-heartbeat animate-duration-150"
                  variant={value === item.value ? "default" : "secondary"}
                >
                  {item.label}
                </Badge>
              </CarouselItem>
            ))}
        </CarouselContent>
        {/* Carousel navigation arrows */}
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>
      {/* Edge fade overlays for better visual cue of horizontal scroll */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-12 w-12 z-10 bg-gradient-to-r from-background to-transparent",
          current === 1 && "hidden"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-12 w-12 z-10 bg-gradient-to-l from-background to-transparent",
          current === count && "hidden"
        )}
      />
    </div>
  );
};

export default FilterCarousel;
