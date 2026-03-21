import { useState } from "react";
import {
  Home,
  Video,
  BookOpen,
  History,
  ShieldCheck,
  X,
  Menu,
  LogOut,
  LogIn,
  Code2,
  Calculator as CalcIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import IDE from "./IDE";
import Calculator from "./Calculator";

type Page = "home" | "videos" | "books" | "history" | "admin" | "auth";

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (p: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const navItems = [
  { id: "home" as Page, label: "Home", icon: Home },
  { id: "videos" as Page, label: "Videos", icon: Video },
  { id: "books" as Page, label: "Books", icon: BookOpen },
  { id: "history" as Page, label: "History", icon: History },
];

export default function Sidebar({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const { isAdmin, setIsAdmin, student, logoutStudent } = useApp();
  const [showIDE, setShowIDE] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logoutStudent();
    setIsAdmin(false);
    handleNav("home");
  };

  // Avatar initials
  const initials = student
    ? student.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  // Avatar background based on name
  const avatarGradients = [
    "from-violet-500 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
  ];
  const avatarGrad =
    avatarGradients[
      (student?.name.charCodeAt(0) || 0) % avatarGradients.length
    ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#0f172a] via-[#130f2a] to-[#0f172a] z-40 flex flex-col shadow-2xl transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none tracking-tight">
                Skill Up
              </h1>
              <p className="text-indigo-300 text-[10px] font-medium mt-0.5">
                Online Learning
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/50 hover:text-white lg:hidden transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Student profile strip (if logged in) */}
        {student && !isAdmin && (
          <div className="mx-3 mt-4 px-3 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center flex-shrink-0 shadow`}
            >
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {student.name}
              </p>
              <p className="text-indigo-400 text-[10px] truncate">
                {student.email}
              </p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {/* Main navigation */}
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left
                ${
                  currentPage === id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-indigo-200/80 hover:bg-white/8 hover:text-white"
                }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-white/10" />

          {/* Tools section */}
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-3 mb-2">
            Tools
          </p>

          {/* IDE Button */}
          <button
            onClick={() => {
              setShowIDE(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 group"
          >
            <div className="relative">
              <Code2 size={16} className="flex-shrink-0" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <span>Code IDE</span>
              <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                VS Code
              </span>
            </div>
          </button>

          {/* Calculator Button */}
          <button
            onClick={() => {
              setShowCalc(true);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 group"
          >
            <div className="relative">
              <CalcIcon size={16} className="flex-shrink-0" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <span>Calculator</span>
              <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                Scientific
              </span>
            </div>
          </button>
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-5 border-t border-white/10 pt-3 flex flex-col gap-1">
          {/* Admin buttons */}
          {isAdmin ? (
            <>
              <button
                onClick={() => handleNav("admin")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                  ${
                    currentPage === "admin"
                      ? "bg-violet-600 text-white"
                      : "text-violet-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <ShieldCheck size={16} />
                Admin Panel
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : student ? (
            <>
              {/* Admin login link */}
              <button
                onClick={() => handleNav("admin")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-all w-full text-left"
              >
                <ShieldCheck size={16} />
                Admin Login
              </button>
              {/* Student logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Student login */}
              <button
                onClick={() => handleNav("auth")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                  ${
                    currentPage === "auth"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-indigo-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <LogIn size={16} />
                Student Login
              </button>
              {/* Admin login */}
              <button
                onClick={() => handleNav("admin")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-all w-full text-left"
              >
                <ShieldCheck size={16} />
                Admin Login
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-indigo-700/90 backdrop-blur text-white p-2 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile student avatar top-right */}
      {student && !sidebarOpen && (
        <div className="fixed top-3 right-4 z-50 lg:hidden">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center shadow-lg border-2 border-white/20`}
          >
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      )}

      {/* IDE Modal */}
      {showIDE && <IDE onClose={() => setShowIDE(false)} />}

      {/* Calculator Modal */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </>
  );
}
