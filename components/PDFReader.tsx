'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bookmark,
  Maximize2,
  Minimize2,
  LayoutList,
  Layers,
  Edit3,
  BookOpen,
  FileText,
  Sparkles,
  Trash2,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { Book, Chapter, ChapterNote } from '@/types';
import { useAppStore } from '@/lib/store';
import { getChapterForPage, getStartPageOfChapter, generateChapters } from '@/lib/chapters';
import { getPdfData } from '@/lib/pdfStorage';
import { PdfCanvasPage } from './PdfCanvasPage';
import { EditBookModal } from './EditBookModal';
import { useRouter } from 'next/navigation';

interface PDFReaderProps {
  book: Book;
  onToggleSidebar?: () => void;
}

export const PDFReader: React.FC<PDFReaderProps> = ({ book, onToggleSidebar }) => {
  const router = useRouter();
  const { progressMap, updateProgress, toggleBookmark, readerTheme, setReaderTheme, isAdmin, deleteBook, updateBook, chapterNotes, addChapterNote, deleteChapterNote } = useAppStore();

  const progress = progressMap[book.id];
  const initialPage = progress?.currentPage || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [readingMode, setReadingMode] = useState<'webtoon' | 'single'>('webtoon');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [pdfData, setPdfData] = useState<string | ArrayBuffer | null>(book.pdfUrl || null);
  const [pdfLoading, setPdfLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentChapterNumber = getChapterForPage(currentPage, book.pagesPerChapter);
  const chapterStart = (currentChapterNumber - 1) * book.pagesPerChapter + 1;
  const chapterEnd = Math.max(chapterStart, Math.min(currentChapterNumber * book.pagesPerChapter, book.totalPages));
  
  const currentChapter = book.chapters?.find((c) => c.chapterNumber === currentChapterNumber) || {
    chapterNumber: currentChapterNumber,
    title: `Chapter ${currentChapterNumber}`,
    startPage: chapterStart,
    endPage: chapterEnd,
    totalPages: chapterEnd - chapterStart + 1,
    releasedAt: new Date().toISOString(),
  };

  const currentChapterNotes = (chapterNotes || []).filter(
    (n: ChapterNote) => n.bookId === book.id && n.chapterNumber === currentChapterNumber
  );

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    addChapterNote(book.id, currentChapterNumber, newNoteText.trim());
    setNewNoteText('');
  };

  // Load persistent PDF ArrayBuffer/Data from IndexedDB
  useEffect(() => {
    let isCancelled = false;
    async function loadPdf() {
      setPdfLoading(true);
      if (book.pdfUrl) {
        setPdfData(book.pdfUrl);
        setPdfLoading(false);
      } else {
        const storedData = await getPdfData(book.id);
        if (!isCancelled) {
          if (storedData) {
            setPdfData(storedData);
          }
          setPdfLoading(false);
        }
      }
    }
    loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [book.id, book.pdfUrl]);

  // Sync local state when external progress changes (e.g. from sidebar chapter select)
  useEffect(() => {
    if (progress?.currentPage && progress.currentPage !== currentPage) {
      setCurrentPage(progress.currentPage);
    }
  }, [progress?.currentPage]);

  // Auto-detect real page count from PDF document and update book chapters
  useEffect(() => {
    if (!pdfData) return;
    async function updateRealPageCount() {
      try {
        const globalCache = (window as any).__pdfCache || new Map();
        let pdf;
        if (globalCache.has(pdfData)) {
          pdf = await globalCache.get(pdfData);
        } else {
          const pdfjsLib = await import('pdfjs-dist');
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          }
          const loadingTask = pdfjsLib.getDocument(typeof pdfData === 'string' ? pdfData : { data: pdfData as ArrayBuffer });
          pdf = await loadingTask.promise;
          globalCache.set(pdfData, loadingTask.promise);
        }
        if (pdf && pdf.numPages && pdf.numPages !== book.totalPages) {
          const realPages = pdf.numPages;
          const pagesPerCh = book.pagesPerChapter || 10;
          const realChapters = Math.ceil(realPages / pagesPerCh);
          const updatedBook = {
            ...book,
            totalPages: realPages,
            totalChapters: realChapters,
            chapters: generateChapters(realPages, pagesPerCh),
          };
          updateBook(updatedBook);
        }
      } catch (e) {
        console.error('Error auto-detecting PDF page count:', e);
      }
    }
    updateRealPageCount();
  }, [pdfData, book.id, book.totalPages]);

  // Update progress on page change
  useEffect(() => {
    updateProgress(book.id, currentPage, currentChapterNumber, 1);
  }, [currentPage, book.id, currentChapterNumber]);

  const handleNextPage = () => {
    if (currentPage < book.totalPages) {
      setCurrentPage((prev: number) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev: number) => prev - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterNumber < book.totalChapters) {
      const nextChapterStart = getStartPageOfChapter(currentChapterNumber + 1, book.pagesPerChapter);
      setCurrentPage(nextChapterStart);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterNumber > 1) {
      const prevChapterStart = getStartPageOfChapter(currentChapterNumber - 1, book.pagesPerChapter);
      setCurrentPage(prevChapterStart);
    }
  };

  const handleDeleteBook = () => {
    deleteBook(book.id);
    router.push('/library');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Reader Atmosphere class mapping
  const getAtmosphereClass = () => {
    switch (readerTheme) {
      case 'sepia':
        return 'reader-sepia';
      case 'light':
        return 'reader-light';
      case 'oled':
        return 'reader-oled';
      default:
        return 'reader-midnight';
    }
  };

  // Generate webtoon scroll pages for current chapter
  const chapterPages = Array.from(
    { length: currentChapter.endPage - currentChapter.startPage + 1 },
    (_, i) => currentChapter.startPage + i
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex overflow-hidden transition-colors duration-300 ${getAtmosphereClass()}`}
    >
      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden bg-asura-bg">
        {/* AsuraScans Top Reader Sticky Toolbar */}
        <header className="absolute top-0 left-0 right-0 z-30 w-full bg-black/60 backdrop-blur-md border-b border-white/10 px-2 sm:px-4 py-2 sm:py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-2">
        
        {/* Left Info & Chapter Toggle */}
        <div className="flex items-center space-x-2 order-1">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
              title="Toggle Chapter Menu"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:block">
            <h3 className="font-extrabold text-sm text-white line-clamp-1">{book.title}</h3>
            <p className="text-[11px] text-brand-300 font-semibold">
              Chapter {currentChapterNumber} of {book.totalChapters} • Pages {currentChapter.startPage}-{currentChapter.endPage}
            </p>
          </div>
        </div>

        {/* Center Chapter Switcher */}
        <div className="flex items-center justify-center space-x-2 order-3 sm:order-2 w-full sm:w-auto">
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterNumber <= 1}
            className="px-2.5 py-1 rounded-xl bg-white/10 disabled:opacity-30 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Prev Ch</span>
          </button>

          <span className="px-3 py-1 rounded-xl bg-brand-600 text-white font-extrabold text-xs">
            Ch. {currentChapterNumber}
          </span>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterNumber >= book.totalChapters}
            className="px-2.5 py-1 rounded-xl bg-white/10 disabled:opacity-30 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1"
          >
            <span className="hidden md:inline">Next Ch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Reader Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 order-2 sm:order-3">
          {isAdmin && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-brand-600 text-white text-xs font-semibold flex items-center space-x-1 transition"
              title="Edit Book Details & Chapters"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Edit Book</span>
            </button>
          )}

          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`px-2.5 py-1 rounded-xl transition text-xs font-semibold flex items-center space-x-1.5 ${
              isNotesOpen
                ? 'bg-brand-600 text-white shadow-glow-purple'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Chapter Notes & Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Notes ({currentChapterNotes.length})</span>
          </button>

          {/* Mode Switch: Webtoon vs Single */}
          <button
            onClick={() => setReadingMode(readingMode === 'webtoon' ? 'single' : 'webtoon')}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1"
            title="Switch Reading Layout"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{readingMode === 'webtoon' ? 'Webtoon' : 'Single Page'}</span>
          </button>

          {/* Reader Atmosphere Theme Dropdown */}
          <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => setReaderTheme('midnight')}
              className={`w-5 h-5 rounded-lg bg-slate-900 border ${readerTheme === 'midnight' ? 'border-brand-400 scale-110' : 'border-transparent'}`}
              title="Midnight Dark"
            />
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`w-5 h-5 rounded-lg bg-[#fbf0d9] border ${readerTheme === 'sepia' ? 'border-amber-600 scale-110' : 'border-transparent'}`}
              title="Warm Sepia"
            />
            <button
              onClick={() => setReaderTheme('light')}
              className={`w-5 h-5 rounded-lg bg-white border ${readerTheme === 'light' ? 'border-slate-400 scale-110' : 'border-transparent'}`}
              title="Daylight Light Mode"
            />
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(book.id)}
            className={`p-2 rounded-xl transition ${
              book.isBookmarked ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${book.isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:block p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Reader Viewport Engine */}
      <main
        id="pdf-scroll-container"
        className="flex-1 overflow-y-auto w-full flex flex-col items-center pt-28 sm:pt-16 pb-20 sm:pb-16"
      >
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {readingMode === 'webtoon' ? (
          /* Continuous Vertical Webtoon Scroll Mode for Chapter Pages */
          <div className="w-full space-y-6">
            {chapterPages.map((pgNum) => (
              <div key={pgNum} className="w-full flex flex-col items-center">
                <div className="w-full mb-2 flex items-center justify-between text-xs text-slate-400 font-mono px-2">
                  <span>CHAPTER {currentChapterNumber}</span>
                  <span className="px-2.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                    PAGE {pgNum - currentChapter.startPage + 1} OF {currentChapter.endPage - currentChapter.startPage + 1}
                  </span>
                </div>

                {pdfData ? (
                  <PdfCanvasPage pdfData={pdfData} pageNumber={pgNum} scale={1.5} className="w-full" />
                ) : (
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex flex-col items-center justify-center p-8 sm:p-16 min-h-[60vh]">
                    <div className="text-center space-y-4 max-w-xl">
                      <h4 className="text-xl sm:text-2xl font-bold tracking-wide text-white">
                        {book.title} — Page {pgNum}
                      </h4>
                      <p className="text-sm opacity-80 leading-relaxed font-reading text-slate-300">
                        {book.description}
                      </p>
                      <div className="w-full h-48 rounded-xl bg-gradient-to-br from-brand-900/40 via-indigo-900/30 to-slate-900 border border-white/10 flex items-center justify-center p-4">
                        <BookOpen className="w-10 h-10 text-brand-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Single Page Mode */
          <div className="w-full flex-1 flex flex-col items-center justify-center my-4">
            <div className="w-full max-w-3xl flex flex-col items-center space-y-4">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{book.title}</span>
                <span className="font-bold text-brand-400">
                  PAGE {currentPage - currentChapter.startPage + 1} OF {currentChapter.endPage - currentChapter.startPage + 1}
                </span>
              </div>

              {pdfData ? (
                <PdfCanvasPage pdfData={pdfData} pageNumber={currentPage} scale={1.6} className="w-full" />
              ) : (
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 p-8 flex flex-col items-center justify-between text-center">
                  <h4 className="text-xl font-bold text-white">{book.title}</h4>
                  <p className="text-sm text-slate-300">{book.description}</p>
                  <span className="text-xs font-mono text-slate-400">Page {currentPage}</span>
                </div>
              )}

              {/* Page Controls */}
              <div className="w-full flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-xl bg-white/10 disabled:opacity-30 hover:bg-white/20 font-bold flex items-center space-x-1 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Page</span>
                </button>

                <span className="font-mono text-xs font-bold text-slate-400">
                  {Math.round((currentPage / book.totalPages) * 100)}% Complete
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= book.totalPages}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white font-bold flex items-center space-x-1 shadow-glow-purple"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Reader Bottom Navigation Bar */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 w-full bg-black/70 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full max-w-4xl mx-auto">
          <span className="text-xs font-semibold whitespace-nowrap text-white">
            Page {currentPage} / {book.totalPages}
          </span>
          <input
            type="range"
            min={1}
            max={book.totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-full accent-brand-500 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-extrabold text-brand-400 whitespace-nowrap">
            {Math.round((currentPage / book.totalPages) * 100)}%
          </span>
        </div>
      </footer>

      {/* Edit Book Modal */}
      <EditBookModal book={book} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      </div>

      {/* Right Slide-Over Panel for Chapter Notes & Comments */}
      {isNotesOpen && (
        <>
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsNotesOpen(false)} />
        <div className="fixed lg:relative inset-y-0 right-0 z-50 lg:z-40 w-full sm:w-96 lg:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col flex-shrink-0 transition-transform animate-in slide-in-from-right h-full">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <h3 className="font-bold text-sm">Ch. {currentChapterNumber} Notes & Comments</h3>
            </div>
            <button
              onClick={() => setIsNotesOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentChapterNotes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
                <MessageSquare className="w-8 h-8 opacity-40 text-brand-400" />
                <p className="text-xs font-medium">No notes for Chapter {currentChapterNumber} yet.</p>
                <p className="text-[11px] text-slate-500">Write key takeaways, questions or formulas below!</p>
              </div>
            ) : (
              currentChapterNotes.map((note: ChapterNote) => (
                <div key={note.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 group">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-brand-300 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-brand-400 inline-block" />
                      <span>Note</span>
                    </span>
                    <div className="flex items-center space-x-2 text-slate-400 text-[10px]">
                      <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteChapterNote(note.id)}
                          className="text-rose-400 opacity-0 group-hover:opacity-100 hover:text-rose-300 transition"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-reading whitespace-pre-wrap">{note.text}</p>
                </div>
              ))
            )}
          </div>

          {/* New Note Form */}
          <div className="p-3 border-t border-white/10 bg-black/40">
            {isAdmin ? (
              <div className="flex flex-col space-y-2">
                <textarea
                  rows={2}
                  placeholder={`Add a note for Chapter ${currentChapterNumber}...`}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-white/10 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-brand-500 transition resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-glow-purple transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Chapter Note</span>
                </button>
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-medium bg-white/5 rounded-xl border border-white/10">
                🔒 Reader View: Log in as Admin to post or edit chapter notes.
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};
