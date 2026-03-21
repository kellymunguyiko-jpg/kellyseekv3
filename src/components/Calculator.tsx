import { useState, useCallback, useEffect } from "react";
import { X, Delete, Clock, RotateCcw } from "lucide-react";

interface CalcProps {
  onClose: () => void;
}

type Mode = "standard" | "scientific";

const HISTORY_KEY = "skillup_calc_history";

export default function Calculator({ onClose }: CalcProps) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [mode, setMode] = useState<Mode>("standard");
  const [history, setHistory] = useState<{ expr: string; result: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isDeg, setIsDeg] = useState(true);
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const saveHistory = (expr: string, result: string) => {
    const newH = [{ expr, result }, ...history].slice(0, 30);
    setHistory(newH);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newH));
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angleConv = (val: number) => isDeg ? toRad(val) : val;

  const inputDigit = useCallback((digit: string) => {
    if (justEvaluated && !/[+\-×÷^%]/.test(digit)) {
      setDisplay(digit);
      setExpression(digit);
      setJustEvaluated(false);
      setWaitingForOperand(false);
      return;
    }
    setJustEvaluated(false);
    if (waitingForOperand) {
      setDisplay(digit);
      setExpression(prev => prev + digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === "0" ? digit : prev + digit);
      setExpression(prev => prev === "0" ? digit : prev + digit);
    }
  }, [waitingForOperand, justEvaluated]);

  const inputDot = useCallback(() => {
    setJustEvaluated(false);
    if (waitingForOperand) {
      setDisplay("0.");
      setExpression(prev => prev + "0.");
      setWaitingForOperand(false);
      return;
    }
    // Find last number segment
    const lastNum = display.split(/[+\-×÷]/).pop() || "";
    if (!lastNum.includes(".")) {
      setDisplay(prev => prev + ".");
      setExpression(prev => prev + ".");
    }
  }, [display, waitingForOperand]);

  const inputOperator = useCallback((op: string) => {
    setJustEvaluated(false);
    setWaitingForOperand(true);
    setExpression(prev => {
      // Replace trailing operator if exists
      const trimmed = prev.replace(/[+\-×÷^]$/, "");
      return trimmed + op;
    });
    setDisplay(prev => {
      const parts = prev.split(/[+\-×÷^]/);
      return parts[parts.length - 1] || prev;
    });
  }, []);

  const evaluate = useCallback(() => {
    if (!expression) return;
    try {
      // Build safe expression
      let expr = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**")
        .replace(/π/g, String(Math.PI))
        .replace(/e(?![0-9])/g, String(Math.E));

      // eslint-disable-next-line no-new-func
      const raw = new Function(`"use strict"; return (${expr})`)();
      const result = isFinite(raw)
        ? parseFloat(raw.toFixed(10)).toString()
        : raw === Infinity ? "∞" : raw === -Infinity ? "-∞" : "Error";

      saveHistory(expression, result);
      setDisplay(result);
      setExpression(result);
      setWaitingForOperand(false);
      setJustEvaluated(true);
    } catch {
      setDisplay("Error");
      setExpression("");
      setWaitingForOperand(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression]);

  const clearAll = () => {
    setDisplay("0");
    setExpression("");
    setWaitingForOperand(false);
    setJustEvaluated(false);
  };

  const backspace = () => {
    if (justEvaluated) { clearAll(); return; }
    if (expression.length <= 1) {
      setDisplay("0"); setExpression(""); return;
    }
    const next = expression.slice(0, -1);
    setExpression(next);
    setDisplay(next || "0");
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const result = (-val).toString();
    setDisplay(result);
    setExpression(result);
  };

  const percent = () => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const result = (val / 100).toString();
    setDisplay(result);
    setExpression(result);
  };

  // Scientific functions
  const sciFunc = (fn: string) => {
    setJustEvaluated(false);
    const val = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin": result = Math.sin(angleConv(val)); break;
      case "cos": result = Math.cos(angleConv(val)); break;
      case "tan": result = Math.tan(angleConv(val)); break;
      case "asin": result = isDeg ? (Math.asin(val) * 180) / Math.PI : Math.asin(val); break;
      case "acos": result = isDeg ? (Math.acos(val) * 180) / Math.PI : Math.acos(val); break;
      case "atan": result = isDeg ? (Math.atan(val) * 180) / Math.PI : Math.atan(val); break;
      case "log": result = Math.log10(val); break;
      case "ln": result = Math.log(val); break;
      case "sqrt": result = Math.sqrt(val); break;
      case "cbrt": result = Math.cbrt(val); break;
      case "sq": result = val * val; break;
      case "cube": result = val * val * val; break;
      case "inv": result = 1 / val; break;
      case "exp": result = Math.exp(val); break;
      case "abs": result = Math.abs(val); break;
      case "fact":
        if (val < 0 || !Number.isInteger(val)) { setDisplay("Error"); return; }
        result = val <= 20 ? Array.from({length: val}, (_, i) => i + 1).reduce((a, b) => a * b, 1) : Infinity;
        break;
      default: return;
    }
    const res = isFinite(result) ? parseFloat(result.toFixed(10)).toString() : result === Infinity ? "∞" : "Error";
    const expr = `${fn}(${val})`;
    saveHistory(expr, res);
    setDisplay(res);
    setExpression(res);
    setJustEvaluated(true);
  };

  const insertConst = (val: string) => {
    setJustEvaluated(false);
    if (waitingForOperand || display === "0") {
      setDisplay(val); setExpression(prev => prev + val);
    } else {
      setDisplay(prev => prev + val); setExpression(prev => prev + val);
    }
    setWaitingForOperand(false);
  };

  // Memory
  const memStore = () => { setMemory(parseFloat(display)); setHasMemory(true); };
  const memRecall = () => { if (!hasMemory) return; setDisplay(memory.toString()); setExpression(memory.toString()); };
  const memAdd = () => { setMemory(m => m + parseFloat(display)); setHasMemory(true); };
  const memSub = () => { setMemory(m => m - parseFloat(display)); setHasMemory(true); };
  const memClear = () => { setMemory(0); setHasMemory(false); };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
      else if (e.key === ".") inputDot();
      else if (e.key === "+") inputOperator("+");
      else if (e.key === "-") inputOperator("-");
      else if (e.key === "*") inputOperator("×");
      else if (e.key === "/") { e.preventDefault(); inputOperator("÷"); }
      else if (e.key === "Enter" || e.key === "=") evaluate();
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearAll();
      else if (e.key === "%") percent();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputDigit, inputDot, inputOperator, evaluate]);

  const Btn = ({
    label, onClick, className = "", wide = false, tall = false,
  }: {
    label: string; onClick: () => void; className?: string; wide?: boolean; tall?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`
        ${wide ? "col-span-2" : ""} ${tall ? "row-span-2" : ""}
        flex items-center justify-center rounded-2xl font-semibold text-sm
        active:scale-95 transition-all duration-100 select-none
        h-12 ${className}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`bg-[#1c1c1e] rounded-3xl shadow-2xl shadow-black/80 border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${mode === "scientific" ? "w-[520px]" : "w-80"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">∑</span>
            </div>
            <span className="text-white font-bold text-sm">Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <button
              onClick={() => setMode(m => m === "standard" ? "scientific" : "standard")}
              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/10 text-indigo-300 hover:bg-indigo-500/30 transition"
            >
              {mode === "standard" ? "Scientific" : "Standard"}
            </button>
            <button
              onClick={() => setShowHistory(v => !v)}
              className={`p-1.5 rounded-lg transition ${showHistory ? "bg-indigo-500/30 text-indigo-300" : "text-white/40 hover:text-white hover:bg-white/10"}`}
              title="History"
            >
              <Clock size={14} />
            </button>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Main calc */}
          <div className="flex-1 px-4 pb-4">
            {/* Display */}
            <div className="bg-[#2c2c2e] rounded-2xl px-4 py-3 mb-3">
              {/* Expression */}
              <div className="text-white/40 text-xs font-mono min-h-[16px] text-right truncate">
                {expression || "0"}
              </div>
              {/* Main display */}
              <div className={`text-right font-bold text-white transition-all ${display.length > 12 ? "text-2xl" : display.length > 8 ? "text-3xl" : "text-4xl"} mt-1 font-mono tracking-tight`}>
                {display.length > 16 ? parseFloat(display).toExponential(6) : display}
              </div>
              {/* Memory indicator */}
              {hasMemory && (
                <div className="text-right text-[10px] text-violet-400 font-mono mt-1">
                  M: {memory}
                </div>
              )}
            </div>

            {/* Scientific row */}
            {mode === "scientific" && (
              <>
                {/* DEG/RAD + Memory */}
                <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                  <button
                    onClick={() => setIsDeg(v => !v)}
                    className="col-span-1 h-9 rounded-xl bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 hover:bg-amber-500/30 transition"
                  >
                    {isDeg ? "DEG" : "RAD"}
                  </button>
                  {[
                    { l: "MC", fn: memClear },
                    { l: "MR", fn: memRecall },
                    { l: "M+", fn: memAdd },
                    { l: "M-", fn: memSub },
                  ].map(({ l, fn }) => (
                    <button key={l} onClick={fn}
                      className={`h-9 rounded-xl text-[11px] font-bold transition ${hasMemory ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30" : "bg-white/5 text-white/30 border border-white/10"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Sci functions row 1 */}
                <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                  {[
                    { l: "sin", fn: () => sciFunc("sin") },
                    { l: "cos", fn: () => sciFunc("cos") },
                    { l: "tan", fn: () => sciFunc("tan") },
                    { l: "π", fn: () => insertConst("π") },
                    { l: "e", fn: () => insertConst("e") },
                  ].map(({ l, fn }) => (
                    <button key={l} onClick={fn}
                      className="h-9 rounded-xl bg-indigo-500/15 text-indigo-300 text-[11px] font-bold hover:bg-indigo-500/30 border border-indigo-500/20 transition"
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Sci functions row 2 */}
                <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                  {[
                    { l: "sin⁻¹", fn: () => sciFunc("asin") },
                    { l: "cos⁻¹", fn: () => sciFunc("acos") },
                    { l: "tan⁻¹", fn: () => sciFunc("atan") },
                    { l: "log", fn: () => sciFunc("log") },
                    { l: "ln", fn: () => sciFunc("ln") },
                  ].map(({ l, fn }) => (
                    <button key={l} onClick={fn}
                      className="h-9 rounded-xl bg-indigo-500/15 text-indigo-300 text-[11px] font-bold hover:bg-indigo-500/30 border border-indigo-500/20 transition"
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Sci functions row 3 */}
                <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                  {[
                    { l: "x²", fn: () => sciFunc("sq") },
                    { l: "x³", fn: () => sciFunc("cube") },
                    { l: "√x", fn: () => sciFunc("sqrt") },
                    { l: "∛x", fn: () => sciFunc("cbrt") },
                    { l: "1/x", fn: () => sciFunc("inv") },
                  ].map(({ l, fn }) => (
                    <button key={l} onClick={fn}
                      className="h-9 rounded-xl bg-cyan-500/15 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/30 border border-cyan-500/20 transition"
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Sci functions row 4 */}
                <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                  {[
                    { l: "eˣ", fn: () => sciFunc("exp") },
                    { l: "|x|", fn: () => sciFunc("abs") },
                    { l: "n!", fn: () => sciFunc("fact") },
                    { l: "xʸ", fn: () => inputOperator("^") },
                    { l: "MS", fn: memStore },
                  ].map(({ l, fn }) => (
                    <button key={l} onClick={fn}
                      className="h-9 rounded-xl bg-cyan-500/15 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/30 border border-cyan-500/20 transition"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Standard button grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Row 1 */}
              <Btn label="AC" onClick={clearAll}
                className="bg-[#636366] hover:bg-[#7c7c80] text-white" />
              <Btn label="+/-" onClick={toggleSign}
                className="bg-[#636366] hover:bg-[#7c7c80] text-white" />
              <Btn label="%" onClick={percent}
                className="bg-[#636366] hover:bg-[#7c7c80] text-white" />
              <Btn label="÷" onClick={() => inputOperator("÷")}
                className="bg-[#ff9f0a] hover:bg-[#ffb340] text-white text-xl" />

              {/* Row 2 */}
              <Btn label="7" onClick={() => inputDigit("7")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="8" onClick={() => inputDigit("8")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="9" onClick={() => inputDigit("9")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="×" onClick={() => inputOperator("×")}
                className="bg-[#ff9f0a] hover:bg-[#ffb340] text-white text-xl" />

              {/* Row 3 */}
              <Btn label="4" onClick={() => inputDigit("4")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="5" onClick={() => inputDigit("5")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="6" onClick={() => inputDigit("6")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="-" onClick={() => inputOperator("-")}
                className="bg-[#ff9f0a] hover:bg-[#ffb340] text-white text-xl" />

              {/* Row 4 */}
              <Btn label="1" onClick={() => inputDigit("1")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="2" onClick={() => inputDigit("2")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="3" onClick={() => inputDigit("3")}
                className="bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg" />
              <Btn label="+" onClick={() => inputOperator("+")}
                className="bg-[#ff9f0a] hover:bg-[#ffb340] text-white text-xl" />

              {/* Row 5 */}
              <button
                onClick={() => inputDigit("0")}
                className="col-span-2 h-12 rounded-2xl bg-[#3a3a3c] hover:bg-[#48484a] text-white text-lg font-semibold flex items-center pl-5 active:scale-95 transition-all duration-100 select-none"
              >
                0
              </button>
              <button
                onClick={backspace}
                className="h-12 rounded-2xl bg-[#3a3a3c] hover:bg-[#48484a] text-white flex items-center justify-center active:scale-95 transition-all duration-100"
              >
                <Delete size={16} />
              </button>
              <Btn label="=" onClick={evaluate}
                className="bg-[#ff9f0a] hover:bg-[#ffb340] text-white text-xl" />
            </div>
          </div>

          {/* History panel */}
          {showHistory && (
            <div className="w-52 border-l border-white/10 bg-[#18181a] flex flex-col">
              <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">History</span>
                <button
                  onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }}
                  className="text-white/30 hover:text-red-400 transition"
                  title="Clear history"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {history.length === 0 ? (
                  <p className="text-white/20 text-xs text-center mt-8 px-4">No history yet</p>
                ) : (
                  history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { setDisplay(h.result); setExpression(h.result); setJustEvaluated(true); }}
                      className="w-full px-3 py-2 hover:bg-white/5 transition text-right group"
                    >
                      <div className="text-white/40 text-[10px] font-mono truncate group-hover:text-white/60 transition">
                        {h.expr}
                      </div>
                      <div className="text-white text-sm font-bold font-mono group-hover:text-amber-300 transition">
                        = {h.result}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
