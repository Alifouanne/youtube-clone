import { AlertTriangleIcon } from "lucide-react";
import type { VideoGetOneOutput } from "../../types";

interface VideoBannerProps {
  status: VideoGetOneOutput["muxStatus"];
}

const VideoBanner = ({ status }: VideoBannerProps) => {
  if (status === "ready") return null;

  return (
    <div className="flex items-center gap-3 rounded-b-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
        <AlertTriangleIcon className="size-4 text-amber-700 dark:text-amber-400" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-semibold leading-none text-amber-900 dark:text-amber-100">
          Video Processing
        </p>
        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
          Your video is still being processed. It will be available shortly.
        </p>
      </div>
    </div>
  );
};

export default VideoBanner;
