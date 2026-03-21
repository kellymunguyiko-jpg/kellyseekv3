import { useState } from "react";
import { ArrowLeft, ExternalLink, Youtube, Play, BookOpen, Tag, Info } from "lucide-react";
import { Course } from "../types";

interface VideoPlayerProps {
  course: Course;
  onBack: () => void;
}

function getYouTubeEmbedUrl(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
  }
  if (url.includes("/embed/")) return url;
  return url;
}

function getMegaEmbedUrl(url: string): string {
  return url
    .replace("mega.nz/file/", "mega.nz/embed/")
    .replace("mega.nz/#!", "mega.nz/embed/");
}

const categoryColor: Record<string, string> = {
  "Software Development": "bg-blue-500/20 text-blue-300",
  Networking: "bg-cyan-500/20 text-cyan-300",
  Accounting: "bg-amber-500/20 text-amber-300",
  "Food and Beverage": "bg-orange-500/20 text-orange-300",
  Construction: "bg-yellow-500/20 text-yellow-300",
};

export default function VideoPlayer({ course, onBack }: VideoPlayerProps) {
  const [embedError, setEmbedError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const isYoutube = course.videoPlayer === "youtube";
  const embedUrl = isYoutube
    ? getYouTubeEmbedUrl(course.videoUrl || "")
    : getMegaEmbedUrl(course.videoUrl || "");

  const catStyle = categoryColor[course.category] || "bg-indigo-500/20 text-indigo-300";

  return (
    <div className="flex flex-col h-full bg-[#080810]">
      {/* ── Top bar ───────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0d0d1a]/90 border-b border-white/[0.06] backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition text-sm font-medium group"
        >
          <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-5 bg-white/10" />

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-sm truncate leading-tight">
            {course.title}
          </h2>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {isYoutube ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                <Youtube size={10} /> YouTube
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                ⚡ Mega.nz
              </span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${catStyle}`}>
              <Tag size={9} />
              {course.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition ${showInfo ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"}`}
          >
            <Info size={13} />
            <span className="hidden sm:inline">Info</span>
          </button>
          {course.videoUrl && (
            <a
              href={course.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Open</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Video + Info layout ───────────────────── */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Video embed */}
        <div className="w-full bg-black" style={{ aspectRatio: "16/9", maxHeight: "65vh" }}>
          {!embedError ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              onError={() => setEmbedError(true)}
              title={course.title}
              style={{ aspectRatio: "16/9" }}
              sandbox={
                isYoutube
                  ? undefined
                  : "allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
              }
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d1a] text-center p-8 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                <Play size={36} className="text-white/20" />
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1">Cannot embed this video</p>
                <p className="text-white/40 text-sm mb-4">
                  The video needs to be opened in a new tab
                </p>
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/20"
                >
                  <ExternalLink size={16} />
                  Open Video
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="flex-1 px-4 md:px-8 py-5 max-w-4xl mx-auto w-full">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-white font-bold text-lg leading-tight">
              {course.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Play size={12} className={`fill-current ${isYoutube ? "text-red-400" : "text-yellow-400"}`} />
              <span className={`text-xs font-semibold ${isYoutube ? "text-red-400" : "text-yellow-400"}`}>
                {isYoutube ? "YouTube" : "Mega.nz"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catStyle}`}>
              📚 {course.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/40">
              🎬 Video Course
            </span>
          </div>

          {course.description && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={13} className="text-indigo-400" />
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  Description
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                {course.description}
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm transition border border-white/10"
            >
              <ArrowLeft size={15} />
              Back to Library
            </button>
            {course.videoUrl && (
              <a
                href={course.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white rounded-xl text-sm transition border border-indigo-500/20"
              >
                <ExternalLink size={15} />
                Open in New Tab
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
