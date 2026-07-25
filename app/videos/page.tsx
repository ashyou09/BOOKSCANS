'use client';

import React, { useState } from 'react';
import { VideoCard } from '@/components/VideoCard';
import { useAppStore } from '@/lib/store';
import { Video, PlusCircle, Filter, CheckCircle2, Circle, X } from 'lucide-react';
import { VideoResource } from '@/types';

export default function VideosPage() {
  const { videos, addVideo, isAdmin } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<VideoResource['category']>('ML');
  const [notes, setNotes] = useState('');

  const categories = ['All', 'ML', 'Math', 'Web Dev', 'General'];

  const filtered = videos.filter((v) =>
    selectedCategory === 'All' ? true : v.category === selectedCategory
  );

  const extractYoutubeId = (link: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'aircAruvnKk';
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeId(url);
    const newVid: VideoResource = {
      id: `vid-${Date.now()}`,
      title: title || 'Untitled Study Video',
      url,
      youtubeId: ytId,
      category,
      isWatched: false,
      addedAt: new Date().toISOString(),
      notes,
    };
    addVideo(newVid);
    setTitle('');
    setUrl('');
    setNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-asura-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-3">
            <Video className="w-7 h-7 text-rose-500" />
            <span>Video Study Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize study video tutorials, track watched status, and take notes
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-brand-600 hover:from-rose-500 hover:to-brand-500 text-white font-bold text-xs shadow-glow-purple transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Video Link</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-asura-border pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-asura-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-asura-cardHover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Videos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl space-y-3">
          <Video className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
            No Videos in Category
          </h3>
        </div>
      )}

      {/* Add Video Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-asura-card border border-slate-200 dark:border-asura-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-asura-border flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add Study Video Link
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-asura-cardHover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning Transformer Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-rose-500"
                >
                  <option value="ML">ML / AI</option>
                  <option value="Math">Math</option>
                  <option value="Web Dev">Web Dev</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Study Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key concepts to focus on..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-asura-bg border border-slate-200 dark:border-asura-border text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-brand-600 hover:from-rose-500 hover:to-brand-500 text-white font-bold text-xs shadow-md transition"
                >
                  Add Video to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
