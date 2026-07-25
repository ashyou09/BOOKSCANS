'use client';

import React from 'react';
import { Chapter } from '@/types';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

interface ChapterListProps {
  chapters: Chapter[];
  currentChapterNumber: number;
  onSelectChapter: (chapterNumber: number) => void;
  pagesPerChapter: number;
  totalPages: number;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapterNumber,
  onSelectChapter,
  pagesPerChapter,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-asura-card border-r border-slate-200 dark:border-asura-border">
      <div className="p-4 border-b border-slate-200 dark:border-asura-border flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          <span>Chapters List ({chapters.length})</span>
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400">
          {pagesPerChapter} pages/ch
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chapters.map((ch) => {
          const isActive = ch.chapterNumber === currentChapterNumber;
          const isRead = ch.chapterNumber < currentChapterNumber;

          return (
            <button
              key={ch.chapterNumber}
              onClick={() => onSelectChapter(ch.chapterNumber)}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition ${
                isActive
                  ? 'bg-brand-600 text-white font-bold shadow-glow-purple'
                  : isRead
                  ? 'bg-slate-50 dark:bg-asura-bg/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-asura-cardHover'
                  : 'bg-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-asura-cardHover'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold">
                    {ch.title || `Chapter ${ch.chapterNumber}`}
                  </span>
                </div>
                <p className={`text-[10px] mt-0.5 ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                  Pages {ch.startPage} - {ch.endPage}
                </p>
              </div>

              {isActive ? (
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-white text-brand-700 uppercase">
                  Reading
                </span>
              ) : isRead ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
