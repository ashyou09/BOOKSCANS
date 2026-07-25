'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookCard } from '@/components/BookCard';
import { UploadModal } from '@/components/UploadModal';
import { useAppStore } from '@/lib/store';
import { Book } from '@/types';
import { Search, Filter, PlusCircle, Bookmark, BookOpen, ArrowUpDown } from 'lucide-react';

function LibraryContent() {
  const { books, isAdmin } = useAppStore();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    filterParam === 'bookmarked' ? 'Bookmarked' : 'All'
  );
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'title'>('latest');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (filterParam === 'bookmarked') {
      setSelectedCategory('Bookmarked');
    }
  }, [filterParam]);

  const categories = [
    'All',
    'Bookmarked',
    'Manhwa',
    'Manga',
    'Light Novel',
    'Textbook',
    'Study PDF',
  ];

  const filtered = books
    .filter((b: Book) => {
      const matchesCategory =
        selectedCategory === 'All'
          ? true
          : selectedCategory === 'Bookmarked'
          ? b.isBookmarked
          : b.category === selectedCategory;

      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a: Book, b: Book) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Title & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-asura-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-3">
            <BookOpen className="w-7 h-7 text-brand-500" />
            <span>BookScan Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore and read your uploaded PDF books, manhwas, and study guides
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New PDF</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-asura-card p-4 rounded-2xl border border-slate-200 dark:border-asura-border shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-glow-purple'
                  : 'bg-slate-100 dark:bg-asura-bg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-asura-cardHover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border px-2.5 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-200 outline-none text-xs font-medium cursor-pointer"
            >
              <option value="latest">Latest Uploaded</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Filtered Books */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
            No Books Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-12 text-center text-sm text-slate-400">
        Loading BookScan Library...
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}
