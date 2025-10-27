// Import the HydrateClient component and trpc utilities for data fetching and hydration
import StudioView from "@/modules/studio/ui/views/StudioView";
import { HydrateClient, trpc } from "@/trpc/server";

// Define the StudioPage component as an async server component
const StudioPage = async () => {
  // Prefetch infinite data for the studio resource, triggering data fetch ahead of render
  void trpc.studio.getMany.prefetchInfinite({ limit: 5 });

  // Render the hydrated client environment and the StudioView component (StudioView should be imported/defined elsewhere)
  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

// Export the StudioPage component as the default export from this module
export default StudioPage;
