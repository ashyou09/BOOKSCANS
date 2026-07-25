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
  completedBooksCount: number;
}
