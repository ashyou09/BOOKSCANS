import { Chapter } from '@/types';

export function generateChapters(
  totalPages: number,
  pagesPerChapter: number
): Chapter[] {
  const chapters: Chapter[] = [];
  let currentPage = 1;
  let chapterNumber = 1;

  while (currentPage <= totalPages) {
    const endPage = Math.min(currentPage + pagesPerChapter - 1, totalPages);
    chapters.push({
      chapterNumber,
      title: `Chapter ${chapterNumber}`,
      startPage: currentPage,
      endPage,
      totalPages: endPage - currentPage + 1,
      releasedAt: new Date(Date.now() - (100 - chapterNumber) * 86400000 * 2).toISOString().split('T')[0],
    });
    currentPage = endPage + 1;
    chapterNumber++;
  }

  return chapters;
}

export function getChapterForPage(
  page: number,
  pagesPerChapter: number
): number {
  return Math.max(1, Math.ceil(page / pagesPerChapter));
}

export function getStartPageOfChapter(
  chapterNumber: number,
  pagesPerChapter: number
): number {
  return (chapterNumber - 1) * pagesPerChapter + 1;
}
