import { useEffect, useState } from "react";
import React from "react";
import { CheckCircle, XCircle, Info, X, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toast } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) setVisible(true);
    else setVisible(false);
  }, [toast]);

  if (!toast || !visible) return null;

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle size={20} className="text-green-400 flex-shrink-0" />,
    error: <XCircle size={20} className="text-red-400 flex-shrink-0" />,
    info: <Info size={20} className="text-blue-400 flex-shrink-0" />,
    new: <Sparkles size={20} className="text-violet-400 flex-shrink-0" />,
  };

  const borders: Record<string, string> = {
    success: "border-green-500/40 bg-green-900/30",
    error: "border-red-500/40 bg-red-900/30",
    info: "border-blue-500/40 bg-blue-900/30",
    new: "border-violet-500/40 bg-violet-900/30",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full px-4 animate-slide-up">
      <div
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <p className="text-white text-sm leading-relaxed flex-1">{toast.msg}</p>
        <button
          onClick={() => setVisible(false)}
          className="text-white/50 hover:text-white transition flex-shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
