'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PdfCanvasPageProps {
  pdfData: ArrayBuffer | string;
  pageNumber: number;
  scale?: number;
  className?: string;
}

export const PdfCanvasPage: React.FC<PdfCanvasPageProps> = ({
  pdfData,
  pageNumber,
  scale = 1.5,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        root: document.getElementById('pdf-scroll-container') || null,
        rootMargin: '1200px' 
      }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!isVisible || !pdfData || !canvasRef.current) return;
      setLoading(true);
      setError(null);

      try {
        let loadingTaskPromise;
        // Basic caching logic attached to window to share across instances easily
        const globalCache = (window as any).__pdfCache || new Map();
        if (!(window as any).__pdfCache) (window as any).__pdfCache = globalCache;

        if (globalCache.has(pdfData)) {
          loadingTaskPromise = globalCache.get(pdfData);
        } else {
          const pdfjsLib = await import('pdfjs-dist');
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          }

          const loadingTask = pdfjsLib.getDocument(
            typeof pdfData === 'string' ? pdfData : { data: pdfData }
          );
          loadingTaskPromise = loadingTask.promise;
          globalCache.set(pdfData, loadingTaskPromise);
        }

        const pdf = await loadingTaskPromise;
        if (isCancelled) return;

        const targetPage = Math.min(Math.max(1, pageNumber), pdf.numPages);
        const page = await pdf.getPage(targetPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Optimize memory for mobile devices
        const isMobile = window.innerWidth < 768;
        const finalScale = isMobile ? scale * 0.7 : scale;
        
        const viewport = page.getViewport({ scale: finalScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (isMobile) {
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (!isCancelled) {
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error(`Error rendering PDF page ${pageNumber}:`, err);
          setError(err.message || 'Failed to render page');
          setLoading(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfData, pageNumber, scale, isVisible]);

  return (
    <div ref={containerRef} className={`relative flex flex-col items-center justify-center min-h-[600px] w-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-xs font-semibold text-brand-300">
          Loading Page {pageNumber}...
        </div>
      )}
      {error && (
        <div className="p-4 text-xs text-rose-400 bg-rose-950/40 border border-rose-800 rounded-xl">
          Page {pageNumber}: {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-xl shadow-2xl border border-white/10"
      />
    </div>
  );
};
