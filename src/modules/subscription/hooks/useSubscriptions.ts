// Provides a hook for handling subscribing or unsubscribing to a channel/user with feedback and video cache update.
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

// Props for the useSubscriptions hook: the channel/user id to subscribe to and (optionally) a videoId to refresh.
interface useSubscriptionsProps {
  userId: string; // The user/channel we want to subscribe/unsubscribe to
  fromVideoId?: string; // (Optional) If used in the context of a video, its id for invalidation
}

// Main hook to handle subscription functionality
export const useSubscriptions = ({
  userId,
  fromVideoId,
}: useSubscriptionsProps) => {
  const clerk = useClerk(); // Clerk instance for user authentication flow
  const utils = trpc.useUtils(); // trpc helpers for cache invalidation etc.

  // tRPC mutation for toggling a subscription (subscribe or unsubscribe)
  const toggleSubscriptions = trpc.subscriptions.toggle.useMutation({
    // Called if the mutation succeeds
    onSuccess: (data) => {
      // Show a toast depending on subscribe/unsubscribe result
      toast.success(data.subscribed ? "Subscribed!" : "Unsubscribed.");
      // If a video context is provided, invalidate that video's data to reflect new sub status
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ videoId: fromVideoId });
      }
    },
    // Called if the mutation fails
    onError: (error) => {
      toast.error(error.message); // Show error toast
      // If the error is that the user is not authenticated, prompt them to sign in
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  // Whether the subscription mutation is currently pending
  const isPending = toggleSubscriptions.isPending;

  // Function to trigger the subscribe/unsubscribe action
  const onClick = () => {
    toggleSubscriptions.mutate({ channelId: userId });
  };

  // Return pending state and click handler to consumers
  return {
    isPending,
    onClick,
  };
};
