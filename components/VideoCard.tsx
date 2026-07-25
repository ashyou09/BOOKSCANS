'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, Circle, Edit3, Trash2, X, ExternalLink, Video } from 'lucide-react';
import { VideoResource } from '@/types';
import { useAppStore } from '@/lib/store';

interface VideoCardProps {
  video: VideoResource;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { toggleVideoWatched, updateVideoNotes, deleteVideo, isAdmin } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(video.notes || '');

  const handleSaveNotes = () => {
    updateVideoNotes(video.id, notesText);
    setIsEditingNotes(false);
  };

  return (
    <>
      <div className={`bg-white dark:bg-asura-card border rounded-2xl p-4 shadow-sm transition flex flex-col justify-between ${
        video.isWatched
          ? 'border-slate-200 dark:border-asura-border opacity-85'
          : 'border-slate-200 dark:border-asura-border hover:border-brand-500/50 hover:shadow-glow-purple'
      }`}>
        <div>
          {/* Header Tag & Watch Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {video.category}
            </span>

            <button
              onClick={() => toggleVideoWatched(video.id)}
              className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-brand-400 transition"
            >
              {video.isWatched ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Watched</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>Mark Watched</span>
                </>
              )}
            </button>
          </div>

          {/* Thumbnail & Embed Trigger */}
          <div
            onClick={() => setIsPlaying(true)}
            className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 cursor-pointer group mb-3 border border-slate-800"
          >
            <img
              src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-glow-purple group-hover:scale-110 transition">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
            {video.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                {video.duration}
              </span>
            )}
          </div>

          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2">
            {video.title}
          </h4>

          {/* Notes Section */}
          <div className="bg-slate-50 dark:bg-asura-bg p-3 rounded-xl border border-slate-100 dark:border-asura-border text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-[10px] uppercase">Study Notes</span>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="hover:text-brand-400"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-asura-card border border-brand-500 outline-none text-xs"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 rounded bg-brand-500 text-white font-semibold text-[10px]"
                >
                  Save Notes
                </button>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 italic line-clamp-3">
                {video.notes || 'No study notes added yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-asura-border flex items-center justify-between text-xs">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-brand-500 hover:underline font-medium text-[11px]"
          >
            <span>Open YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {isAdmin && (
            <button
              onClick={() => deleteVideo(video.id)}
              className="text-slate-400 hover:text-rose-500 transition"
              title="Delete Video"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Video Modal Player */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-asura-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-asura-border flex items-center justify-between">
              <h3 className="font-bold text-white text-sm line-clamp-1">{video.title}</h3>
              <button
                onClick={() => setIsPlaying(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
