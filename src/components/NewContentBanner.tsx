import { useState, useEffect } from "react";
import { Video, BookOpen, X, Sparkles, Bell, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Course } from "../types";

interface NewContentBannerProps {
  onCourseClick: (course: Course) => void;
}

export default function NewContentBanner({ onCourseClick }: NewContentBannerProps) {
  const { newContentAlerts, clearNewContentAlerts, courses } = useApp();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [animate, setAnimate] = useState(false);

  const visible = newContentAlerts.filter((a) => !dismissed.has(a.id));

  useEffect(() => {
    if (visible.length > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(t);
    }
  }, [visible.length]);

  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const dismissAll = () => {
    clearNewContentAlerts();
    setDismissed(new Set());
  };

  const handleClick = (alert: typeof visible[0]) => {
    const course = courses.find((c) => c.id === alert.id);
    if (course) {
      onCourseClick(course);
      dismiss(alert.id);
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9990] flex flex-col gap-2 max-w-xs w-full transition-all duration-500 ${
        animate ? "scale-105" : "scale-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-900/60 border border-violet-500/30 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={14} className="text-violet-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
              {visible.length}
            </span>
          </div>
          <span className="text-violet-200 text-xs font-semibold">New Content Available</span>
        </div>
        <button
          onClick={dismissAll}
          className="text-violet-400 hover:text-white transition text-xs"
        >
          Clear all
        </button>
      </div>

      {/* Alert cards */}
      {visible.map((alert, i) => (
        <div
          key={alert.id}
          className="group relative rounded-xl border border-white/10 bg-[#1a1a2e]/90 backdrop-blur-xl shadow-2xl overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            animation: `slideInRight 0.4s ease-out ${i * 0.1}s both`,
          }}
          onClick={() => handleClick(alert)}
        >
          {/* Glow bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-0.5 ${
              alert.type === "video"
                ? "bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                : "bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500"
            }`}
          />

          <div className="flex items-center gap-3 p-3">
            {/* Thumbnail or icon */}
            <div className="relative flex-shrink-0">
              {alert.thumbnail ? (
                <img
                  src={alert.thumbnail}
                  alt={alert.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    alert.type === "video" ? "bg-red-500/20" : "bg-violet-500/20"
                  }`}
                >
                  {alert.type === "video" ? (
                    <Video size={20} className="text-red-400" />
                  ) : (
                    <BookOpen size={20} className="text-violet-400" />
                  )}
                </div>
              )}
              {/* New badge */}
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[9px] font-bold px-1 rounded-md leading-4">
                NEW
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <Sparkles size={10} className="text-yellow-400" />
                <span className="text-yellow-400 text-[10px] font-semibold uppercase tracking-wide">
                  Just Published
                </span>
              </div>
              <p className="text-white text-xs font-semibold truncate">{alert.title}</p>
              <p className="text-white/50 text-[10px] mt-0.5">
                {alert.type === "video" ? "🎬 Video" : "📚 Book"} · Tap to open
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight size={14} className="text-white/30 group-hover:text-violet-400 transition flex-shrink-0" />
          </div>

          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss(alert.id);
            }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
          >
            <X size={10} className="text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
