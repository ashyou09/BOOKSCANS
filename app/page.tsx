'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/HeroBanner';
import { BookCard } from '@/components/BookCard';
import { GoalTracker } from '@/components/GoalTracker';
import { useAppStore } from '@/lib/store';
import { Flame, Sparkles, BookOpen, Clock, Bookmark, ArrowRight, Grid } from 'lucide-react';

export default function HomePage() {
  const { books, progressMap } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'manhwa' | 'textbook' | 'bookmarked'>('all');

  const bookmarkedBooks = books.filter((b) => b.isBookmarked);
  const hotBooks = books.filter((b) => b.isHot);

  const filteredBooks = books.filter((b) => {
    if (activeTab === 'manhwa') return b.category === 'Manhwa' || b.category === 'Manga';
    if (activeTab === 'textbook') return b.category === 'Textbook' || b.category === 'Study PDF';
    if (activeTab === 'bookmarked') return b.isBookmarked;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Featured Hero Banner */}
      <HeroBanner />

      {/* Daily Reading Goal Tracker */}
      <GoalTracker />

      {/* Popular & Recent Releases Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-asura-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight uppercase">
                Latest Updates & Popular Reads
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick up where you left off or explore newly added titles
              </p>
            </div>
          </div>

          {/* Filter Tab Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-brand-600 text-white shadow-glow-purple'
                  : 'bg-slate-100 dark:bg-asura-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-asura-cardHover'
              }`}
            >
              All ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('manhwa')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'manhwa'
                  ? 'bg-brand-600 text-white shadow-glow-purple'
                  : 'bg-slate-100 dark:bg-asura-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-asura-cardHover'
              }`}
            >
              Manhwa & Manga
            </button>
            <button
              onClick={() => setActiveTab('textbook')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'textbook'
                  ? 'bg-brand-600 text-white shadow-glow-purple'
                  : 'bg-slate-100 dark:bg-asura-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-asura-cardHover'
              }`}
            >
              Textbooks & Study
            </button>
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                activeTab === 'bookmarked'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-gold'
                  : 'bg-slate-100 dark:bg-asura-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-asura-cardHover'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarkedBooks.length})</span>
            </button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
