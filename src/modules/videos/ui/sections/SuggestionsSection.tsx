"use client";

import { trpc } from "@/trpc/client";
import VideoRowCard from "../components/VideoRowCard";
import VideoGridCard from "../components/VideoGridCard";
import InfiniteScroll from "@/components/InfiniteScroll";

interface SuggestionsSectionProps {
  videoId: string;
  isManual?: boolean;
}
const SuggestionsSection = ({ videoId, isManual }: SuggestionsSectionProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      { videoId, limit: 5 },
      {
        getNextPageParam: (lastpage) => lastpage.nextCursor,
      }
    );
  return (
    <>
      <div className="hidden md:block space-y-3">
        {suggestions.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoRowCard key={video.id} data={video} size="compact" />
          ))
        )}
      </div>
      <div className="block md:hidden space-y-10">
        {suggestions.pages.flatMap((page) =>
          page.items.map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))
        )}
      </div>
      <InfiniteScroll
        isManual={isManual}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

export default SuggestionsSection;
