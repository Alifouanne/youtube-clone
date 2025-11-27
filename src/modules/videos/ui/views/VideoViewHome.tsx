import CommentsSection from "../sections/CommentsSection";
import SuggestionsSection from "../sections/SuggestionsSection";
import VideoSectionHome from "../sections/VideoSectionHome";

interface VideoViewHomeProps {
  videoId: string;
}
const VideoViewHome = ({ videoId }: VideoViewHomeProps) => {
  return (
    <div className="flex flex-col max-w-[1800px] mx-auto pt-4 px-3 sm:px-4 lg:px-6 pb-12">
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
        {/* Main content column */}
        <div className="flex-1 min-w-0 space-y-4 lg:space-y-6">
          <div className="bg-background rounded-lg overflow-hidden border border-border shadow-sm p-3 sm:p-4 lg:p-6">
            <VideoSectionHome videoId={videoId} />
          </div>

          <div className="xl:hidden block">
            <div className="bg-background rounded-lg border border-border shadow-sm p-3 sm:p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Suggested Videos
              </h2>
              <SuggestionsSection videoId={videoId} isManual />
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border shadow-sm p-3 sm:p-4 lg:p-6">
            <CommentsSection videoId={videoId} />
          </div>
        </div>

        <div className="hidden xl:block w-full xl:w-[400px] 2xl:w-[480px] shrink-0">
          <div className="sticky top-4 bg-background rounded-lg border border-border shadow-sm p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-sm font-semibold text-foreground mb-4 sticky top-0 bg-background pb-2 border-b border-border/50">
              Suggested Videos
            </h2>
            <SuggestionsSection videoId={videoId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoViewHome;
