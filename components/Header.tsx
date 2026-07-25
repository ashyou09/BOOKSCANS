'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Moon,
  Sun,
  Flame,
  PlusCircle,
  Lock,
  Unlock,
  Video,
  Bookmark,
  Sparkles,
  X,
  Target
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { AdminModal } from './AdminModal';
import { UploadModal } from './UploadModal';

export const Header: React.FC = () => {
  const {
    themeMode,
    toggleThemeMode,
    isAdmin,
    logoutAdmin,
    dailyStats,
    books
  } = useAppStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredBooks = searchQuery.trim()
    ? books.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-asura-border bg-white/80 dark:bg-asura-bg/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-500 to-indigo-400 p-0.5 shadow-glow-purple group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-asura-bg rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-xl tracking-wider text-slate-900 dark:text-white uppercase font-sans">
                    BOOK<span className="text-brand-500">SCAN</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 tracking-tight">
                  Reading Atmosphere
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 dark:border-asura-border">
              <Link
                href="/library"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-asura-cardHover hover:text-brand-500 transition"
              >
                Library
              </Link>
              <Link
                href="/library?filter=bookmarked"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-asura-cardHover hover:text-brand-500 transition flex items-center space-x-1"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Bookmarks</span>
              </Link>
              <Link
                href="/videos"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-asura-cardHover hover:text-brand-500 transition flex items-center space-x-1"
              >
                <Video className="w-4 h-4 text-rose-500" />
                <span>Study Videos</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-xl hover:border-brand-500 transition"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search manhwa, books...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-asura-border rounded text-slate-400">
                ⌘K
              </kbd>
            </button>            {/* Reading Streak Badge Widget */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{dailyStats.streakDays} Day Streak</span>
            </div>

            {/* Admin Upload Button (Visible to Admin) */}
            {isAdmin && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-purple transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Upload PDF</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-asura-card transition border border-slate-200 dark:border-asura-border"
              title="Toggle Dark/Light Mode"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-brand-600" />
              )}
            </button>

            {/* Admin Lock / Unlock Status */}
            {isAdmin ? (
              <button
                onClick={logoutAdmin}
                className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center space-x-1"
                title="Admin Mode Active (Click to Logout)"
              >
                <Unlock className="w-4 h-4" />
                <span className="hidden xl:inline text-xs font-medium">Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-asura-card border border-slate-200 dark:border-asura-border text-slate-400 hover:text-white transition flex items-center space-x-1"
                title="Admin Login"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden xl:inline text-xs font-medium">Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-asura-bg/95 backdrop-blur-lg border-t border-slate-200 dark:border-asura-border px-4 py-2.5 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center text-[10px] font-semibold text-slate-400 hover:text-brand-500">
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </Link>
        <Link href="/library" className="flex flex-col items-center text-[10px] font-semibold text-slate-400 hover:text-brand-500">
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Library</span>
        </Link>
        <Link href="/library?filter=bookmarked" className="flex flex-col items-center text-[10px] font-semibold text-slate-400 hover:text-brand-500">
          <Bookmark className="w-4 h-4 text-amber-500 mb-0.5" />
          <span>Bookmarks</span>
        </Link>
        <Link href="/videos" className="flex flex-col items-center text-[10px] font-semibold text-slate-400 hover:text-brand-500">
          <Video className="w-4 h-4 text-rose-500 mb-0.5" />
          <span>Videos</span>
        </Link>
      </div>

      {/* Global Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-asura-border flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <Search className="w-5 h-5 text-brand-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search books, manhwa titles, authors, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-asura-cardHover text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/read/${book.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-asura-cardHover transition border border-transparent hover:border-brand-500/30"
                  >
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {book.category} • {book.totalChapters} Chapters • Rating {book.rating}★
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      Read
                    </span>
                  </Link>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No books found matching "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Type to start searching across your BookScan library.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />

      {/* Upload PDF Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  );
};
