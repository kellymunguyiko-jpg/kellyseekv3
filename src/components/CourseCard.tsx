import { Video, BookOpen, Play, Eye, Download, Clock, Star } from "lucide-react";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  showLastVisit?: number;
  index?: number;
  featured?: boolean;
}

export default function CourseCard({
  course,
  onClick,
  showLastVisit,
  index = 0,
  featured = false,
}: CourseCardProps) {
  const isVideo = course.type === "video";
  const delayClass = `card-delay-${Math.min(index, 7)}`;

  const formatDate = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const categoryColor: Record<string, string> = {
    "Software Development": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Networking: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    Accounting: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "Food and Beverage": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Construction: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };

  const catStyle = categoryColor[course.category] || "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";

  if (featured) {
    return (
      <div
        onClick={onClick}
        style={{ opacity: 0 }}
        className={`group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1 animate-fade-in-up ${delayClass} bg-gradient-to-br from-white/5 to-white/[0.02]`}
      >
        {/* Large Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-indigo-900/60 to-violet-900/60 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isVideo ? "bg-red-500/20" : "bg-violet-500/20"}`}>
                {isVideo ? (
                  <Video size={32} className="text-red-400" />
                ) : (
                  <BookOpen size={32} className="text-violet-400" />
                )}
              </div>
              <span className="text-white/30 text-xs font-medium">No thumbnail</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play/View button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300 ${isVideo ? "bg-red-500 shadow-red-500/50" : "bg-violet-600 shadow-violet-500/50"}`}>
              {isVideo ? (
                <Play size={28} className="text-white ml-1.5" fill="white" />
              ) : (
                <Eye size={26} className="text-white" />
              )}
            </div>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md ${isVideo ? "bg-red-500/90 text-white" : "bg-violet-600/90 text-white"}`}>
              {isVideo ? <Play size={10} fill="white" /> : <BookOpen size={10} />}
              {isVideo ? "VIDEO" : "BOOK"}
            </span>
          </div>

          {/* Download badge */}
          {!isVideo && course.bookDownloadUrl && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-md bg-emerald-500/90 text-white">
                <Download size={10} />
                DL
              </span>
            </div>
          )}

          {/* Stars */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <Star size={10} className="text-yellow-400/40" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle}`}>
              {course.category}
            </span>
          </div>
          <h3 className="text-white font-bold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-200 transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
          {showLastVisit && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10">
              <Clock size={11} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">
                Visited {formatDate(showLastVisit)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div
      onClick={onClick}
      style={{ opacity: 0 }}
      className={`group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up ${delayClass} bg-gradient-to-br from-white/5 to-white/[0.02]`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isVideo ? "bg-red-500/20" : "bg-violet-500/20"}`}>
              {isVideo ? (
                <Video size={24} className="text-red-400 opacity-70" />
              ) : (
                <BookOpen size={24} className="text-violet-400 opacity-70" />
              )}
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300 ${isVideo ? "bg-red-500" : "bg-violet-600"}`}>
            {isVideo ? (
              <Play size={20} className="text-white ml-1" fill="white" />
            ) : (
              <Eye size={18} className="text-white" />
            )}
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${isVideo ? "bg-red-500/90 text-white" : "bg-violet-600/90 text-white"}`}>
            {isVideo ? <Play size={8} fill="white" /> : <BookOpen size={8} />}
            {isVideo ? "VIDEO" : "BOOK"}
          </span>
        </div>

        {/* Download */}
        {!isVideo && course.bookDownloadUrl && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md bg-emerald-500/90 text-white">
              <Download size={8} />
              DL
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-2 ${catStyle}`}>
          {course.category}
        </span>
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors mb-1">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-white/40 text-[11px] line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}
        {showLastVisit && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/10">
            <Clock size={10} className="text-amber-400" />
            <span className="text-amber-400 text-[10px] font-medium">
              {formatDate(showLastVisit)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
