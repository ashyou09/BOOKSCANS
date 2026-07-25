'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, Layers, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateChapters } from '@/lib/chapters';
import { savePdfData } from '@/lib/pdfStorage';
import { Book } from '@/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { addBook } = useAppStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<Book['category']>('Textbook');
  const [totalPages, setTotalPages] = useState(10);
  const [pagesPerChapter, setPagesPerChapter] = useState(5);
  const [coverUrl, setCoverUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const sampleCovers = [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.pdf$/i, ''));
      }

      // Auto-extract total page count from actual PDF file using pdfjs-dist
      setIsExtractingPages(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        setTotalPages(pageCount);

        // Auto-suggest pagesPerChapter based on total pages
        if (pageCount > 100) {
          setPagesPerChapter(20);
        } else if (pageCount > 50) {
          setPagesPerChapter(10);
        } else if (pageCount > 20) {
          setPagesPerChapter(5);
        } else {
          setPagesPerChapter(Math.max(1, Math.min(5, pageCount)));
        }
      } catch (err) {
        console.error('Failed to extract PDF page count:', err);
      } finally {
        setIsExtractingPages(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bookId = `book-${Date.now()}`;
    let savedPdfUrl: string | undefined = undefined;

    if (pdfFile) {
      try {
        // Save to public/pdfs/ folder so it gets saved to disk & committed to GitHub
        const formData = new FormData();
        formData.append('file', pdfFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadRes = await res.json();
        if (uploadRes.success && uploadRes.url) {
          savedPdfUrl = uploadRes.url;
        }

        // Cache in browser IndexedDB for zero-latency reading
        const arrayBuffer = await pdfFile.arrayBuffer();
        await savePdfData(bookId, arrayBuffer);
        if (!savedPdfUrl) {
          savedPdfUrl = URL.createObjectURL(pdfFile);
        }
      } catch (err) {
        console.error('Error saving PDF file:', err);
      }
    }

    const validTotalPages = Math.max(1, totalPages);
    const validPagesPerChapter = Math.max(1, pagesPerChapter);
    const calcTotalChapters = Math.ceil(validTotalPages / validPagesPerChapter);

    const newBook: Book = {
      id: bookId,
      title: title || 'Uploaded PDF Document',
      author: author || 'Uploaded User Document',
      description: description || `Uploaded PDF file (${validTotalPages} pages)`,
      coverImage: coverUrl || sampleCovers[0],
      category,
      status: 'ONGOING',
      rating: 5.0,
      totalPages: validTotalPages,
      pagesPerChapter: validPagesPerChapter,
      totalChapters: calcTotalChapters,
      chapters: generateChapters(validTotalPages, validPagesPerChapter),
      isBookmarked: false,
      isNew: true,
      pdfUrl: savedPdfUrl,
      uploadedAt: new Date().toISOString(),
    };

    addBook(newBook);
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-asura-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                BookScan PDF Uploader
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload PDF & Auto-Split Into Chapters
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
              <span>PDF Book successfully published to your library!</span>
            </div>
          )}

          {/* PDF Drag Drop Upload Box */}
          <div className="border-2 border-dashed border-slate-300 dark:border-asura-border hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer relative bg-slate-50 dark:bg-asura-bg/50 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileText className="w-8 h-8 text-brand-500 mx-auto mb-2" />
            {pdfFile ? (
              <div>
                <p className="text-sm font-semibold text-brand-400">{pdfFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • {isExtractingPages ? 'Auto-detecting total pages...' : `${totalPages} Pages Detected`}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Click or Drag & Drop PDF File Here
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports any ML textbook, manhwa, or document PDF</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Book / Document Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Machine Learning Essentials"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Author / Creator
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Alex Mercer"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Book['category'])}
                className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              >
                <option value="Textbook">Textbook</option>
                <option value="Study PDF">Study PDF</option>
                <option value="Manhwa">Manhwa</option>
                <option value="Manga">Manga</option>
                <option value="Light Novel">Light Novel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Auto Total Pages
              </label>
              <input
                type="number"
                min={1}
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Layers className="w-3 h-3 text-brand-400" />
                <span>Pages/Chapter</span>
              </label>
              <input
                type="number"
                min={1}
                value={pagesPerChapter}
                onChange={(e) => setPagesPerChapter(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-300 flex items-center justify-between">
            <span>Auto-Split Chapters:</span>
            <span className="font-bold text-sm text-brand-400">
              {Math.ceil(totalPages / (pagesPerChapter || 1))} Chapters ({pagesPerChapter} pages/ch)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cover Image URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://..."
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
                    coverUrl === url ? 'border-brand-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview of document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isExtractingPages}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-purple transition"
            >
              {isSubmitting ? 'Saving PDF & Generating Chapters...' : 'Publish to BookScan Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
