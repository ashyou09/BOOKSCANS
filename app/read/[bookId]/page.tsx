'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Book } from '@/types';
import { PDFReader } from '@/components/PDFReader';
import { ChapterList } from '@/components/ChapterList';
import { ArrowLeft, X, LayoutList } from 'lucide-react';
import Link from 'next/link';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const { books, progressMap, updateProgress } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const book = books.find((b: Book) => b.id === bookId);
  const progress = progressMap[bookId];
  const currentChapterNumber = progress?.currentChapter || 1;

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Book Not Found</h2>
          <p className="text-xs text-slate-400">The requested book does not exist in your BookScan library.</p>
          <Link
            href="/library"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
          >
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const handleSelectChapter = (chapterNumber: number) => {
    const startPage = (chapterNumber - 1) * book.pagesPerChapter + 1;
    updateProgress(book.id, startPage, chapterNumber);
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative h-screen w-full flex bg-asura-bg">
      
      {/* Collapsible Sidebar Drawer for Chapters */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col relative">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-3 right-3 z-50 p-1.5 rounded-xl bg-slate-100 dark:bg-asura-card text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <ChapterList
            chapters={book.chapters}
            currentChapterNumber={currentChapterNumber}
            onSelectChapter={handleSelectChapter}
            pagesPerChapter={book.pagesPerChapter}
            totalPages={book.totalPages}
            bookTitle={book.title}
          />
        </div>
      </aside>

      {/* Background Overlay when Sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Main Reader View */}
      <div className="flex-1 w-full h-full">
        <PDFReader book={book} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>
    </div>
  );
};
