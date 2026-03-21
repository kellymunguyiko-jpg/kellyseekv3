export type ContentType = "video" | "book";
export type VideoPlayer = "youtube" | "mega";
export type BookPlayer = "mega" | "gdrive" | "pdf";

export interface Student {
  uid: string;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  thumbnail?: string;
  // For video
  videoPlayer?: VideoPlayer;
  videoUrl?: string;
  // For book
  bookPlayer?: BookPlayer;   // which viewer to use
  bookViewUrl?: string;      // mega.nz / gdrive / pdf url
  bookDownloadUrl?: string;  // mega.nz download link
  category: string;
  createdAt: number;
}

export interface HistoryEntry {
  courseId: string;
  title: string;
  type: ContentType;
  thumbnail?: string;
  visitedAt: number;
}
