import VideoViewHome from "@/modules/videos/ui/views/VideoViewHome";
import { HydrateClient, trpc } from "@/trpc/server";

const HomeVideoPage = async ({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) => {
  const { videoId } = await params;
  void trpc.videos.getOne.prefetch({ videoId });
  return (
    <HydrateClient>
      <VideoViewHome videoId={videoId} />
    </HydrateClient>
  );
};

export default HomeVideoPage;
