import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Course, HistoryEntry, Student } from "../types";

export interface ToastMsg {
  msg: string;
  type: "success" | "error" | "info" | "new";
  id: number;
}

export interface NewContentAlert {
  id: string;
  title: string;
  type: "video" | "book";
  thumbnail?: string;
}

interface AppContextType {
  courses: Course[];
  history: HistoryEntry[];
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  student: Student | null;
  setStudent: (s: Student | null) => void;
  logoutStudent: () => Promise<void>;
  addCourse: (course: Omit<Course, "id">) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  addHistory: (entry: Omit<HistoryEntry, "visitedAt">) => void;
  clearHistory: () => void;
  loading: boolean;
  authLoading: boolean;
  toast: ToastMsg | null;
  showToast: (msg: string, type?: "success" | "error" | "info" | "new") => void;
  newContentAlerts: NewContentAlert[];
  clearNewContentAlerts: () => void;
  isConnected: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [newContentAlerts, setNewContentAlerts] = useState<NewContentAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const coursesRef = useRef<Course[]>([]);
  const isFirstLoad = useRef(true);
  const knownIds = useRef<Set<string>>(new Set());

  coursesRef.current = courses;

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" | "new" = "info") => {
    const id = Date.now();
    setToast({ msg, type, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 5000);
  }, []);

  const clearNewContentAlerts = useCallback(() => setNewContentAlerts([]), []);

  // ── FIRESTORE REAL-TIME LISTENER — always on, no auth gate ────────────────
  useEffect(() => {
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: false },
      (snap) => {
        setIsConnected(true);

        const data: Course[] = snap.docs.map((d) => {
          const raw = d.data();
          // Handle both Firestore Timestamp and plain number for createdAt
          let createdAt = raw.createdAt;
          if (createdAt instanceof Timestamp) {
            createdAt = createdAt.toMillis();
          } else if (typeof createdAt !== "number") {
            createdAt = Date.now();
          }
          return {
            id: d.id,
            ...(raw as Omit<Course, "id" | "createdAt">),
            createdAt,
          };
        });

        // Detect brand-new content for notification
        if (!isFirstLoad.current) {
          snap.docChanges().forEach((change) => {
            if (change.type === "added") {
              const id = change.doc.id;
              if (!knownIds.current.has(id)) {
                const raw = change.doc.data() as Omit<Course, "id">;
                // Only notify if it was added within last 30 seconds (real upload, not historical)
                let createdAt = raw.createdAt as number | Timestamp;
                if (createdAt instanceof Timestamp) createdAt = createdAt.toMillis();
                const isRecent = (Date.now() - (createdAt as number)) < 30000;
                if (isRecent) {
                  const alert: NewContentAlert = {
                    id,
                    title: raw.title,
                    type: raw.type as "video" | "book",
                    thumbnail: raw.thumbnail,
                  };
                  setNewContentAlerts((prev) => [alert, ...prev].slice(0, 5));
                  showToast(
                    `🆕 New ${raw.type === "video" ? "Video" : "Book"}: "${raw.title}" is now available!`,
                    "new"
                  );
                }
                knownIds.current.add(id);
              }
            }
          });
        } else {
          // First load — populate known IDs without alerting
          snap.docs.forEach((d) => knownIds.current.add(d.id));
          isFirstLoad.current = false;
        }

        setCourses(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setIsConnected(false);
        setLoading(false);
        if (error.code === "permission-denied") {
          showToast(
            "⛔ Firestore rules blocking reads. Set: allow read: if true; for courses.",
            "error"
          );
        } else {
          showToast("🌐 Connection error. Retrying...", "error");
        }
      }
    );

    return () => unsub();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Firebase Auth ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const adminFlag = sessionStorage.getItem("skillup_is_admin");
      if (user && !adminFlag) {
        setStudent({
          uid: user.uid,
          name: user.displayName || user.email!.split("@")[0],
          email: user.email!,
        });
      } else if (adminFlag) {
        setIsAdmin(true);
      } else {
        setStudent(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── History: per-student localStorage ─────────────────────────────────────
  useEffect(() => {
    const key = student ? `skillup_history_${student.uid}` : "skillup_history_guest";
    const stored = localStorage.getItem(key);
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch { setHistory([]); }
    } else {
      setHistory([]);
    }
  }, [student]);

  useEffect(() => {
    const key = student ? `skillup_history_${student.uid}` : "skillup_history_guest";
    localStorage.setItem(key, JSON.stringify(history));
  }, [history, student]);

  // ── Admin setter ───────────────────────────────────────────────────────────
  const handleSetIsAdmin = (v: boolean) => {
    setIsAdmin(v);
    if (v) {
      sessionStorage.setItem("skillup_is_admin", "1");
      setStudent(null);
    } else {
      sessionStorage.removeItem("skillup_is_admin");
    }
  };

  const logoutStudent = async () => {
    await signOut(auth);
    setStudent(null);
    setIsAdmin(false);
    sessionStorage.removeItem("skillup_is_admin");
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addCourse = async (course: Omit<Course, "id">) => {
    const clean = Object.fromEntries(
      Object.entries(course).filter(([, v]) => v !== undefined && v !== "")
    );
    // Use serverTimestamp so Firestore uses server time (more reliable for ordering)
    const payload = { ...clean, createdAt: serverTimestamp() };

    const tempId = `temp_${Date.now()}`;
    const optimistic: Course = {
      id: tempId,
      ...(course as Omit<Course, "id">),
      createdAt: Date.now(),
    };
    setCourses((prev) => [optimistic, ...prev]);
    knownIds.current.add(tempId);

    try {
      const docRef = await addDoc(collection(db, "courses"), payload);
      knownIds.current.add(docRef.id);
      knownIds.current.delete(tempId);
      setCourses((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: docRef.id } : c))
      );
      showToast(`✅ "${course.title}" published! All users can see it now.`, "success");
    } catch (err: unknown) {
      setCourses((prev) => prev.filter((c) => c.id !== tempId));
      knownIds.current.delete(tempId);
      const msg = err instanceof Error ? err.message : "Failed to publish";
      showToast(parseFirestoreError(msg), "error");
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    const backup = coursesRef.current.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, "courses", id));
      showToast("🗑️ Content deleted.", "success");
    } catch (err: unknown) {
      if (backup) setCourses((prev) => [backup, ...prev]);
      const msg = err instanceof Error ? err.message : "Failed to delete";
      showToast(parseFirestoreError(msg), "error");
      throw err;
    }
  };

  const updateCourse = async (id: string, course: Partial<Course>) => {
    const clean = Object.fromEntries(
      Object.entries(course).filter(([, v]) => v !== undefined)
    );
    const backup = coursesRef.current.find((c) => c.id === id);
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...clean } : c)));
    try {
      await updateDoc(doc(db, "courses", id), clean);
      showToast("✅ Content updated! Changes are live for all users.", "success");
    } catch (err: unknown) {
      if (backup) setCourses((prev) => prev.map((c) => (c.id === id ? backup : c)));
      const msg = err instanceof Error ? err.message : "Failed to update";
      showToast(parseFirestoreError(msg), "error");
      throw err;
    }
  };

  function parseFirestoreError(msg: string): string {
    if (msg.includes("permission-denied") || msg.includes("PERMISSION_DENIED"))
      return "⛔ Permission denied. Go to Firebase Console → Firestore → Rules and set: allow read: if true; allow write: if request.auth != null;";
    if (msg.includes("not-found")) return "Document not found.";
    if (msg.includes("unavailable") || msg.includes("network"))
      return "🌐 Network error. Check your internet connection.";
    return msg;
  }

  const addHistory = (entry: Omit<HistoryEntry, "visitedAt">) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.courseId !== entry.courseId);
      return [{ ...entry, visitedAt: Date.now() }, ...filtered].slice(0, 50);
    });
  };

  const clearHistory = () => setHistory([]);

  return (
    <AppContext.Provider
      value={{
        courses,
        history,
        isAdmin,
        setIsAdmin: handleSetIsAdmin,
        student,
        setStudent,
        logoutStudent,
        addCourse,
        deleteCourse,
        updateCourse,
        addHistory,
        clearHistory,
        loading,
        authLoading,
        toast,
        showToast,
        newContentAlerts,
        clearNewContentAlerts,
        isConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
