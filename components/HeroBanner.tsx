'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Star, ArrowRight, Play, Clock, Layers, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Book } from '@/types';

export const HeroBanner: React.FC = () => {
  const { books, progressMap, dailyStats } = useAppStore();

  // Find all books that have reading progress, sorted by lastReadAt descending
  const recentReads = books
    .map((book: Book) => {
      const progress = progressMap[book.id];
      return {
        book,
        progress,
        lastReadAt: progress?.lastReadAt ? new Date(progress.lastReadAt).getTime() : 0,
      };
    })
    .sort((a: any, b: any) => b.lastReadAt - a.lastReadAt);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Active featured book is either selected by user or the most recently read book
  const activeEntry =
    recentReads.find((r: { book: Book; progress: any; lastReadAt: number }) => r.book.id === selectedBookId) ||
    recentReads[0] ||
    { book: books[0], progress: null, lastReadAt: 0 };

  const recentBook = activeEntry.book;
  const progress = activeEntry.progress || progressMap[recentBook?.id];

  const currentChapter = progress?.currentChapter || 1;
  const currentPage = progress?.currentPage || 1;
  const totalPages = recentBook?.totalPages || 1;
  const progressPercent = Math.min(100, Math.round((currentPage / totalPages) * 100));

  // Format relative timestamp
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString || isoString.startsWith('2020-')) return 'New Addition';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hrs ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (!recentBook) return null;

  return (
    <section className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-asura-border shadow-2xl bg-asura-bg my-4 sm:my-6">
      {/* Background Banner Image with Gradient Blur */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-30">
        <img
          src={recentBook.bannerImage || recentBook.coverImage}
          alt={recentBook.title}
          className="w-full h-full object-cover filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-asura-bg via-asura-bg/95 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-asura-bg via-transparent to-transparent" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Synopsis & CTA */}
        <div className="flex-1 space-y-3.5 text-left w-full">
          
          {/* Top Badges & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{progress ? 'RECENTLY READ' : 'FEATURED BOOK'}</span>
            </span>

            {progress?.lastReadAt && (
              <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatTimeAgo(progress.lastReadAt)}</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{recentBook.rating} Rating</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight line-clamp-2">
            {recentBook.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 max-w-2xl font-normal leading-relaxed">
            {recentBook.description}
          </p>

          {/* Reading Progress Indicator Bar */}
          {progress && (
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 max-w-xl space-y-1.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-brand-300 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  <span>Chapter {currentChapter} (Page {currentPage} of {totalPages})</span>
                </span>
                <span className="font-bold text-emerald-400">{progressPercent}% Completed</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Action Options & Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/read/${recentBook.id}`}
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-glow-purple flex items-center space-x-2 transition transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {progress ? `Resume Chapter ${currentChapter}` : 'Start Reading'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Quick Chapter Selector Options */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              {[1, 2, 3].map((chNum) => (
                <Link
                  key={chNum}
                  href={`/read/${recentBook.id}`}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
                    chNum === currentChapter
                      ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                      : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Ch. {chNum}
                </Link>
              ))}
            </div>
          </div>

          {/* Switch Recently Read Books Carousel Tabs */}
          {recentReads.length > 1 && (
            <div className="pt-2 flex items-center space-x-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Recent Reads:
              </span>
              <div className="flex items-center space-x-2">
                {recentReads.slice(0, 4).map(({ book }: { book: Book }) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition border whitespace-nowrap ${
                      book.id === recentBook.id
                        ? 'bg-brand-600 text-white border-brand-400 shadow-glow-purple font-bold'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {book.title.length > 20 ? `${book.title.substring(0, 20)}...` : book.title}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Cover Preview Card */}
        <div className="w-full md:w-auto flex items-center justify-center mt-2 md:mt-0">
          <div className="relative group">
            <div className="w-36 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-500/30 group-hover:border-brand-500 transition duration-300">
              <img
                src={recentBook.coverImage}
                alt={recentBook.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>

            {/* Reading Streak Overlay */}
            <div className="absolute -bottom-3 -left-3 bg-asura-card/95 backdrop-blur-md border border-asura-border px-3.5 py-2 rounded-2xl shadow-xl flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                ⚡
              </div>
              <div>
                <p className="text-[11px] font-bold text-white tracking-wide">
                  {dailyStats.streakDays} Day Reading Streak
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
