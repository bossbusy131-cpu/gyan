import React, { useState, useMemo } from 'react';
import { Course, TreeNode, CatalogFolder, VideoItem, PdfItem, TestItem } from '../types/study';
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  Film,
  Download,
  Share2,
  Copy,
  Check,
  Heart
} from 'lucide-react';
import { isBookmarked, toggleBookmark } from '../utils/studyUtils';

interface ItemListProps {
  course: Course;
  folder: TreeNode;
  catalog: CatalogFolder;
  onBack: () => void;
  onPlayVideo: (video: VideoItem, index: number, allVideos: VideoItem[]) => void;
  onPlayInReelMode: (video: VideoItem) => void;
  onOpenPdf: (pdf: PdfItem) => void;
  onBookmarkChange: () => void;
  isFavoriteBatch?: boolean;
  onToggleFavoriteBatch?: () => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  course,
  folder,
  catalog,
  onBack,
  onPlayVideo,
  onPlayInReelMode,
  onOpenPdf,
  onBookmarkChange,
  isFavoriteBatch = false,
  onToggleFavoriteBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'pdfs' | 'tests'>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const videos = catalog.videos || [];
  const pdfs = catalog.pdfs || [];
  const tests = catalog.tests || [];

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase().trim();
    return videos.filter(v => v.title.toLowerCase().includes(q));
  }, [videos, searchQuery]);

  const filteredPdfs = useMemo(() => {
    if (!searchQuery.trim()) return pdfs;
    const q = searchQuery.toLowerCase().trim();
    return pdfs.filter(p => p.title.toLowerCase().includes(q));
  }, [pdfs, searchQuery]);

  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return tests;
    const q = searchQuery.toLowerCase().trim();
    return tests.filter(t => t.title.toLowerCase().includes(q));
  }, [tests, searchQuery]);

  const handleCopyLink = (video: VideoItem) => {
    const url = `${window.location.origin}/#course=${course.id}&folder=${folder.id}&asset=${video.asset}`;
    navigator.clipboard.writeText(url);
    setCopiedId(video.asset);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (
    type: 'video' | 'pdf' | 'test',
    item: VideoItem | PdfItem | TestItem
  ) => {
    const id = `${course.id}_${folder.id}_${item.title}`;
    toggleBookmark({
      id,
      type,
      title: item.title,
      asset: 'asset' in item ? item.asset : undefined,
      courseId: course.id,
      courseName: course.name,
      folderId: folder.id,
      folderName: folder.name,
      savedAt: Date.now(),
    });
    onBookmarkChange();
  };

  return (
    <div className="space-y-5">
      {/* Chapter Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Back to folders"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {course.name}
            </span>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate">
              {folder.name}
            </h2>
          </div>

          {/* Favourite Batch button */}
          {onToggleFavoriteBatch && (
            <button
              onClick={onToggleFavoriteBatch}
              className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isFavoriteBatch
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50 text-rose-500 scale-105 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
              title={isFavoriteBatch ? 'Remove Batch from Favourites' : 'Add Batch to Favourites'}
              aria-label={isFavoriteBatch ? 'Remove Batch from Favourites' : 'Add Batch to Favourites'}
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavoriteBatch ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'videos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Videos ({videos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pdfs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pdfs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDFs ({pdfs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tests ({tests.length})</span>
          </button>
        </div>

        {/* Filter input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} in this chapter...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <>
            {filteredVideos.map((video, idx) => {
              const bookmarkId = `${course.id}_${folder.id}_${video.title}`;
              const bookmarked = isBookmarked(bookmarkId);
              return (
                <div
                  key={video.asset || idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/70 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onPlayVideo(video, idx, videos)}
                      className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                      title="Play lecture"
                    >
                      <PlayCircle className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                      <h3
                        onClick={() => onPlayVideo(video, idx, videos)}
                        className="font-medium text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug line-clamp-2"
                      >
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Lecture #{idx + 1}</span>
                        {video.asset && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              ID: {video.asset.slice(0, 8)}...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto justify-end">
                    {/* Watch in Reel Mode */}
                    <button
                      onClick={() => onPlayInReelMode(video)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                      title="Watch in Tik-Reels mode"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Reel Mode</span>
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleToggleBookmark('video', video)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        bookmarked
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark this lecture'}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(video)}
                      className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy lecture link"
                    >
                      {copiedId === video.asset ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Play Button */}
                    <button
                      onClick={() => onPlayVideo(video, idx, videos)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1"
                    >
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredVideos.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <PlayCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No video lectures found in this section
                </p>
              </div>
            )}
          </>
        )}

        {/* PDFs Tab */}
        {activeTab === 'pdfs' && (
          <>
            {filteredPdfs.map((pdf, idx) => {
              const bookmarkId = `${course.id}_${folder.id}_${pdf.title}`;
              const bookmarked = isBookmarked(bookmarkId);
              return (
                <div
                  key={pdf.title + idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 group transition-all hover:border-blue-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {pdf.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        PDF Notes & Study Material
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleBookmark('pdf', pdf)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        bookmarked
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark PDF'}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenPdf(pdf)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Open PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPdfs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No PDF documents found in this section
                </p>
              </div>
            )}
          </>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <>
            {filteredTests.map((test, idx) => (
              <div
                key={test.title + idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {test.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      TargetBoard Practice Mock Test
                    </p>
                  </div>
                </div>

                <a
                  href={`https://targetboard.co.in/dashboard/test?t=${encodeURIComponent(
                    test.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Start Test</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}

            {filteredTests.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No online tests in this section
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
