'use client';

import './globals.css';
import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAppStore } from '@/lib/store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themeMode, checkAndResetDailyStats, syncWithDatabase } = useAppStore();

  useEffect(() => {
    checkAndResetDailyStats();
    syncWithDatabase();
  }, [checkAndResetDailyStats, syncWithDatabase]);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <html lang="en" className={themeMode}>
      <head>
        <title>BookScan — AsuraScans Inspired Reading Atmosphere</title>
        <meta
          name="description"
          content="Personal manhwa, book & video study reading application with custom reading atmosphere and dark/light modes."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Georgia&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-asura-bg text-slate-900 dark:text-white transition-colors duration-300 flex flex-col">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        
        {/* Footer */}
        <footer className="w-full border-t border-slate-200 dark:border-asura-border py-6 bg-white dark:bg-asura-bg text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 dark:text-white">BOOKSCAN</span>
              <span>• AsuraScans Reading Atmosphere</span>
            </div>
            <p>© 2026 BookScan Reader. Private Personal Library App.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
