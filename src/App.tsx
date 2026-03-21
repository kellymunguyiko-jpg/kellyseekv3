import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import StudentAuth from "./components/StudentAuth";
import VideoPlayer from "./components/VideoPlayer";
import BookViewer from "./components/BookViewer";
import HomePage from "./pages/HomePage";
import VideosPage from "./pages/VideosPage";
import BooksPage from "./pages/BooksPage";
import HistoryPage from "./pages/HistoryPage";
import Toast from "./components/Toast";
import NewContentBanner from "./components/NewContentBanner";
import { InfiniteLoadingBar } from "./components/SkeletonCard";
import { Course } from "./types";

type Page = "home" | "videos" | "books" | "history" | "admin" | "auth";

/** Convert any Mega.nz link to direct open URL */
function getMegaOpenUrl(url: string): string {
  if (!url) return "";
  // Already a proper mega link — return as-is
  return url;
}

/** Get the external open URL for a book */
function getBookOpenUrl(course: Course): string {
  const raw = course.bookViewUrl || "";
  const player = course.bookPlayer || detectPlayer(raw);

  if (player === "mega") return getMegaOpenUrl(raw);
  if (player === "gdrive") {
    // Convert to /view for Google Drive
    if (raw.includes("/preview")) return raw.replace("/preview", "/view");
    if (raw.includes("/view") || raw.includes("/edit")) return raw;
    const idMatch = raw.match(/[?&]id=([^&]+)/);
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/view`;
    return raw;
  }
  return raw;
}

function detectPlayer(url: string): "mega" | "gdrive" | "pdf" {
  if (!url) return "pdf";
  if (url.includes("mega.nz")) return "mega";
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) return "gdrive";
  return "pdf";
}

function AppInner() {
  const { isAdmin, student, authLoading, loading, isConnected, courses, addHistory } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  // When student logs in, go home
  useEffect(() => {
    if (student && currentPage === "auth") {
      setCurrentPage("home");
    }
  }, [student]);

  // If viewing course gets updated in Firestore, keep it in sync
  useEffect(() => {
    if (viewingCourse) {
      const updated = courses.find((c) => c.id === viewingCourse.id);
      if (updated) setViewingCourse(updated);
    }
  }, [courses]);

  const handleCourseClick = (course: Course) => {
    // Always add to history
    addHistory({
      courseId: course.id,
      title: course.title,
      type: course.type,
      thumbnail: course.thumbnail,
    });

    if (course.type === "book") {
      // For books: open external link immediately + show redirect screen
      const openUrl = getBookOpenUrl(course);
      if (openUrl) {
        window.open(openUrl, "_blank", "noopener,noreferrer");
      }
      // Show the BookViewer redirect screen
      setViewingCourse(course);
    } else {
      // For videos: show inline player
      setViewingCourse(course);
    }
  };

  const handleBack = () => {
    setViewingCourse(null);
  };

  const handleSetPage = (p: Page) => {
    setCurrentPage(p);
    setViewingCourse(null);
  };

  // ── Auth loading splash ──────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <InfiniteLoadingBar />
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <span className="text-white font-black text-3xl tracking-tight">S</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#0a0a1a] pulse-dot live-ring" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl tracking-tight">Skill Up</h1>
            <p className="text-indigo-400 text-sm mt-1 animate-pulse">Loading your learning platform…</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-500"
                style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Auth wall — not logged in ────────────────────────────────
  if (!student && !isAdmin && currentPage !== "auth" && currentPage !== "admin") {
    return (
      <div className="flex h-screen bg-[#0a0a1a]">
        {loading && <InfiniteLoadingBar />}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={handleSetPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-auto">
          <div className="pt-14 lg:pt-0">
            <StudentAuth onSuccess={() => setCurrentPage("home")} />
          </div>
        </main>
      </div>
    );
  }

  // ── Viewing a course ─────────────────────────────────────────
  if (viewingCourse) {
    return (
      <div className="flex h-screen bg-[#0a0a1a]">
        {loading && <InfiniteLoadingBar />}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={handleSetPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="pt-14 lg:pt-0 h-full">
            {viewingCourse.type === "video" ? (
              <VideoPlayer course={viewingCourse} onBack={handleBack} />
            ) : (
              <BookViewer course={viewingCourse} onBack={handleBack} />
            )}
          </div>
        </main>
        {/* New content alerts even while viewing */}
        {!isAdmin && <NewContentBanner onCourseClick={handleCourseClick} />}
        <Toast />
      </div>
    );
  }

  // ── Student auth page ────────────────────────────────────────
  if (currentPage === "auth") {
    return (
      <div className="flex h-screen bg-[#0a0a1a]">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={handleSetPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-auto">
          <div className="pt-14 lg:pt-0">
            <StudentAuth onSuccess={() => setCurrentPage("home")} />
          </div>
        </main>
      </div>
    );
  }

  // ── Admin page ───────────────────────────────────────────────
  if (currentPage === "admin") {
    if (!isAdmin) {
      return (
        <div className="flex h-screen bg-[#0a0a1a]">
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={handleSetPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main className="flex-1 overflow-auto">
            <div className="pt-14 lg:pt-0">
              <AdminLogin onSuccess={() => setCurrentPage("admin")} />
            </div>
          </main>
        </div>
      );
    }
  }

  // ── Main app ─────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Infinite top bar while Firestore loads */}
      {loading && <InfiniteLoadingBar />}

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handleSetPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Connection status bar */}
        {!loading && (
          <div className="fixed top-0 left-0 right-0 lg:left-64 z-40 pointer-events-none">
            {isConnected && (
              <div className="flex items-center justify-end px-4 py-1">
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 conn-blink" />
                  Live
                </span>
              </div>
            )}
          </div>
        )}

        <div className="pt-14 lg:pt-0 min-h-full">
          {currentPage === "home" && (
            <HomePage
              onCourseClick={handleCourseClick}
              setPage={(p) => handleSetPage(p as Page)}
            />
          )}
          {currentPage === "videos" && (
            <VideosPage onCourseClick={handleCourseClick} />
          )}
          {currentPage === "books" && (
            <BooksPage onCourseClick={handleCourseClick} />
          )}
          {currentPage === "history" && (
            <HistoryPage onCourseClick={handleCourseClick} />
          )}
          {currentPage === "admin" && isAdmin && <AdminPanel />}
        </div>
      </main>

      {/* New content real-time alerts — only for students */}
      {!isAdmin && <NewContentBanner onCourseClick={handleCourseClick} />}

      {/* Global Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
