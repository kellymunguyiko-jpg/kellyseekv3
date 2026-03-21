import { Clock, Trash2, Video, BookOpen, History } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Course } from "../types";

interface HistoryPageProps {
  onCourseClick: (course: Course) => void;
}

function SkeletonHistoryItem() {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-white/10 skeleton-shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-16 bg-white/10 rounded-full skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-white/10 rounded-lg skeleton-shimmer" />
        <div className="h-3 w-24 bg-white/5 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

export default function HistoryPage({ onCourseClick }: HistoryPageProps) {
  const { history, courses, addHistory, clearHistory, loading } = useApp();

  const handleClick = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      addHistory({
        courseId: course.id,
        title: course.title,
        type: course.type,
        thumbnail: course.thumbnail,
      });
      onCourseClick(course);
    }
  };

  const formatDate = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-8 animate-fade-in-up card-delay-0"
        style={{ opacity: 0 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock size={16} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Watch History</h1>
          </div>
          <p className="text-indigo-300 text-sm">
            {loading ? "Loading…" : `${history.length} items in your history`}
          </p>
        </div>
        {!loading && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-sm transition"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonHistoryItem key={i} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-indigo-400">
          <History size={56} className="mx-auto mb-4 opacity-40" />
          <p className="text-xl font-semibold mb-2">No history yet</p>
          <p className="text-sm opacity-60">
            Your viewing history will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry, i) => {
            const exists = courses.find((c) => c.id === entry.courseId);
            const isVideo = entry.type === "video";
            return (
              <div
                key={`${entry.courseId}-${entry.visitedAt}`}
                onClick={() => exists && handleClick(entry.courseId)}
                style={{ opacity: 0 }}
                className={`animate-fade-in-up card-delay-${Math.min(i, 7)} flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 transition group
                  ${exists ? "cursor-pointer hover:bg-white/10 hover:border-indigo-500/30" : "opacity-50"}`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-indigo-900/40 flex items-center justify-center">
                  {entry.thumbnail ? (
                    <img
                      src={entry.thumbnail}
                      alt={entry.title}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo ? (
                    <Video size={22} className="text-red-400" />
                  ) : (
                    <BookOpen size={22} className="text-violet-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${isVideo ? "bg-red-500/20 text-red-300" : "bg-violet-500/20 text-violet-300"}`}
                    >
                      {isVideo ? "VIDEO" : "BOOK"}
                    </span>
                    {!exists && (
                      <span className="text-xs text-red-400">Removed</span>
                    )}
                  </div>
                  <h4 className="text-white font-medium text-sm truncate group-hover:text-indigo-200 transition">
                    {entry.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-indigo-400">
                    <Clock size={11} />
                    {formatDate(entry.visitedAt)}
                  </div>
                </div>

                {/* Arrow */}
                {exists && (
                  <div className="text-indigo-400 group-hover:text-white transition flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
