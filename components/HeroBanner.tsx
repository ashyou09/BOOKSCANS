'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Star, ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const HeroBanner: React.FC = () => {
  const { books, progressMap, dailyStats } = useAppStore();

  // Find most recently read book by lastReadAt timestamp
  const sortedProgressEntries = Object.values(progressMap).sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
  );

  const lastReadBookId = sortedProgressEntries[0]?.bookId;
  const recentBook = (lastReadBookId ? books.find((b) => b.id === lastReadBookId) : null) || books[0];
  const progress = recentBook ? progressMap[recentBook.id] : null;
  const currentChapter = progress?.currentChapter || 1;

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
        <div className="absolute inset-0 bg-gradient-to-r from-asura-bg via-asura-bg/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-asura-bg via-transparent to-transparent" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 p-5 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        
        {/* Left Synopsis & CTA */}
        <div className="flex-1 space-y-3 sm:space-y-4 text-left w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{progress ? 'CONTINUE READING' : 'RECENTLY ADDED'}</span>
            </span>

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

          {/* Quick Stats & Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
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

            <Link
              href="/library"
              className="w-full sm:w-auto text-center px-5 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-asura-border text-slate-200 font-semibold text-xs sm:text-sm hover:bg-asura-cardHover hover:text-white transition"
            >
              View Full Library ({books.length} Books)
            </Link>
          </div>
        </div>

        {/* Right Cover Preview & Progress Ring Card */}
        <div className="w-full md:w-auto flex items-center justify-center mt-2 md:mt-0">
          <div className="relative group">
            <div className="w-36 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-500/30 group-hover:border-brand-500 transition duration-300">
              <img
                src={recentBook.coverImage}
                alt={recentBook.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>

            {/* Reading Streak Badge Overlay */}
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
