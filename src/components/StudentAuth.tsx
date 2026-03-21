import { useState } from "react";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  BookOpen,
  Video,
  Code2,
} from "lucide-react";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useApp } from "../context/AppContext";

type Mode = "login" | "signup";

interface StudentAuthProps {
  onSuccess: () => void;
}

export default function StudentAuth({ onSuccess }: StudentAuthProps) {
  const { setStudent } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const switchMode = (m: Mode) => {
    resetForm();
    setMode(m);
  };

  const parseError = (msg: string): string => {
    if (msg.includes("email-already-in-use"))
      return "This email is already registered. Please sign in instead.";
    if (
      msg.includes("user-not-found") ||
      msg.includes("invalid-credential") ||
      msg.includes("wrong-password")
    )
      return "Invalid email or password. Please try again.";
    if (msg.includes("weak-password"))
      return "Password is too weak. Use at least 6 characters.";
    if (msg.includes("invalid-email"))
      return "Please enter a valid email address.";
    if (msg.includes("too-many-requests"))
      return "Too many attempts. Please try again later.";
    if (msg.includes("popup-closed-by-user"))
      return "Google sign-in was cancelled.";
    if (msg.includes("popup-blocked"))
      return "Popup was blocked. Please allow popups for this site.";
    if (msg.includes("network-request-failed"))
      return "Network error. Check your internet connection.";
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name.trim() });
        setStudent({
          uid: cred.user.uid,
          name: name.trim(),
          email: cred.user.email!,
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setStudent({
          uid: cred.user.uid,
          name: cred.user.displayName || email.split("@")[0],
          email: cred.user.email!,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) setError(parseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setStudent({
        uid: user.uid,
        name: user.displayName || user.email!.split("@")[0],
        email: user.email!,
      });
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) setError(parseError(err.message));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
      {/* Left Panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <span className="text-white font-black text-4xl">S</span>
            </div>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            Skill Up
          </h1>
          <p className="text-indigo-300 text-lg mb-12 max-w-xs leading-relaxed">
            Your gateway to professional courses in tech, business & more.
          </p>

          {/* Feature cards */}
          <div className="flex flex-col gap-3 items-center">
            {[
              {
                icon: Video,
                color: "indigo",
                label: "HD Video Lessons",
                sub: "YouTube & Mega.nz",
              },
              {
                icon: BookOpen,
                color: "violet",
                label: "Downloadable Books",
                sub: "Open directly on Mega.nz",
              },
              {
                icon: Code2,
                color: "emerald",
                label: "Built-in Code IDE",
                sub: "VS Code-like editor",
              },
              {
                icon: GraduationCap,
                color: "pink",
                label: "5 Pro Categories",
                sub: "Dev, Network, Accounting & more",
              },
            ].map(({ icon: Icon, color, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-white/8 backdrop-blur rounded-2xl px-5 py-3 border border-white/10 w-full max-w-xs text-left"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={16} className={`text-${color}-300`} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">
                    {label}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-none">
                  Skill Up
                </h1>
                <p className="text-indigo-300 text-xs">Online Learning</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
            {/* Tab switcher */}
            <div className="flex bg-white/8 rounded-2xl p-1 mb-7">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === "login"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "text-indigo-300 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "text-indigo-300 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">
                {mode === "login" ? "Welcome back! 👋" : "Create account 🎓"}
              </h2>
              <p className="text-indigo-300/80 text-sm mt-1">
                {mode === "login"
                  ? "Sign in to continue your learning journey"
                  : "Join thousands of students learning today"}
              </p>
            </div>

            {/* ── Google Sign-In Button ── */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md mb-4 border border-gray-200"
            >
              {googleLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                /* Google SVG logo */
                <svg viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                  <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                  <path fill="#FBBC05" d="M11.68 28.18A13.5 13.5 0 0111.18 24c0-1.45.25-2.86.5-4.18v-5.7H4.34A21.99 21.99 0 002 24c0 3.55.85 6.91 2.34 9.88l7.34-5.7z"/>
                  <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7c1.74-5.2 6.59-9.07 12.32-9.07z"/>
                </svg>
              )}
              {googleLoading
                ? "Signing in with Google…"
                : `Continue with Google`}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Name (signup only) */}
              {mode === "signup" && (
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Confirm Password (signup only) */}
              {mode === "signup" && (
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="mt-1 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Switch link */}
            <p className="text-center text-sm text-indigo-300/70 mt-5">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-indigo-400 hover:text-white font-semibold transition"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>

            {/* Google note */}
            <p className="text-center text-[10px] text-white/20 mt-4 leading-relaxed">
              By continuing, you agree to Skill Up's Terms of Service.
              <br />
              Google sign-in uses your Google account securely via Firebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
