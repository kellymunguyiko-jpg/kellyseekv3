import { useEffect, useState } from "react";
import {
  ArrowLeft, Download, ExternalLink, BookOpen,
  Tag, Cloud, FileText, Loader2, CheckCircle2,
} from "lucide-react";
import { Course } from "../types";

interface BookViewerProps {
  course: Course;
  onBack: () => void;
}

const categoryColor: Record<string, string> = {
  "Software Development": "bg-blue-500/20 text-blue-300 border-blue-500/20",
  Networking: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",
  Accounting: "bg-amber-500/20 text-amber-300 border-amber-500/20",
  "Food and Beverage": "bg-orange-500/20 text-orange-300 border-orange-500/20",
  Construction: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
};

function detectPlayer(url: string): "mega" | "gdrive" | "pdf" {
  if (!url) return "pdf";
  if (url.includes("mega.nz")) return "mega";
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) return "gdrive";
  return "pdf";
}

function getViewUrl(course: Course): string {
  const raw = course.bookViewUrl || "";
  const player = course.bookPlayer || detectPlayer(raw);

  if (player === "mega") {
    // Return the original mega link (not embed) so it opens properly in mega.nz
    return raw;
  }
  if (player === "gdrive") {
    // Convert to /view link for Google Drive
    if (raw.includes("/preview")) return raw.replace("/preview", "/view");
    if (raw.includes("/view") || raw.includes("/edit")) return raw;
    const idMatch = raw.match(/[?&]id=([^&]+)/);
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/view`;
    return raw;
  }
  return raw;
}

function getPlayerInfo(course: Course): {
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  description: string;
} {
  const p = course.bookPlayer || detectPlayer(course.bookViewUrl || "");
  if (p === "mega") {
    return {
      name: "Mega.nz",
      icon: <Cloud size={20} />,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      description: "This book is hosted on Mega.nz. Click below to open it.",
    };
  }
  if (p === "gdrive") {
    return {
      name: "Google Drive",
      icon: <FileText size={20} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      description: "This book is hosted on Google Drive. Click below to open it.",
    };
  }
  return {
    name: "PDF Viewer",
    icon: <FileText size={20} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    description: "This book is available as a PDF. Click below to open it.",
  };
}

export default function BookViewer({ course, onBack }: BookViewerProps) {
  const [countdown, setCountdown] = useState(3);
  const [opened, setOpened] = useState(false);

  const viewUrl = getViewUrl(course);
  const downloadUrl = course.bookDownloadUrl || "";
  const catStyle = categoryColor[course.category] || "bg-indigo-500/20 text-indigo-300 border-indigo-500/20";
  const playerInfo = getPlayerInfo(course);

  // Auto-open after 3-second countdown
  useEffect(() => {
    if (!viewUrl) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.open(viewUrl, "_blank", "noopener,noreferrer");
          setOpened(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [viewUrl]);

  const handleOpenNow = () => {
    window.open(viewUrl, "_blank", "noopener,noreferrer");
    setOpened(true);
    setCountdown(0);
  };

  const progress = ((3 - countdown) / 3) * 100;

  return (
    <div className="flex flex-col h-full bg-[#080810]">

      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0d0d1a]/95 border-b border-white/[0.06] backdrop-blur-sm flex-shrink-0">
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
            <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
              <BookOpen size={9} /> Book
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 border ${catStyle}`}>
              <Tag size={9} />
              {course.category}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 border ${playerInfo.bg} ${playerInfo.color} ${playerInfo.border}`}>
              {playerInfo.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Open</span>
            </a>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-lg transition border border-emerald-500/20"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div className="max-w-lg w-full">

          {/* Book Card */}
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">

            {/* Top gradient band */}
            <div className={`h-2 w-full ${
              playerInfo.name === "Mega.nz"
                ? "bg-gradient-to-r from-cyan-500 to-teal-400"
                : playerInfo.name === "Google Drive"
                ? "bg-gradient-to-r from-blue-500 to-indigo-400"
                : "bg-gradient-to-r from-amber-500 to-orange-400"
            }`} />

            <div className="p-8 flex flex-col items-center gap-6">

              {/* Book Cover */}
              <div className="relative group">
                <div className="w-40 h-52 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 flex items-center justify-center">
                      <BookOpen size={52} className="text-white/40" />
                    </div>
                  )}
                </div>
                {/* Book spine */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/40 rounded-l-2xl" />
                {/* Platform badge */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${playerInfo.bg} ${playerInfo.color} ${playerInfo.border} backdrop-blur-sm whitespace-nowrap`}>
                  {playerInfo.icon}
                  {playerInfo.name}
                </div>
              </div>

              {/* Title & Category */}
              <div className="text-center mt-3">
                <h1 className="text-white font-black text-xl leading-snug mb-2">
                  {course.title}
                </h1>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${catStyle}`}>
                  {course.category}
                </span>
                {course.description && (
                  <p className="text-white/40 text-sm leading-relaxed mt-3 max-w-sm">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Status / Countdown */}
              {viewUrl ? (
                <div className="w-full flex flex-col items-center gap-4">

                  {!opened ? (
                    <>
                      {/* Countdown ring */}
                      <div className="relative flex items-center justify-center">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="6"
                          />
                          <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke={playerInfo.name === "Mega.nz" ? "#22d3ee" : playerInfo.name === "Google Drive" ? "#60a5fa" : "#fbbf24"}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <Loader2 size={14} className="text-white/40 animate-spin mb-0.5" />
                          <span className="text-white font-black text-2xl leading-none">{countdown}</span>
                        </div>
                      </div>

                      <p className="text-white/50 text-sm text-center">
                        Opening on <span className={`font-bold ${playerInfo.color}`}>{playerInfo.name}</span> in {countdown} second{countdown !== 1 ? "s" : ""}…
                      </p>

                      {/* Open Now button */}
                      <button
                        onClick={handleOpenNow}
                        className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
                          playerInfo.name === "Mega.nz"
                            ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/30"
                            : playerInfo.name === "Google Drive"
                            ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30"
                            : "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/30"
                        }`}
                      >
                        <ExternalLink size={16} />
                        Open on {playerInfo.name} Now
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Opened state */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                          <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <p className="text-emerald-400 font-bold text-base">Opened successfully!</p>
                        <p className="text-white/40 text-sm text-center">
                          The book is now open in a new tab on <span className={`font-semibold ${playerInfo.color}`}>{playerInfo.name}</span>.
                        </p>
                      </div>

                      {/* Open Again button */}
                      <button
                        onClick={handleOpenNow}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition border border-white/10"
                      >
                        <ExternalLink size={15} />
                        Open Again
                      </button>
                    </>
                  )}

                  {/* Download button */}
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 transition border border-emerald-500/20"
                    >
                      <Download size={15} />
                      Download from Mega.nz
                    </a>
                  )}
                </div>
              ) : (
                /* No URL configured */
                <div className="w-full text-center bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-5">
                  <p className="text-red-300 text-sm font-medium">
                    No view link configured for this book yet.
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    Please ask the admin to add a view URL.
                  </p>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold transition"
                    >
                      <Download size={14} />
                      Download from Mega.nz
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Bottom info strip */}
            <div className="border-t border-white/[0.06] px-6 py-3 flex items-center justify-between bg-white/[0.02]">
              <span className="text-white/25 text-xs">Skill Up Platform</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/25 text-xs">Redirecting to {playerInfo.name}</span>
              </div>
            </div>
          </div>

          {/* Back hint */}
          <p className="text-center text-white/20 text-xs mt-5">
            Come back to this tab to continue browsing Skill Up
          </p>
        </div>
      </div>
    </div>
  );
}
