export interface Chapter {
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  releasedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  category: 'Manhwa' | 'Manga' | 'Light Novel' | 'Study PDF' | 'Textbook';
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS';
  rating: number;
  totalPages: number;
  pagesPerChapter: number;
  totalChapters: number;
  chapters: Chapter[];
  isBookmarked: boolean;
  isHot?: boolean;
  isNew?: boolean;
  s3Key?: string;
  pdfUrl?: string; // Blob or URL
  uploadedAt: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  currentChapter: number;
  lastReadAt: string;
  totalPagesReadToday: number;
  dailyGoal: number;
  goalReachedToday: boolean;
  sessionDate: string;
  readingMode: 'webtoon' | 'single';
  readerTheme: 'midnight' | 'sepia' | 'light' | 'oled';
}

export interface VideoResource {
  id: string;
  title: string;
  url: string;
  youtubeId: string;
  category: 'ML' | 'Math' | 'Web Dev' | 'General';
  isWatched: boolean;
  addedAt: string;
  notes?: string;
  duration?: string;
}

export interface ChapterNote {
  id: string;
  bookId: string;
  chapterNumber: number;
  text: string;
  createdAt: string;
}

export interface DailyStats {
  sessionDate: string;
  pagesReadToday: number;
  dailyGoal: number;
  streakDays: number;
  goalReachedToday?: boolean;
  completedBooksCount?: number;
}

export interface AppState {
  themeMode: 'dark' | 'light';
  readerTheme: 'midnight' | 'sepia' | 'light' | 'oled';
  toggleThemeMode: () => void;
  setReaderTheme: (theme: 'midnight' | 'sepia' | 'light' | 'oled') => void;

  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  toggleBookmark: (id: string) => void;
  updateBookStatus: (id: string, status: Book['status']) => void;

  progressMap: Record<string, ReadingProgress>;
  updateProgress: (bookId: string, page: number, chapter: number, pagesAdd?: number) => void;

  dailyStats: DailyStats;
  setDailyGoal: (goal: number) => void;
  checkAndResetDailyStats: () => void;

  videos: VideoResource[];
  addVideo: (video: VideoResource) => void;
  toggleVideoWatched: (id: string) => void;
  updateVideoNotes: (id: string, notes: string) => void;
  deleteVideo: (id: string) => void;

  chapterNotes: ChapterNote[];
  addChapterNote: (bookId: string, chapterNumber: number, text: string) => void;
  deleteChapterNote: (id: string) => void;
}
