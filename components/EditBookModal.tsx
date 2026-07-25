'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, X, Layers, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateChapters } from '@/lib/chapters';
import { Book } from '@/types';

interface EditBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({ book, isOpen, onClose }) => {
  const { updateBook, deleteBook } = useAppStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<Book['category']>('Manhwa');
  const [status, setStatus] = useState<Book['status']>('ONGOING');
  const [totalPages, setTotalPages] = useState(100);
  const [pagesPerChapter, setPagesPerChapter] = useState(10);
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author || '');
      setCategory(book.category);
      setStatus(book.status);
      setTotalPages(book.totalPages);
      setPagesPerChapter(book.pagesPerChapter);
      setCoverUrl(book.coverImage);
      setDescription(book.description);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const sampleCovers = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const calcTotalChapters = Math.ceil(totalPages / pagesPerChapter);

    const updated: Book = {
      ...book,
      title: title || book.title,
      author: author || book.author,
      category,
      status,
      totalPages,
      pagesPerChapter,
      totalChapters: calcTotalChapters,
      chapters: generateChapters(totalPages, pagesPerChapter),
      coverImage: coverUrl || book.coverImage,
      description: description || book.description,
    };

    updateBook(updated);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    deleteBook(book.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-asura-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Book Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update metadata, pages per chapter & cover art
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-asura-cardHover text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Book updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Book Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Book['category'])}
                className="w-full px-2 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              >
                <option value="Manhwa">Manhwa</option>
                <option value="Manga">Manga</option>
                <option value="Light Novel">Light Novel</option>
                <option value="Textbook">Textbook</option>
                <option value="Study PDF">Study PDF</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Book['status'])}
                className="w-full px-2 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              >
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="HIATUS">HIATUS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Pages
              </label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pages/Ch
              </label>
              <input
                type="number"
                min={1}
                value={pagesPerChapter}
                onChange={(e) => setPagesPerChapter(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-300 flex items-center justify-between">
            <span>Calculated Chapters:</span>
            <span className="font-bold text-sm text-brand-400">
              {Math.ceil(totalPages / (pagesPerChapter || 1))} Chapters
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500 mb-2"
            />
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {sampleCovers.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Preset cover"
                  onClick={() => setCoverUrl(url)}
                  className={`w-10 h-14 object-cover rounded-lg cursor-pointer border-2 transition ${
                    coverUrl === url ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Synopsis
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Book</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-purple transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
