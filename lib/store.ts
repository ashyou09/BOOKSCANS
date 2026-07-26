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
      loginAdmin: () => {
        set({ isAdmin: true });
        get().syncWithDatabase();
      },
      logoutAdmin: () => set((state) => ({ 
        isAdmin: false,
        progressMap: {},
        chapterNotes: [],
        dailyStats: {
          sessionDate: getTodayString(),
          pagesReadToday: 0,
          dailyGoal: 15,
          streakDays: 0,
          goalReachedToday: false,
        },
        books: state.books.map(b => ({ ...b, isBookmarked: false }))
      })),

      books: INITIAL_BOOKS,
      addBook: (newBook) => {
        set((state) => ({
          books: [newBook, ...state.books],
        }));
        if (get().isAdmin) {
          fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook),
          }).catch(() => null);
        }
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
      toggleBookmark: (id) => {
        set((state) => {
          const book = state.books.find(b => b.id === id);
          if (book && get().isAdmin) {
            fetch(`/api/books/${id}/bookmark`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isBookmarked: !book.isBookmarked }),
            }).catch(() => null);
          }
          return {
            books: state.books.map((b) =>
              b.id === id ? { ...b, isBookmarked: !b.isBookmarked } : b
            ),
          };
        });
      },
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

        if (state.isAdmin) {
          fetch(`/api/progress/${bookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPage: page, currentChapter: chapter }),
          }).catch(() => null);
        }

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
        if (get().isAdmin) {
          fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId, chapterNumber, text }),
          }).catch(() => null);
        }
      },
      deleteChapterNote: (id) => {
        set((state) => ({
          chapterNotes: state.chapterNotes.filter((n) => n.id !== id),
        }));
        if (get().isAdmin) {
          fetch(`/api/notes/${id}`, { method: 'DELETE' }).catch(() => null);
        }
      },

      syncWithDatabase: async () => {
        if (!get().isAdmin) return;
        try {
          const [booksRes, notesRes, progressRes] = await Promise.all([
            fetch('/api/books').catch(() => null),
            fetch('/api/notes').catch(() => null),
            fetch('/api/progress').catch(() => null),
          ]);
          
          if (booksRes && booksRes.ok) {
            const dbBooks = await booksRes.json();
            if (Array.isArray(dbBooks)) {
              set({ books: dbBooks });
            }
          }
          
          if (notesRes && notesRes.ok) {
            const data = await notesRes.json();
            if (data.success && data.notes) {
              set({ chapterNotes: data.notes });
            }
          }
          
          if (progressRes && progressRes.ok) {
            const data = await progressRes.json();
            if (data.success && data.progress) {
              const newProgressMap: Record<string, ReadingProgress> = {};
              let mostRecentDate = getTodayString();
              let bestPagesToday = 0;
              let currentGoal = 15;
              
              data.progress.forEach((p: any) => {
                newProgressMap[p.bookId] = {
                  bookId: p.bookId,
                  currentPage: p.currentPage,
                  currentChapter: p.currentChapter,
                  lastReadAt: p.lastReadAt,
                  totalPagesReadToday: p.totalPagesReadToday,
                  dailyGoal: p.dailyGoal,
                  goalReachedToday: p.goalReachedToday,
                  sessionDate: p.sessionDate,
                  readingMode: 'webtoon',
                  readerTheme: 'midnight',
                };
                
                // Try to infer daily stats from the most active book today
                if (p.sessionDate === getTodayString() && p.totalPagesReadToday > bestPagesToday) {
                  bestPagesToday = p.totalPagesReadToday;
                  currentGoal = p.dailyGoal;
                }
              });
              
              set((state) => ({
                progressMap: newProgressMap,
                dailyStats: {
                  ...state.dailyStats,
                  sessionDate: getTodayString(),
                  pagesReadToday: bestPagesToday,
                  dailyGoal: currentGoal,
                  goalReachedToday: bestPagesToday >= currentGoal,
                }
              }));
            }
          }
        } catch (error) {
          console.error("Failed to sync with database:", error);
        }
      },
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
