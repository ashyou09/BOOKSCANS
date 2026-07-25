'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Bookmark, BookOpen, Flame, Edit3, Trash2 } from 'lucide-react';
import { Book } from '@/types';
import { useAppStore } from '@/lib/store';
import { EditBookModal } from './EditBookModal';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { toggleBookmark, progressMap, isAdmin, deleteBook } = useAppStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const progress = progressMap[book.id];
  const currentPage = progress?.currentPage || 0;
  const progressPercent = Math.min(100, Math.round((currentPage / book.totalPages) * 100));

  return (
    <>
      <div className="group relative bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl overflow-hidden shadow-sm hover:shadow-glow-purple transition-all duration-300 flex flex-col">
        {/* Cover Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-asura-bg via-transparent to-black/30 opacity-90" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/10">
                {book.category}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {isAdmin && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteBook(book.id);
                    }}
                    className="p-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white backdrop-blur-md transition shadow-md"
                    title="Delete Book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-brand-600 text-white backdrop-blur-md transition"
                    title="Edit Book Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleBookmark(book.id);
                  }}
                  className={`p-1.5 rounded-xl backdrop-blur-md transition ${
                    book.isBookmarked
                      ? 'bg-amber-500 text-slate-950 shadow-glow-gold'
                      : 'bg-slate-900/60 text-slate-300 hover:text-white'
                  }`}
                  title={book.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Rating & Chapter Badges */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-600/90 text-white backdrop-blur-md border border-brand-400/30 flex items-center space-x-1">
              <BookOpen className="w-3 h-3" />
              <span>Ch. {book.totalChapters}</span>
            </span>

            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-asura-gold text-xs font-bold">
              <Star className="w-3 h-3 fill-current text-asura-gold" />
              <span>{book.rating}</span>
            </div>
          </div>

          {/* Reading Progress Bar Overlay */}
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Book Metadata Footer */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <Link
              href={`/read/${book.id}`}
              className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 line-clamp-1 transition"
            >
              {book.title}
            </Link>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {book.author || 'BookScan Reader'}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-asura-border flex items-center justify-between text-xs">
            <span className="text-[10px] font-medium text-slate-400">
              {progressPercent > 0 ? `${progressPercent}% Read` : `${book.totalPages} Pages`}
            </span>

            <Link
              href={`/read/${book.id}`}
              className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-asura-bg text-slate-700 dark:text-slate-200 group-hover:bg-brand-500 group-hover:text-white transition"
            >
              {progressPercent > 0 ? 'Resume' : 'Read'}
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Book Modal */}
      <EditBookModal book={book} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </>
  );
};
