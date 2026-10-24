import React, { useState } from 'react';
import { PdfItem, Course, TreeNode } from '../types/study';
import { FileText, Download, ExternalLink, X, Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { toggleBookmark, isBookmarked } from '../utils/studyUtils';

interface PdfViewerModalProps {
  pdf: PdfItem;
  course?: Course | null;
  folder?: TreeNode | null;
  onClose: () => void;
  onBookmarkChange: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  pdf,
  course,
  folder,
  onClose,
  onBookmarkChange,
}) => {
  const [copied, setCopied] = useState(false);
  const bookmarkId = `${course?.id || 'c'}_${folder?.id || 'f'}_${pdf.title}`;
  const bookmarked = isBookmarked(bookmarkId);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(pdf.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBookmark = () => {
    toggleBookmark({
      id: bookmarkId,
      type: 'pdf',
      title: pdf.title,
      courseId: course?.id || '',
      courseName: course?.name || 'GyanSarthi',
      folderId: folder?.id || '',
      folderName: folder?.name || 'Chapter',
      savedAt: Date.now(),
    });
    onBookmarkChange();
  };

  const targetBoardSearchUrl = `https://targetboard.co.in/dashboard?search=${encodeURIComponent(pdf.title)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4">
        
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-sm">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
            {course?.name || 'Study Material'}
          </span>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-1">
            {pdf.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Folder: {folder?.name || 'Notes & Panel PDF'}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Panel Document Name:</span>
            <button
              onClick={handleCopyTitle}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Name'}</span>
            </button>
          </div>
          <p className="font-mono text-slate-800 dark:text-slate-200 break-words bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            {pdf.title}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleToggleBookmark}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-colors ${
              bookmarked
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{bookmarked ? 'Saved in Bookmarks' : 'Bookmark PDF'}</span>
          </button>

          <a
            href={targetBoardSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Open on TargetBoard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
