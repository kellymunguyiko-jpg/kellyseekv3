import { ReactNode, useState } from "react";
import {
  Search, Video, BookOpen, Sparkles,
  ChevronRight, Layers, Flame, Clock3, GraduationCap, Wifi,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import CourseCard from "../components/CourseCard";
import { SkeletonSection, SkeletonHero } from "../components/SkeletonCard";
import { Course } from "../types";

interface HomePageProps {
  onCourseClick: (course: Course) => void;
  setPage?: (page: string) => void;
}

export default function HomePage({ onCourseClick, setPage }: HomePageProps) {
  const { courses, addHistory, loading, student } = useApp();
  const [search, setSearch] = useState("");

  const videos = courses.filter((c) => c.type === "video");
  const books = courses.filter((c) => c.type === "book");
  const recent = [...courses].slice(0, 8);

  const filtered = search
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleClick = (course: Course) => {
    addHistory({
      courseId: course.id,
      title: course.title,
      type: course.type,
      thumbnail: course.thumbnail,
    });
    onCourseClick(course);
  };

  const firstName = student?.name?.split(" ")[0] || "Learner";

  return (
    <div className="pb-10">
      {/* ── Hero ─────────────────────────────────────── */}
      {loading ? (
        <div className="px-4 md:px-6 pt-4 md:pt-6">
          <SkeletonHero />
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 pt-10 pb-12 mb-2 animate-fade-in-up">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={18} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold tracking-wide">
                Welcome back, {firstName}! 👋
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <Wifi size={10} className="animate-pulse" />
                Live Updates
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
              Learn Anything,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Anytime.
              </span>
            </h1>
            <p className="text-white/60 text-base mb-8 max-w-lg leading-relaxed">
              Access high-quality videos and books across Software, Networking,
              Accounting, F&B, and Construction.
            </p>

            {/* Search bar in hero */}
            <div className="relative max-w-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search videos, books, topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition text-sm backdrop-blur-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setPage?.("videos")}
                className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition border border-white/10 hover:border-white/20 group"
              >
                <Video size={15} className="text-red-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">{videos.length}</span>
                <span className="text-white/60">Videos</span>
              </button>
              <button
                onClick={() => setPage?.("books")}
                className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition border border-white/10 hover:border-white/20 group"
              >
                <BookOpen size={15} className="text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold">{books.length}</span>
                <span className="text-white/60">Books</span>
              </button>
              <div className="flex items-center gap-2 text-white bg-white/5 px-4 py-2 rounded-xl text-sm border border-white/10">
                <Layers size={15} className="text-emerald-400" />
                <span className="font-bold">{courses.length}</span>
                <span className="text-white/60">Total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        {/* ── Search Results ─────────────────────── */}
        {search && (
          <div className="mt-6 mb-4">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Search size={18} className="text-indigo-400" />
              Search Results
              <span className="text-indigo-400 text-sm font-normal ml-1">
                ({filtered.length} found)
              </span>
            </h2>
            {filtered.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/[0.02]">
                <Search size={48} className="mx-auto mb-3 text-indigo-400 opacity-30" />
                <p className="text-white font-medium text-lg mb-1">No results found</p>
                <p className="text-white/40 text-sm">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((c, i) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    onClick={() => handleClick(c)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Main Sections ─────────────────────── */}
        {!search && (
          <>
            {loading ? (
              <>
                <div className="mt-6">
                  <SkeletonSection />
                  <SkeletonSection />
                  <SkeletonSection />
                </div>
              </>
            ) : courses.length === 0 ? (
              <div className="text-center py-28 text-indigo-400">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
                  <Sparkles size={36} className="opacity-50" />
                </div>
                <p className="text-2xl font-black text-white mb-2">No Content Yet</p>
                <p className="text-sm opacity-60 max-w-sm mx-auto leading-relaxed">
                  Content added by the admin will appear here automatically — in real time!
                  Check back soon.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-10">

                {/* ── Continue Learning ── */}
                <ContinueLearning
                  courses={courses}
                  onCourseClick={handleClick}
                  setPage={setPage}
                />

                {/* ── Recently Added ── */}
                {recent.length > 0 && (
                  <Section
                    icon={<Flame size={18} />}
                    title="Recently Added"
                    count={courses.length}
                    color="orange"
                    onSeeAll={undefined}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {recent.slice(0, 4).map((c, i) => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          onClick={() => handleClick(c)}
                          index={i}
                          featured
                        />
                      ))}
                    </div>
                    {recent.length > 4 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                        {recent.slice(4).map((c, i) => (
                          <CourseCard
                            key={c.id}
                            course={c}
                            onClick={() => handleClick(c)}
                            index={i + 4}
                          />
                        ))}
                      </div>
                    )}
                  </Section>
                )}

                {/* ── All Videos ── */}
                {videos.length > 0 && (
                  <Section
                    icon={<Video size={18} />}
                    title="Videos"
                    count={videos.length}
                    color="red"
                    onSeeAll={videos.length > 4 ? () => setPage?.("videos") : undefined}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {videos.slice(0, 8).map((c, i) => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          onClick={() => handleClick(c)}
                          index={i}
                          featured={i < 2}
                        />
                      ))}
                    </div>
                    {videos.length > 8 && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => setPage?.("videos")}
                          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-all"
                        >
                          View all {videos.length} videos
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    )}
                  </Section>
                )}

                {/* ── All Books ── */}
                {books.length > 0 && (
                  <Section
                    icon={<BookOpen size={18} />}
                    title="Books"
                    count={books.length}
                    color="violet"
                    onSeeAll={books.length > 4 ? () => setPage?.("books") : undefined}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {books.slice(0, 8).map((c, i) => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          onClick={() => handleClick(c)}
                          index={i}
                          featured={i < 2}
                        />
                      ))}
                    </div>
                    {books.length > 8 && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => setPage?.("books")}
                          className="flex items-center gap-2 px-6 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 hover:text-violet-300 rounded-xl text-sm font-medium transition-all"
                        >
                          View all {books.length} books
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    )}
                  </Section>
                )}

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Continue Learning ─────────────────────────── */
function ContinueLearning({
  courses,
  onCourseClick,
  setPage,
}: {
  courses: Course[];
  onCourseClick: (c: Course) => void;
  setPage?: (p: string) => void;
}) {
  const { history } = useApp();
  if (history.length === 0) return null;

  const recentHistory = history.slice(0, 4);
  const historyCourses = recentHistory
    .map((h) => {
      const course = courses.find((c) => c.id === h.courseId);
      return course ? { course, visitedAt: h.visitedAt } : null;
    })
    .filter(Boolean) as { course: Course; visitedAt: number }[];

  if (historyCourses.length === 0) return null;

  return (
    <Section
      icon={<Clock3 size={18} />}
      title="Continue Learning"
      count={historyCourses.length}
      color="amber"
      onSeeAll={history.length > 4 ? () => setPage?.("history") : undefined}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {historyCourses.map(({ course, visitedAt }, i) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => onCourseClick(course)}
            showLastVisit={visitedAt}
            index={i}
          />
        ))}
      </div>
    </Section>
  );
}

/* ── Section wrapper ─────────────────────────────── */
function Section({
  icon, title, count, color, onSeeAll, children,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  color: "indigo" | "red" | "violet" | "orange" | "amber";
  onSeeAll?: () => void;
  children: ReactNode;
}) {
  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  const badgeMap = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    red: "text-red-400 bg-red-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
            {icon}
          </div>
          <h2 className="text-white font-bold text-lg tracking-tight">{title}</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeMap[color]}`}>
            {count}
          </span>
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-1 text-indigo-400 hover:text-white text-sm font-medium transition-colors group"
          >
            See all
            <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
