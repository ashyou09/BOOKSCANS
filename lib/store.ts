import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Book, ReadingProgress, VideoResource, ChapterNote } from '@/types';
import { INITIAL_BOOKS, INITIAL_VIDEOS } from './mockData';
import { deletePdfData } from './pdfStorage';

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

      isAdmin: false, // Default: Read-Only for visitors. Log in via Admin Login to unlock editing.
      loginAdmin: () => set({ isAdmin: true }),
      logoutAdmin: () => set({ isAdmin: false }),

      books: INITIAL_BOOKS,
      addBook: (newBook) => {
        set((state) => ({
          books: [newBook, ...state.books],
        }));
        fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBook),
        }).catch(() => null);
      },
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
        'ml-vol-1': {
          bookId: 'ml-vol-1',
          currentPage: 1,
          currentChapter: 1,
          lastReadAt: new Date().toISOString(),
          totalPagesReadToday: 0,
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
        const currentToday = isNewDay ? 0 : existing?.totalPagesReadToday || 0;
        const newToday = currentToday + pagesAdd;
        const currentGoal = state.dailyStats.dailyGoal;
        const goalReached = newToday >= currentGoal;

        fetch(`/api/progress/${bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPage: page, currentChapter: chapter }),
        }).catch(() => null);

        set((prevState) => {
          const newMap = {
            ...prevState.progressMap,
            [bookId]: {
              bookId,
              currentPage: page,
              currentChapter: chapter,
              lastReadAt: new Date().toISOString(),
              totalPagesReadToday: newToday,
              dailyGoal: currentGoal,
              goalReachedToday: goalReached,
              sessionDate: today,
              readingMode: existing?.readingMode || 'webtoon',
              readerTheme: existing?.readerTheme || 'midnight',
            },
          };

          return {
            progressMap: newMap,
            dailyStats: {
              ...prevState.dailyStats,
              pagesReadToday: prevState.dailyStats.sessionDate === today
                ? prevState.dailyStats.pagesReadToday + pagesAdd
                : pagesAdd,
              sessionDate: today,
            },
          };
        });
      },

      dailyStats: {
        sessionDate: getTodayString(),
        pagesReadToday: 0,
        dailyGoal: 15,
        streakDays: 5,
        goalReachedToday: false,
      },

      setDailyGoal: (dailyGoal) =>
        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            dailyGoal,
          },
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
              goalReachedToday: false,
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
      addChapterNote: (bookId, chapterNumber, text) => {
        const newNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          bookId,
          chapterNumber,
          text,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          chapterNotes: [newNote, ...state.chapterNotes],
        }));
        fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, chapterNumber, text }),
        }).catch(() => null);
      },
      deleteChapterNote: (id) =>
        set((state) => ({
          chapterNotes: state.chapterNotes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'bookscan-storage',
      version: 5,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        // Automatically update books list to include newly added ML Volumes 1-4 and PDFs
        return {
          ...persistedState,
          books: INITIAL_BOOKS,
        };
      },
    }
  )
);
