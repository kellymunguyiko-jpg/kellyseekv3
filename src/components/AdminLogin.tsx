import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Key } from "lucide-react";
import { useApp } from "../context/AppContext";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const ADMIN_CODE = "2009Dniyibizi123@";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { setIsAdmin } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code !== ADMIN_CODE) {
      setError("Invalid admin code.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdmin(true);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message;
        if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
          setError("Invalid email or password.");
        } else if (msg.includes("too-many-requests")) {
          setError("Too many attempts. Try again later.");
        } else {
          // Still allow if credentials match locally (offline fallback)
          if (email && password) {
            setError("Authentication error. Check your connection.");
          } else {
            setError(msg);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <ShieldCheck size={40} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-1">Admin Access</h2>
          <p className="text-indigo-300 text-center text-sm mb-8">
            Enter your credentials to manage content
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Admin Code */}
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                type={showCode ? "text" : "password"}
                placeholder="Admin Secret Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition"
              >
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Login as Admin
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
