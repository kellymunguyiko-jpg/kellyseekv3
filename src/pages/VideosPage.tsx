import { useState, useEffect, useRef } from "react";
import { Video, Search, Play, X, Wifi, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { Course } from "../types";

const CATEGORIES = [
  "All",
  "Software Development",
  "Networking",
  "Accounting",
  "Food and Beverage",
  "Construction",
];

const CATEGORY_COLORS: Record<string, string> = {
  "All": "bg-violet-600 text-white border-violet-600",
  "Software Development": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "Networking": "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  "Accounting": "bg-amber-500/20 text-amber-400 border-amber-500/40",
  "Food and Beverage": "bg-orange-500/20 text-orange-400 border-orange-500/40",
  "Construction": "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
};

const PAGE_SIZE = 12;

interface VideosPageProps {
  onCourseClick: (course: Course) => void;
}

export default function VideosPage({ onCourseClick }: VideosPageProps) {
  const { courses, addHistory, loading } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const videos = courses.filter((c) => c.type === "video");
  const filtered = videos.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()))
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setIsFetchingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setIsFetchingMore(false);
          }, 700);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore]);

  const handleClick = (course: Course) => {
    addHistory({
      courseId: course.id,
      title: course.title,
      type: course.type,
      thumbnail: course.thumbnail,
    });
    onCourseClick(course);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  const hasActiveFilters = search !== "" || category !== "All";

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-16">
      {/* ── Page Header ──────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#0a0a1a]/95 backdrop-blur border-b border-white/5 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Video className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-none">Videos</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-slate-400 text-xs">
                    {loading ? "Loading…" : `${videos.length} video${videos.length !== 1 ? "s" : ""} available`}
                  </p>
                  {!loading && videos.length > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                      <Wifi className="w-2.5 h-2.5 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search videos by title, topic, or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500/40 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                  category === cat
                    ? CATEGORY_COLORS[cat]
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/5 mt-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Play className="w-7 h-7 text-red-400 opacity-50" />
            </div>
            <p className="text-white font-semibold text-lg mb-1">
              {videos.length === 0 ? "No videos published yet" : "No videos match your filters"}
            </p>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              {videos.length === 0
                ? "The admin will publish videos soon. They'll appear here instantly!"
                : "Try adjusting your search or clearing the category filter."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">
                Showing{" "}
                <span className="text-white font-semibold">{Math.min(visibleCount, filtered.length)}</span>
                {" "}of{" "}
                <span className="text-white font-semibold">{filtered.length}</span>
                {" "}video{filtered.length !== 1 ? "s" : ""}
                {hasActiveFilters && (
                  <span className="text-slate-500"> (filtered)</span>
                )}
              </p>
            </div>

            {/* First 4 as featured */}
            {visible.slice(0, 4).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                {visible.slice(0, 4).map((c, i) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    onClick={() => handleClick(c)}
                    index={i}
                    featured
                  />
                ))}
              </div>
            )}

            {/* Rest as compact */}
            {visible.slice(4).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visible.slice(4).map((c, i) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    onClick={() => handleClick(c)}
                    index={i + 4}
                  />
                ))}
              </div>
            )}

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="mt-8 flex justify-center">
              {isFetchingMore && (
                <div className="flex items-center gap-3 text-slate-400 py-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                  <span className="text-sm">Loading more videos…</span>
                  <SkeletonGrid count={4} />
                </div>
              )}
              {!hasMore && filtered.length > 0 && (
                <div className="flex items-center gap-2 text-slate-600 text-sm py-4">
                  <div className="h-px w-16 bg-white/5" />
                  <span>✓ All {filtered.length} videos loaded</span>
                  <div className="h-px w-16 bg-white/5" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
