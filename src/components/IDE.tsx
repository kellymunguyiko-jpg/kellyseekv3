import { useState, useRef, useCallback, useEffect } from "react";
import {
  X, Play, Plus, Trash2, FileCode, ChevronRight, Terminal,
  RefreshCw, Download, Copy, Check, FolderOpen,
  Globe, Layout, Maximize2, Minimize2, RotateCcw,
} from "lucide-react";

interface IDEFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

const LANG_COLORS: Record<string, string> = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python:     "#3572A5",
  html:       "#e34c26",
  css:        "#563d7c",
  json:       "#292929",
  cpp:        "#f34b7d",
  java:       "#b07219",
  bash:       "#89e051",
};

const LANG_EXT: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python:     "py",
  html:       "html",
  css:        "css",
  json:       "json",
  cpp:        "cpp",
  java:       "java",
  bash:       "sh",
};

const DEFAULT_FILES: IDEFile[] = [
  {
    id: "html",
    name: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #e2e8f0;
      padding: 20px;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .logo {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, #818cf8, #6366f1);
      border-radius: 16px;
      margin: 0 auto 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      box-shadow: 0 8px 32px rgba(99,102,241,0.4);
    }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; background: linear-gradient(90deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: #94a3b8; margin-bottom: 24px; line-height: 1.6; }
    button {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; border: none; padding: 12px 28px;
      border-radius: 12px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(99,102,241,0.4);
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,0.5); }
    button:active { transform: translateY(0); }
    .counter {
      font-size: 3rem; font-weight: 900; color: #818cf8;
      margin: 16px 0; font-variant-numeric: tabular-nums;
    }
    .row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-red { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 20px rgba(239,68,68,0.4); }
    .btn-green { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 20px rgba(34,197,94,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🚀</div>
    <h1>Skill Up IDE</h1>
    <p>Write HTML, CSS & JavaScript and see it live in real-time. Click Run to refresh the preview!</p>
    <div class="counter" id="count">0</div>
    <div class="row">
      <button class="btn-green" onclick="change(1)">+ Increment</button>
      <button class="btn-red" onclick="change(-1)">− Decrement</button>
      <button onclick="reset()">↺ Reset</button>
    </div>
  </div>
  <script>
    let count = 0;
    function change(delta) {
      count += delta;
      document.getElementById('count').textContent = count;
    }
    function reset() {
      count = 0;
      document.getElementById('count').textContent = count;
    }
  </script>
</body>
</html>`,
  },
  {
    id: "js",
    name: "script.js",
    language: "javascript",
    content: `// Welcome to Skill Up IDE 🚀
// This file runs in the terminal. Write JS and click Run!

function greet(name) {
  return \`Hello, \${name}! Welcome to Skill Up!\`;
}

console.log(greet("Student"));

// Array operations
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Even numbers:", evens);
console.log("Sum 1-10:", sum);

// Object & destructuring
const course = {
  title: "JavaScript Mastery",
  level: "Intermediate",
  topics: ["Arrays", "Objects", "Async/Await", "DOM"],
  rating: 4.9
};

const { title, topics } = course;
console.log(\`Course: \${title}\`);
topics.forEach((t, i) => console.log(\`  \${i + 1}. \${t}\`));

// Async simulation
async function fetchData() {
  return new Promise(resolve => setTimeout(() => resolve({ status: "ok", data: [1, 2, 3] }), 100));
}

fetchData().then(res => console.log("Fetched:", JSON.stringify(res)));
`,
  },
  {
    id: "py",
    name: "main.py",
    language: "python",
    content: `# Python Practice - Skill Up
# Note: Python runs in simulation mode (print statements)

def fibonacci(n):
    """Generate fibonacci sequence"""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

def bubble_sort(arr):
    """Simple bubble sort"""
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Run examples
fib = fibonacci(10)
print("Fibonacci (10 terms):", fib)

unsorted = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = bubble_sort(unsorted.copy())
print("Sorted:", sorted_arr)

# List comprehension
squares = [x**2 for x in range(1, 8)]
print("Squares:", squares)

# Dictionary
student = {"name": "Alice", "course": "Software Dev", "grade": "A+"}
print(f"Student: {student['name']} | Grade: {student['grade']}")
`,
  },
];

const LANGUAGES = ["javascript", "typescript", "python", "html", "css", "json", "cpp", "java", "bash"];

function getLanguageFromFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    js: "javascript", ts: "typescript", py: "python",
    html: "html", css: "css", json: "json",
    cpp: "cpp", java: "java", sh: "bash",
  };
  return map[ext] || "javascript";
}

function syntaxHighlight(code: string, lang: string): string {
  const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (lang === "javascript" || lang === "typescript") {
    return esc
      .replace(/(\/\/.*$)/gm, '<span class="ide-comment">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ide-comment">$1</span>')
      .replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="ide-string">$1$2$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|do|class|import|export|from|async|await|new|this|typeof|instanceof|true|false|null|undefined|switch|case|break|continue|try|catch|finally|throw|of|in|default|extends|super)(\b)/g, '<span class="ide-keyword">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="ide-number">$1</span>')
      .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="ide-class">$1</span>');
  }
  if (lang === "python") {
    return esc
      .replace(/(#.*$)/gm, '<span class="ide-comment">$1</span>')
      .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|".*?"|'.*?')/g, '<span class="ide-string">$1</span>')
      .replace(/\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|print|len|range|self|lambda|with|as|try|except|finally|yield|global|nonlocal|pass|break|continue|raise|del|is)(\b)/g, '<span class="ide-keyword">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="ide-number">$1</span>');
  }
  if (lang === "html") {
    return esc
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="ide-comment">$1</span>')
      .replace(/(&lt;\/?)([\w\-]+)/g, '<span class="ide-tag">$1$2</span>')
      .replace(/([\w\-]+)(=)(&quot;[^&]*&quot;|"[^"]*"|'[^']*')/g, '<span class="ide-attr">$1</span>$2<span class="ide-string">$3</span>');
  }
  if (lang === "css") {
    return esc
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ide-comment">$1</span>')
      .replace(/([.#:@]?[\w\-[\]=*^$~|]+)(\s*\{)/g, '<span class="ide-tag">$1</span>$2')
      .replace(/([\w\-]+)(\s*:)/g, '<span class="ide-keyword">$1</span>$2')
      .replace(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g, '<span class="ide-number">$1</span>');
  }
  return esc;
}

function runJavaScript(code: string): { lines: string[]; hasError: boolean } {
  const logs: { type: string; args: unknown[] }[] = [];
  const origLog = console.log;
  const origErr = console.error;
  const origWarn = console.warn;
  const origInfo = console.info;

  const capture = (type: string) => (...args: unknown[]) => {
    logs.push({ type, args });
  };

  console.log = capture("log");
  console.error = capture("error");
  console.warn = capture("warn");
  console.info = capture("info");

  let hasError = false;
  try {
    // eslint-disable-next-line no-new-func
    new Function(code)();
  } catch (e) {
    logs.push({ type: "error", args: [`❌ ${e instanceof Error ? e.message : String(e)}`] });
    hasError = true;
  } finally {
    console.log = origLog;
    console.error = origErr;
    console.warn = origWarn;
    console.info = origInfo;
  }

  const lines = logs.map(({ type, args }) => {
    const msg = args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ");
    const prefix = type === "error" ? "❌ " : type === "warn" ? "⚠️ " : type === "info" ? "ℹ️ " : "";
    return prefix + msg;
  });

  if (lines.length === 0) lines.push("✅ Code ran successfully (no output)");
  return { lines, hasError };
}

function runPython(code: string): { lines: string[]; hasError: boolean } {
  const lines: string[] = [];
  // Simulate print statements
  const printRe = /print\s*\(([\s\S]*?)\)/g;
  let match;
  while ((match = printRe.exec(code)) !== null) {
    let val = match[1].trim();
    // f-string simulation
    val = val.replace(/f["'](.*?)["']/, (_, s) => s.replace(/\{([^}]+)\}/g, '$1'));
    // Strip surrounding quotes
    val = val.replace(/^["']|["']$/g, "");
    lines.push(val);
  }
  if (lines.length === 0) lines.push("ℹ️ Python runs in simulation mode — print() statements appear here");
  return { lines, hasError: false };
}

type OutputTab = "console" | "browser";

interface IDEProps {
  onClose: () => void;
}

export default function IDE({ onClose }: IDEProps) {
  const [files, setFiles] = useState<IDEFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState(DEFAULT_FILES[0].id);
  const [output, setOutput] = useState<{ text: string; type: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [outputTab, setOutputTab] = useState<OutputTab>("browser");
  const [showOutput, setShowOutput] = useState(true);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [iframeContent, setIframeContent] = useState("");
  const [outputHeight, setOutputHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Auto-build HTML preview
  useEffect(() => {
    if (activeFile.language === "html") {
      setIframeContent(activeFile.content);
    }
  }, [activeFile]);

  const buildFullPage = useCallback(() => {
    const htmlFile = files.find(f => f.language === "html");
    const cssFile = files.find(f => f.language === "css");
    const jsFile = files.find(f => f.language === "javascript" || f.language === "typescript");

    if (htmlFile) {
      let html = htmlFile.content;
      if (cssFile && !html.includes(cssFile.name)) {
        html = html.replace("</head>", `<style>${cssFile.content}</style></head>`);
      }
      if (jsFile && !html.includes(jsFile.name)) {
        html = html.replace("</body>", `<script>${jsFile.content}<\/script></body>`);
      }
      return html;
    }

    // No HTML — build a wrapper
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
body { background: #0f172a; color: #e2e8f0; font-family: monospace; padding: 20px; }
.output { white-space: pre-wrap; }
.err { color: #f87171; }
</style>
</head>
<body>
<div class="output" id="out"></div>
<script>
const out = document.getElementById('out');
const _log = (...a) => { const d = document.createElement('div'); d.textContent = '> ' + a.join(' '); out.appendChild(d); };
const _err = (...a) => { const d = document.createElement('div'); d.textContent = '❌ ' + a.join(' '); d.className='err'; out.appendChild(d); };
console.log = _log; console.error = _err; console.warn = _log; console.info = _log;
try {
${jsFile?.content || "// No JS file found"}
} catch(e) { _err(e.message); }
<\/script>
</body>
</html>`;
  }, [files]);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeFileId]);

  const updateContent = (content: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
  };

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + "  " + ta.value.substring(end);
      updateContent(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  const handleRun = useCallback(() => {
    setRunning(true);
    setShowOutput(true);

    setTimeout(() => {
      const lang = activeFile.language;

      if (lang === "html" || lang === "css") {
        // Build and show full page
        const html = buildFullPage();
        setIframeContent(html);
        setPreviewKey(k => k + 1);
        setOutputTab("browser");
        setOutput([{ text: "✅ Page refreshed in browser preview", type: "success" }]);
        setRunning(false);
        return;
      }

      if (lang === "javascript" || lang === "typescript") {
        // Also update browser preview
        const html = buildFullPage();
        setIframeContent(html);
        setPreviewKey(k => k + 1);

        const { lines, hasError } = runJavaScript(activeFile.content);
        setOutput(lines.map(text => ({
          text,
          type: text.startsWith("❌") ? "error" : text.startsWith("⚠️") ? "warn" : text.startsWith("ℹ️") ? "info" : text.startsWith("✅") ? "success" : "log",
        })));
        setOutputTab("console");
        if (!hasError) {
          // Also show browser
          setTimeout(() => setOutputTab("browser"), 800);
        }
        setRunning(false);
        return;
      }

      if (lang === "python") {
        const { lines } = runPython(activeFile.content);
        setOutput(lines.map(text => ({ text, type: text.startsWith("ℹ️") ? "info" : "log" })));
        setOutputTab("console");
        setRunning(false);
        return;
      }

      setOutput([{ text: `ℹ️ ${lang.toUpperCase()} — use a dedicated compiler for full execution`, type: "info" }]);
      setOutputTab("console");
      setRunning(false);
    }, 350);
  }, [activeFile, buildFullPage]);

  const handleNewFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const language = getLanguageFromFilename(name);
    const newFile: IDEFile = {
      id: Date.now().toString(),
      name,
      language,
      content: language === "html"
        ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>${name}</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`
        : language === "css"
        ? `/* ${name} */\nbody {\n  margin: 0;\n  font-family: sans-serif;\n}\n`
        : `// ${name}\nconsole.log("Hello from ${name}");\n`,
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName("");
    setShowNewFile(false);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length === 1) return;
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) setActiveFileId(remaining[0].id);
  };

  const handleDownload = () => {
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = activeFile.name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInTab = () => {
    const html = buildFullPage();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Drag to resize output panel
  const onDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartH.current = outputHeight;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = dragStartY.current - e.clientY;
      setOutputHeight(Math.min(500, Math.max(100, dragStartH.current + delta)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging]);

  const lineCount = activeFile.content.split("\n").length;
  const langColor = LANG_COLORS[activeFile.language] || "#818cf8";
  const highlighted = syntaxHighlight(activeFile.content, activeFile.language);

  const lineColors: Record<string, string> = {
    error: "text-red-400", warn: "text-amber-400", info: "text-blue-400",
    success: "text-emerald-400", log: "text-green-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4">
      <div className={`bg-[#1e1e2e] rounded-2xl shadow-2xl shadow-black/80 border border-white/10 flex flex-col overflow-hidden transition-all duration-300
        ${isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-7xl h-[95vh]"}`}>

        {/* ── Title Bar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-white/10 select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition flex items-center justify-center group">
              <X size={7} className="opacity-0 group-hover:opacity-100 text-red-900" />
            </button>
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" onClick={() => setIsFullscreen(v => !v)} role="button" />
          </div>

          <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
            <FileCode size={12} />
            <span>Skill Up IDE — {activeFile.name}</span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={handleOpenInTab} title="Open in new tab"
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition font-mono">
              <Globe size={11} /> New Tab
            </button>
            <button onClick={() => setIsFullscreen(v => !v)} title="Toggle fullscreen"
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition rounded">
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition rounded">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* ── File Explorer ── */}
          <div className="w-44 bg-[#181825] border-r border-white/10 flex flex-col flex-shrink-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                <FolderOpen size={11} /> Explorer
              </div>
              <button onClick={() => setShowNewFile(v => !v)}
                className="text-white/40 hover:text-white transition" title="New file">
                <Plus size={13} />
              </button>
            </div>

            {showNewFile && (
              <div className="px-2 py-2 border-b border-white/10">
                <input
                  autoFocus type="text" placeholder="filename.js"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleNewFile(); if (e.key === "Escape") setShowNewFile(false); }}
                  className="w-full bg-white/10 border border-indigo-500/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
              {files.map(file => {
                const ext = LANG_EXT[file.language] || "js";
                const color = LANG_COLORS[file.language] || "#818cf8";
                return (
                  <div key={file.id}
                    className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-all ${
                      activeFileId === file.id
                        ? "bg-indigo-600/30 text-white border-l-2 border-indigo-400"
                        : "text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                    }`}
                    onClick={() => setActiveFileId(file.id)}>
                    <span className="text-[9px] font-bold uppercase px-1 rounded flex-shrink-0"
                      style={{ color, backgroundColor: `${color}22` }}>
                      {ext}
                    </span>
                    <span className="truncate flex-1 font-mono">{file.name}</span>
                    {files.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Language selector */}
            <div className="border-t border-white/10 px-2 py-2">
              <select
                value={activeFile.language}
                onChange={e => {
                  const lang = e.target.value;
                  const ext = LANG_EXT[lang] || "js";
                  const baseName = activeFile.name.split(".")[0];
                  setFiles(prev => prev.map(f => f.id === activeFileId
                    ? { ...f, language: lang, name: `${baseName}.${ext}` } : f));
                }}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-[10px] focus:outline-none focus:border-indigo-400 cursor-pointer">
                {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#1e1e2e]">{l}</option>)}
              </select>
            </div>
          </div>

          {/* ── Main Editor + Preview ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#181825] border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded text-xs font-mono text-white/80 bg-[#1e1e2e] border border-white/10">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
                  {activeFile.name}
                </div>
                <span className="text-white/30 text-xs">{lineCount} lines</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleCopy} className="p-1.5 text-white/40 hover:text-white transition rounded hover:bg-white/10" title="Copy code">
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
                <button onClick={handleDownload} className="p-1.5 text-white/40 hover:text-white transition rounded hover:bg-white/10" title="Download">
                  <Download size={13} />
                </button>
                <button onClick={() => setShowOutput(v => !v)}
                  className={`p-1.5 transition rounded hover:bg-white/10 ${showOutput ? "text-indigo-400" : "text-white/40 hover:text-white"}`}
                  title="Toggle output">
                  <Layout size={13} />
                </button>
                <button onClick={handleRun} disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-60 ml-1">
                  {running ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                  {running ? "Running…" : "Run"}
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 relative overflow-hidden min-h-0">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#181825] border-r border-white/5 overflow-hidden pointer-events-none z-10">
                  <div className="pt-3 pr-2 text-right text-white/20 text-xs font-mono select-none" style={{ lineHeight: "24px" }}>
                    {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
                  </div>
                </div>

                {/* Highlight layer */}
                <div ref={highlightRef}
                  className="absolute inset-0 pl-12 pr-4 pt-3 text-xs font-mono overflow-auto pointer-events-none whitespace-pre"
                  style={{ lineHeight: "24px", color: "#cdd6f4" }}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={activeFile.content}
                  onChange={e => updateContent(e.target.value)}
                  onKeyDown={handleTab}
                  onScroll={syncScroll}
                  className="absolute inset-0 pl-12 pr-4 pt-3 text-xs font-mono resize-none bg-transparent text-transparent caret-white focus:outline-none overflow-auto w-full h-full"
                  style={{ lineHeight: "24px", caretColor: "#cdd6f4" }}
                  spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                />
              </div>

              {/* ── Output / Preview Panel ── */}
              {showOutput && (
                <div className="flex-shrink-0 border-t border-white/10 bg-[#11111b] flex flex-col" style={{ height: outputHeight }}>
                  {/* Drag handle */}
                  <div
                    className={`h-1.5 bg-white/5 hover:bg-indigo-500/40 cursor-row-resize transition flex-shrink-0 ${isDragging ? "bg-indigo-500/60" : ""}`}
                    onMouseDown={onDragStart}
                  />

                  {/* Output tabs */}
                  <div className="flex items-center gap-0 border-b border-white/10 flex-shrink-0">
                    {/* Browser tab */}
                    <button
                      onClick={() => setOutputTab("browser")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition ${
                        outputTab === "browser"
                          ? "border-indigo-400 text-indigo-300 bg-indigo-500/10"
                          : "border-transparent text-white/40 hover:text-white"
                      }`}>
                      <Globe size={11} /> Browser Preview
                    </button>
                    {/* Console tab */}
                    <button
                      onClick={() => setOutputTab("console")}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition ${
                        outputTab === "console"
                          ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                          : "border-transparent text-white/40 hover:text-white"
                      }`}>
                      <Terminal size={11} /> Console
                      {output.some(o => o.type === "error") && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </button>
                    <div className="flex-1" />
                    {outputTab === "browser" && (
                      <button onClick={() => setPreviewKey(k => k + 1)}
                        className="p-2 text-white/30 hover:text-white transition" title="Refresh preview">
                        <RotateCcw size={11} />
                      </button>
                    )}
                    {outputTab === "console" && (
                      <button onClick={() => setOutput([])}
                        className="text-white/30 hover:text-white text-[10px] px-3 transition">
                        Clear
                      </button>
                    )}
                    <button onClick={() => setShowOutput(false)}
                      className="p-2 text-white/30 hover:text-white transition">
                      <X size={12} />
                    </button>
                  </div>

                  {/* Panel content */}
                  <div className="flex-1 overflow-hidden min-h-0">
                    {outputTab === "browser" ? (
                      <iframe
                        key={previewKey}
                        ref={iframeRef}
                        srcDoc={iframeContent || buildFullPage()}
                        className="w-full h-full bg-white border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                        title="Browser Preview"
                      />
                    ) : (
                      <div className="overflow-y-auto h-full px-4 py-2 font-mono text-xs">
                        {running ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <RefreshCw size={12} className="animate-spin" /> Running…
                          </div>
                        ) : output.length === 0 ? (
                          <div className="text-white/30 flex items-center gap-2">
                            <ChevronRight size={12} />
                            Press Run or Ctrl+Enter to execute
                          </div>
                        ) : (
                          output.map((line, i) => (
                            <div key={i} className={`flex items-start gap-2 mb-1 ${lineColors[line.type] || "text-green-300"}`}>
                              <ChevronRight size={10} className="mt-0.5 flex-shrink-0 text-white/30" />
                              <span className="whitespace-pre-wrap break-all">{line.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Status Bar ── */}
        <div className="flex items-center justify-between px-4 py-1 bg-indigo-900/50 border-t border-white/10 text-[10px] font-mono text-white/50 select-none flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-semibold" style={{ color: langColor }}>
              {activeFile.language.charAt(0).toUpperCase() + activeFile.language.slice(1)}
            </span>
            <span>UTF-8</span>
            <span>Spaces: 2</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{lineCount} lines</span>
            <span className="hidden sm:block">Ctrl+Enter to run</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Skill Up IDE
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .ide-keyword { color: #cba6f7; font-weight: 600; }
        .ide-string  { color: #a6e3a1; }
        .ide-comment { color: #6c7086; font-style: italic; }
        .ide-number  { color: #fab387; }
        .ide-class   { color: #89dceb; }
        .ide-tag     { color: #89b4fa; }
        .ide-attr    { color: #cba6f7; }
      `}</style>
    </div>
  );
}
