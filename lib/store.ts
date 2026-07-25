import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Book, ReadingProgress, VideoResource, DailyStats, ChapterNote } from '@/types';
import { INITIAL_BOOKS, INITIAL_VIDEOS } from './mockData';
import { deletePdfData } from './pdfStorage';

interface AppState {
  // Theme & Atmosphere State
  themeMode: 'dark' | 'light';
  readerTheme: 'midnight' | 'sepia' | 'light' | 'oled';
  toggleThemeMode: () => void;
  setReaderTheme: (theme: 'midnight' | 'sepia' | 'light' | 'oled') => void;

  // Admin Auth State
  isAdmin: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  // Books State
  books: Book[];
  addBook: (newBook: Book) => void;
  updateBook: (updatedBook: Book) => void;
  deleteBook: (id: string) => void;
  toggleBookmark: (id: string) => void;
  updateBookStatus: (id: string, status: Book['status']) => void;

  // Reading Progress State
  progressMap: Record<string, ReadingProgress>;
  updateProgress: (bookId: string, page: number, chapter: number, totalPagesReadTodayAdd?: number) => void;

  // Daily Goal Stats State
  dailyStats: DailyStats;
  setDailyGoal: (goal: number) => void;
  checkAndResetDailyStats: () => void;

  // Videos State
  videos: VideoResource[];
  addVideo: (video: VideoResource) => void;
  toggleVideoWatched: (id: string) => void;
  updateVideoNotes: (id: string, notes: string) => void;
  deleteVideo: (id: string) => void;

  // Chapter Notes State
  chapterNotes: ChapterNote[];
  addChapterNote: (bookId: string, chapterNumber: number, text: string) => void;
  deleteChapterNote: (id: string) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      themeMode: 'dark',
      readerTheme: 'midnight',
      toggleThemeMode: () =>
        set((state) => ({
          themeMode: state.themeMode === 'dark' ? 'light' : 'dark',
        })),
      setReaderTheme: (readerTheme) => set({ readerTheme }),

      isAdmin: true, // Enabled for smooth admin usage out-of-the-box
      loginAdmin: () => set({ isAdmin: true }),
      logoutAdmin: () => set({ isAdmin: false }),

      books: INITIAL_BOOKS,
      addBook: (newBook) =>
        set((state) => ({
          books: [newBook, ...state.books],
        })),
      updateBook: (updatedBook) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
        })),
      deleteBook: (id) => {
        deletePdfData(id);
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
        }));
      },
      toggleBookmark: (id) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id ? { ...b, isBookmarked: !b.isBookmarked } : b
          ),
        })),
      updateBookStatus: (id, status) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      progressMap: {
        'book-1': {
          bookId: 'book-1',
          currentPage: 36,
          currentChapter: 3,
          lastReadAt: new Date().toISOString(),
          totalPagesReadToday: 8,
          dailyGoal: 15,
          goalReachedToday: false,
          sessionDate: getTodayString(),
          readingMode: 'webtoon',
          readerTheme: 'midnight',
        },
      },

      updateProgress: (bookId, page, chapter, pagesAdd = 1) => {
        const today = getTodayString();
        const state = get();
        const existing = state.progressMap[bookId];
        const isNewDay = existing?.sessionDate !== today;

        const newPagesRead = isNewDay
          ? pagesAdd
          : (existing?.totalPagesReadToday || 0) + pagesAdd;
        const currentGoal = existing?.dailyGoal || state.dailyStats.dailyGoal;

        const updatedProgress: ReadingProgress = {
          bookId,
          currentPage: page,
          currentChapter: chapter,
          lastReadAt: new Date().toISOString(),
          totalPagesReadToday: newPagesRead,
          dailyGoal: currentGoal,
          goalReachedToday: newPagesRead >= currentGoal,
          sessionDate: today,
          readingMode: existing?.readingMode || 'webtoon',
          readerTheme: existing?.readerTheme || 'midnight',
        };

        // Update overall daily stats
        const statsNewDay = state.dailyStats.sessionDate !== today;
        const totalToday = statsNewDay
          ? pagesAdd
          : state.dailyStats.pagesReadToday + pagesAdd;

        set((s) => ({
          progressMap: { ...s.progressMap, [bookId]: updatedProgress },
          dailyStats: {
            ...s.dailyStats,
            sessionDate: today,
            pagesReadToday: totalToday,
            streakDays:
              statsNewDay && totalToday >= s.dailyStats.dailyGoal
                ? s.dailyStats.streakDays + 1
                : s.dailyStats.streakDays,
          },
        }));
      },

      dailyStats: {
        sessionDate: getTodayString(),
        pagesReadToday: 8,
        dailyGoal: 15,
        streakDays: 5,
        completedBooksCount: 2,
      },

      setDailyGoal: (dailyGoal) =>
        set((state) => ({
          dailyStats: { ...state.dailyStats, dailyGoal },
        })),

      checkAndResetDailyStats: () => {
        const today = getTodayString();
        const state = get();
        if (state.dailyStats.sessionDate !== today) {
          set({
            dailyStats: {
              ...state.dailyStats,
              sessionDate: today,
              pagesReadToday: 0,
            },
          });
        }
      },

      videos: INITIAL_VIDEOS,
      addVideo: (video) =>
        set((state) => ({
          videos: [video, ...state.videos],
        })),
      toggleVideoWatched: (id) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.id === id ? { ...v, isWatched: !v.isWatched } : v
          ),
        })),
      updateVideoNotes: (id, notes) =>
        set((state) => ({
          videos: state.videos.map((v) => (v.id === id ? { ...v, notes } : v)),
        })),
      deleteVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        })),

      chapterNotes: [],
      addChapterNote: (bookId, chapterNumber, text) =>
        set((state) => ({
          chapterNotes: [
            {
              id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              bookId,
              chapterNumber,
              text,
              createdAt: new Date().toISOString(),
            },
            ...state.chapterNotes,
          ],
        })),
      deleteChapterNote: (id) =>
        set((state) => ({
          chapterNotes: state.chapterNotes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'bookscan-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
