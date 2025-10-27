import VideoView from "@/modules/studio/ui/views/VideoView";
import { HydrateClient, trpc } from "@/trpc/server";

interface videoPageProps {
  params: Promise<{ videoId: string }>;
}
const videoPage = async ({ params }: videoPageProps) => {
  const { videoId } = await params;
  void trpc.studio.getOne.prefetch({ id: videoId });
  void trpc.categories.getMany.prefetch();
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default videoPage;
