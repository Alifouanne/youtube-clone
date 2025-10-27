import VideoSection from "../section/VideoSection";

const StudioView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="p-4">
        <h1 className="text-3xl font-extrabold tracking-tight select-none  dark:bg-gradient-to-br dark:from-slate-100 dark:via-slate-500 dark:to-slate-950 dark:text-transparent dark:bg-clip-text text-slate-600 ">
          Channel Content
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed select-none">
          Manage your channel content and videos
        </p>
      </div>
      <VideoSection />
    </div>
  );
};

export default StudioView;
