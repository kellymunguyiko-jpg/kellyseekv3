import { useState } from "react";
import {
  Plus, Trash2, Edit3, Video, BookOpen, X,
  Youtube, ExternalLink, Upload, ChevronDown, ChevronUp,
  ShieldAlert, CheckCircle, Eye, Download, Search,
  Globe, Film, FileText, Zap, Users, Clock, Layers,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Course, ContentType, VideoPlayer } from "../types";
import type { BookPlayer } from "../types";

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null
                            && request.auth.uid == userId;
    }
    match /history/{userId}/items/{itemId} {
      allow read, write: if request.auth != null
                            && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

const CATEGORIES = [
  "Software Development",
  "Networking",
  "Accounting",
  "Food and Beverage",
  "Construction",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Software Development": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Networking": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Accounting": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Food and Beverage": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Construction": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const BOOK_PLAYERS: { value: BookPlayer; label: string; icon: string; hint: string; color: string }[] = [
  {
    value: "mega",
    label: "Mega.nz",
    icon: "☁️",
    hint: "Paste a Mega.nz file link — e.g. https://mega.nz/file/XXXX#KEY",
    color: "border-cyan-500/50 bg-cyan-500/10",
  },
  {
    value: "gdrive",
    label: "Google Drive",
    icon: "📄",
    hint: "Paste a Google Drive share/view link — it will be converted to embed",
    color: "border-blue-500/50 bg-blue-500/10",
  },
  {
    value: "pdf",
    label: "Direct PDF",
    icon: "📑",
    hint: "Paste a direct .pdf URL — it will be embedded via Google Docs viewer",
    color: "border-amber-500/50 bg-amber-500/10",
  },
];

const emptyForm = (): Omit<Course, "id"> => ({
  title: "",
  description: "",
  type: "video",
  thumbnail: "",
  videoPlayer: "youtube",
  videoUrl: "",
  bookPlayer: "mega",
  bookViewUrl: "",
  bookDownloadUrl: "",
  category: "Software Development",
  createdAt: Date.now(),
});

export default function AdminPanel() {
  const { courses, addCourse, deleteCourse, updateCourse } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Course, "id">>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "video" | "book">("all");
  const [justPublished, setJustPublished] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm());
    setEditId(null);
    setSaveError("");
    setSaveSuccess(false);
    setShowForm(true);
  };

  const openEdit = (course: Course) => {
    setForm({
      title: course.title,
      description: course.description,
      type: course.type,
      thumbnail: course.thumbnail || "",
      videoPlayer: course.videoPlayer || "youtube",
      videoUrl: course.videoUrl || "",
      bookPlayer: course.bookPlayer || "mega",
      bookViewUrl: course.bookViewUrl || "",
      bookDownloadUrl: course.bookDownloadUrl || "",
      category: course.category,
      createdAt: course.createdAt,
    });
    setEditId(course.id);
    setSaveError("");
    setSaveSuccess(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setSaveError("");
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setSaveError("Title is required.");
      return;
    }
    if (form.type === "video" && !form.videoUrl?.trim()) {
      setSaveError("Video URL is required.");
      return;
    }
    if (form.type === "book" && !form.bookViewUrl?.trim()) {
      setSaveError("Book view URL is required.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      if (editId) {
        await updateCourse(editId, form);
      } else {
        await addCourse(form);
      }
      setSaveSuccess(true);
      setJustPublished(form.title);
      setTimeout(() => {
        closeForm();
        setJustPublished(null);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed. Check your Firestore rules.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      setDeleteConfirm(null);
    } catch {}
  };

  const filteredCourses = courses.filter((c) => {
    const matchType = filterType === "all" || c.type === filterType;
    const matchSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const videosCount = courses.filter((c) => c.type === "video").length;
  const booksCount = courses.filter((c) => c.type === "book").length;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-10">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0a0a1a]/95 backdrop-blur border-b border-white/5 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-white font-black text-2xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Content you publish is <span className="text-emerald-400 font-semibold">instantly visible</span> to all students
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Content
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 space-y-6">

        {/* ── Just Published Banner ─────────────────────── */}
        {justPublished && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-4 animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-bold">Published Successfully! 🎉</p>
              <p className="text-slate-300 text-sm">
                "<span className="text-white font-semibold">{justPublished}</span>" is now live and visible to all students.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats Row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Content", value: courses.length, icon: Layers, color: "violet" },
            { label: "Videos", value: videosCount, icon: Film, color: "red" },
            { label: "Books", value: booksCount, icon: FileText, color: "blue" },
            { label: "Students", value: "Live", icon: Users, color: "emerald" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-white/[0.03] border border-white/5 rounded-2xl p-4`}>
              <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 text-${color}-400`} />
              </div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Firestore Rules Banner ────────────────────── */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 text-left"
            onClick={() => setShowRules(!showRules)}
          >
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" />
              Firestore Rules — Required for saves to work
            </div>
            {showRules ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>
          {showRules && (
            <div className="border-t border-amber-500/20 px-5 pb-5 pt-4">
              <p className="text-slate-300 text-sm mb-3">
                Go to <strong className="text-white">Firebase Console → Firestore → Rules</strong> → paste below → click <strong className="text-white">Publish</strong>:
              </p>
              <pre className="bg-[#0a0a1a] border border-white/10 rounded-xl p-4 text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                {FIRESTORE_RULES}
              </pre>
            </div>
          )}
        </div>

        {/* ── Search & Filter ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "video", "book"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  filterType === t
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                {t === "all" ? "All" : t === "video" ? "📺 Videos" : "📚 Books"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content List ──────────────────────────────── */}
        <div className="space-y-3">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">No content yet</p>
              <p className="text-slate-600 text-sm mt-1">Click "Add New Content" to publish your first lesson</p>
              <button
                onClick={openAdd}
                className="mt-4 px-5 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 rounded-xl text-sm font-medium transition-all"
              >
                + Add Content
              </button>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`group flex items-start gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all ${
                  justPublished === course.title ? "border-emerald-500/40 bg-emerald-500/5" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {course.type === "video" ? (
                        <Video className="w-6 h-6 text-slate-600" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      course.type === "video"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-violet-500/20 text-violet-400 border-violet-500/30"
                    }`}>
                      {course.type === "video" ? "📺 Video" : "📚 Book"}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      CATEGORY_COLORS[course.category] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
                    }`}>
                      {course.category}
                    </span>
                    {course.type === "video" && course.videoPlayer && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                        {course.videoPlayer === "youtube" ? "🎬 YouTube" : "☁️ Mega.nz"}
                      </span>
                    )}
                    {/* Live indicator */}
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Live
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm mt-1.5 truncate">{course.title}</p>
                  {course.description && (
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{course.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-slate-600 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {new Date(course.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(course)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 transition-all"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(course.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0f0f1f] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-white font-bold text-xl">
                  {editId ? "Edit Content" : "Add New Content"}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  {editId
                    ? "Update and re-publish to students"
                    : "Fill in the details — it goes live instantly after saving"}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Success banner */}
              {saveSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 animate-fade-in-up">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm">Published! 🎉</p>
                    <p className="text-slate-300 text-xs">Students can see this content right now.</p>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {saveError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Save Failed</p>
                    <p className="text-slate-300 text-xs mt-0.5">{saveError}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Fix: Update Firestore rules (see the yellow banner in admin panel)
                    </p>
                  </div>
                </div>
              )}

              {/* Content Type */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Content Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["video", "book"] as ContentType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        form.type === t
                          ? t === "video"
                            ? "border-red-500/60 bg-red-500/10"
                            : "border-violet-500/60 bg-violet-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      {t === "video" ? (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.type === "video" ? "bg-red-500/20" : "bg-white/5"}`}>
                          <Video className={`w-5 h-5 ${form.type === "video" ? "text-red-400" : "text-slate-400"}`} />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.type === "book" ? "bg-violet-500/20" : "bg-white/5"}`}>
                          <BookOpen className={`w-5 h-5 ${form.type === "book" ? "text-violet-400" : "text-slate-400"}`} />
                        </div>
                      )}
                      <div className="text-left">
                        <p className={`font-semibold text-sm capitalize ${form.type === t ? "text-white" : "text-slate-400"}`}>{t}</p>
                        <p className="text-[11px] text-slate-500">
                          {t === "video" ? "YouTube or Mega.nz" : "PDF viewer + download"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Python Programming"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Description</label>
                <textarea
                  placeholder="What will students learn from this content?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.category === cat
                          ? CATEGORY_COLORS[cat] || "bg-violet-500/20 text-violet-400 border-violet-500/30"
                          : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Thumbnail URL <span className="text-slate-500">(optional)</span></label>
                <input
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                {form.thumbnail && (
                  <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                    <img
                      src={form.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute bottom-2 left-2 text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full">Preview</div>
                  </div>
                )}
              </div>

              {/* ── Video Fields ── */}
              {form.type === "video" && (
                <div className="space-y-4 bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                  <h3 className="text-red-400 font-semibold text-sm flex items-center gap-2">
                    <Video className="w-4 h-4" /> Video Settings
                  </h3>

                  {/* Player choice */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Video Player</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["youtube", "mega"] as VideoPlayer[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, videoPlayer: p })}
                          className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                            form.videoPlayer === p
                              ? p === "youtube"
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-cyan-500/50 bg-cyan-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          {p === "youtube" ? (
                            <Youtube className={`w-4 h-4 ${form.videoPlayer === "youtube" ? "text-red-400" : "text-slate-400"}`} />
                          ) : (
                            <Globe className={`w-4 h-4 ${form.videoPlayer === "mega" ? "text-cyan-400" : "text-slate-400"}`} />
                          )}
                          <span className={`text-sm font-medium ${form.videoPlayer === p ? "text-white" : "text-slate-400"}`}>
                            {p === "youtube" ? "YouTube" : "Mega.nz"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1 block">
                      {form.videoPlayer === "youtube" ? "YouTube Video URL *" : "Mega.nz Video URL *"}
                    </label>
                    <p className="text-slate-500 text-xs mb-2">
                      {form.videoPlayer === "youtube"
                        ? "Paste the full YouTube URL: https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        : "Paste the Mega.nz link: https://mega.nz/file/... or https://mega.nz/embed/..."}
                    </p>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder={
                          form.videoPlayer === "youtube"
                            ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            : "https://mega.nz/file/XXXXXXXX#YYYYYYYY"
                        }
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Book Fields ── */}
              {form.type === "book" && (
                <div className="space-y-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl p-4">
                  <h3 className="text-violet-400 font-semibold text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Book Settings
                  </h3>

                  {/* Book Viewer Choice */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Book Viewer <span className="text-slate-500">— where is the book hosted?</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BOOK_PLAYERS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setForm({ ...form, bookPlayer: p.value })}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                            form.bookPlayer === p.value
                              ? p.color
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <span className="text-xl">{p.icon}</span>
                          <span className={`text-xs font-semibold ${form.bookPlayer === p.value ? "text-white" : "text-slate-400"}`}>
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* Hint for selected player */}
                    {form.bookPlayer && (
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                        {BOOK_PLAYERS.find((p) => p.value === form.bookPlayer)?.hint}
                      </p>
                    )}
                  </div>

                  {/* View URL */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1 block">
                      {form.bookPlayer === "mega"
                        ? "☁️ Mega.nz File URL *"
                        : form.bookPlayer === "gdrive"
                        ? "📄 Google Drive URL *"
                        : "📑 Direct PDF URL *"}
                    </label>
                    <div className="relative">
                      <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder={
                          form.bookPlayer === "mega"
                            ? "https://mega.nz/file/XXXXXXXX#YYYYYYYY"
                            : form.bookPlayer === "gdrive"
                            ? "https://drive.google.com/file/d/FILE_ID/view"
                            : "https://example.com/book.pdf"
                        }
                        value={form.bookViewUrl}
                        onChange={(e) => setForm({ ...form, bookViewUrl: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                    {/* Live preview of what the embed will look like */}
                    {form.bookPlayer === "mega" && form.bookViewUrl?.includes("mega.nz") && (
                      <div className="mt-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="text-cyan-400 text-xs">☁️</span>
                        <span className="text-cyan-300 text-xs font-medium">Mega.nz link detected — will embed using the official Mega.nz viewer</span>
                      </div>
                    )}
                    {form.bookPlayer === "gdrive" && form.bookViewUrl?.includes("drive.google.com") && (
                      <div className="mt-2 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="text-blue-400 text-xs">📄</span>
                        <span className="text-blue-300 text-xs font-medium">Google Drive link detected — will embed using Drive preview</span>
                      </div>
                    )}
                  </div>

                  {/* Download URL (Mega.nz) */}
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1 block">
                      Mega.nz Download URL <span className="text-slate-500">(optional)</span>
                    </label>
                    <p className="text-slate-500 text-xs mb-2">
                      Students will get a green download button linking to Mega.nz.
                    </p>
                    <div className="relative">
                      <Download className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://mega.nz/file/XXXXXXXX#YYYYYYYY"
                        value={form.bookDownloadUrl}
                        onChange={(e) => setForm({ ...form, bookDownloadUrl: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing…
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Published! ✓
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      {editId ? "Update & Publish" : "Save & Publish"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0f0f1f] border border-red-500/20 rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg text-center">Delete Content?</h3>
            <p className="text-slate-400 text-sm text-center mt-2">
              This will be <span className="text-red-400 font-semibold">immediately removed</span> from the website. Students will no longer see it. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all hover:scale-105 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
