import React, { useState } from 'react';
import { BookmarkItem, HistoryItem } from '../types/study';
import { Bookmark, History, Trash2, X, PlayCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { toggleBookmark } from '../utils/studyUtils';

interface BookmarksHistoryModalProps {
  isOpen: boolean;
  initialTab?: 'bookmarks' | 'history';
  onClose: () => void;
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  onPlayVideo: (title: string, asset?: string, courseId?: string, folderId?: string) => void;
  onClearHistory: () => void;
  onBookmarkChange: () => void;
}

export const BookmarksHistoryModal: React.FC<BookmarksHistoryModalProps> = ({
  isOpen,
  initialTab = 'bookmarks',
  onClose,
  bookmarks,
  history,
  onPlayVideo,
  onClearHistory,
  onBookmarkChange,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>(initialTab);

  if (!isOpen) return null;

  const handleRemoveBookmark = (b: BookmarkItem) => {
    toggleBookmark(b);
    onBookmarkChange();
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Bookmarks ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Watch History ({history.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {activeTab === 'history' && history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2 py-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1"
                title="Clear all watch history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'bookmarks' && (
            <>
              {bookmarks.map(b => (
                <div
                  key={b.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-blue-300 transition-colors"
                >
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => {
                      onPlayVideo(b.title, b.asset, b.courseId, b.folderId);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400">
                      <span className="font-semibold uppercase tracking-wider">{b.type}</span>
                      <span>·</span>
                      <span className="text-slate-500">{b.courseName}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-blue-600 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{b.folderName}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRemoveBookmark(b)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onPlayVideo(b.title, b.asset, b.courseId, b.folderId);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {bookmarks.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    No bookmarks saved yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click the bookmark icon on any lecture or PDF to save for fast revision.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {history.map((h, i) => (
                <div
                  key={h.asset ? h.asset + i : i}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 group hover:border-blue-300 transition-colors"
                >
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => {
                      onPlayVideo(h.title, h.asset, h.courseId, h.folderId);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{h.courseName}</span>
                      <span>·</span>
                      <span className="text-slate-400">{formatTime(h.timestamp)}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-blue-600 transition-colors">
                      {h.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{h.folderName}</p>
                  </div>

                  <button
                    onClick={() => {
                      onPlayVideo(h.title, h.asset, h.courseId, h.folderId);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    No recent watch history
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Lectures you watch will show here so you can pick up where you left off.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
