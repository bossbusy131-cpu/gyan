import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FlatItem } from '../utils/studyUtils';
import { VideoItem } from '../types/study';
import { Search, X, PlayCircle, Layers, FileText, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  videos: FlatItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (item: FlatItem) => void;
  onOpenFolder: (courseId: string, folderId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  videos,
  isOpen,
  onClose,
  onSelectVideo,
  onOpenFolder,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const results: FlatItem[] = [];
    for (const v of videos) {
      if (
        v.title.toLowerCase().includes(q) ||
        v.folderName.toLowerCase().includes(q) ||
        v.courseName.toLowerCase().includes(q)
      ) {
        results.push(v);
        if (results.length >= 35) break; // keep snappy
      }
    }
    return results;
  }, [videos, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-14 sm:pt-20 px-3 pb-6 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chapters, physics, math, topics, formulas..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {searchResults.map((item, idx) => (
            <div
              key={item.asset || idx}
              className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between gap-3 group transition-colors cursor-pointer"
              onClick={() => {
                onSelectVideo(item);
                onClose();
              }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    <span>{item.courseName}</span>
                    <span>·</span>
                    <span className="text-slate-400 dark:text-slate-500 truncate">
                      {item.folderName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenFolder(item.courseId, item.folderId);
                    onClose();
                  }}
                  className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 hidden sm:inline"
                >
                  Go to Chapter
                </button>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}

          {query.trim().length >= 2 && searchResults.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No lectures matching &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by topic, subject, or chapter number</p>
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <p className="text-xs">
                Search instantly across 11,600+ lectures from all 29 TargetBoard GyanSarthi batches.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className="text-slate-500">Popular:</span>
                {['Physics', 'Chemistry', 'Biology', 'Maths', 'Hindi Grammar', 'Chapter 1', 'Model Paper'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
