import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FlatItem, getPlayerUrl, getLikedReels, toggleReelLike, getReelComments, addReelComment, ReelComment, isBookmarked, toggleBookmark } from '../utils/studyUtils';
import { authService } from '../services/authService';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  ExternalLink, 
  Send, 
  X, 
  Volume2, 
  VolumeX, 
  Check, 
  Shuffle,
  GraduationCap,
  Layers,
  Info,
  Maximize,
  Minimize
} from 'lucide-react';

interface TikReelsViewProps {
  videos: FlatItem[];
  initialAsset?: string;
  onOpenFolder: (courseId: string, folderId: string) => void;
  onBookmarkChange: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TikReelsView: React.FC<TikReelsViewProps> = ({
  videos,
  initialAsset,
  onOpenFolder,
  onBookmarkChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [copiedShare, setCopiedShare] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  // Extract filter options
  const filterOptions = useMemo(() => {
    return [
      { id: 'all', label: 'All Lectures' },
      { id: '12th', label: '12th Science/Arts' },
      { id: '10th', label: '10th Toppers' },
      { id: '11th', label: '11th Science' },
      { id: 'physics', label: 'Physics' },
      { id: 'chemistry', label: 'Chemistry' },
      { id: 'math', label: 'Maths' },
      { id: 'hindi', label: 'Hindi / Grammar' },
    ];
  }, []);

  // Filtered pool of videos
  const filteredVideos = useMemo(() => {
    if (selectedFilter === 'all') return videos;
    const q = selectedFilter.toLowerCase();
    return videos.filter(v => {
      const text = `${v.courseName} ${v.folderName} ${v.title}`.toLowerCase();
      if (q === '12th') return text.includes('12th');
      if (q === '10th') return text.includes('10th');
      if (q === '11th') return text.includes('11th');
      if (q === 'physics') return text.includes('physics') || text.includes('भौतिक');
      if (q === 'chemistry') return text.includes('chemistry') || text.includes('रसायन');
      if (q === 'math') return text.includes('math') || text.includes('गणित');
      if (q === 'hindi') return text.includes('hindi') || text.includes('हिंदी') || text.includes('grammar');
      return true;
    });
  }, [videos, selectedFilter]);

  // Set initial asset if provided
  useEffect(() => {
    if (initialAsset && filteredVideos.length > 0) {
      const idx = filteredVideos.findIndex(v => v.asset === initialAsset);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialAsset, filteredVideos]);

  // Make sure currentIndex is valid
  useEffect(() => {
    if (currentIndex >= filteredVideos.length && filteredVideos.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredVideos.length, currentIndex]);

  const currentReel = filteredVideos[currentIndex] || filteredVideos[0];

  // Load likes and comments for current reel
  useEffect(() => {
    if (!currentReel) return;
    setLikedMap(getLikedReels());
    setComments(getReelComments(currentReel.asset || currentReel.title));
  }, [currentReel]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredVideos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  }, [currentIndex, filteredVideos.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(filteredVideos.length - 1);
    }
  }, [currentIndex, filteredVideos.length]);

  const handleRandom = () => {
    if (filteredVideos.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredVideos.length);
    if (nextIdx === currentIndex) nextIdx = (nextIdx + 1) % filteredVideos.length;
    setCurrentIndex(nextIdx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in comments
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (currentReel?.asset) handleLike();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, currentReel]);

  const handleLike = () => {
    if (!currentReel?.asset) return;
    toggleReelLike(currentReel.asset);
    setLikedMap(getLikedReels());
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 700);
  };

  const handleBookmark = () => {
    if (!currentReel) return;
    const bookmarkId = `${currentReel.courseId}_${currentReel.folderId}_${currentReel.title}`;
    toggleBookmark({
      id: bookmarkId,
      type: 'video',
      title: currentReel.title,
      asset: currentReel.asset,
      courseId: currentReel.courseId,
      courseName: currentReel.courseName,
      folderId: currentReel.folderId,
      folderName: currentReel.folderName,
      savedAt: Date.now(),
    });
    onBookmarkChange();
  };

  const handleShare = () => {
    if (!currentReel?.asset) return;
    const url = getPlayerUrl(currentReel.asset);
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentReel) return;
    const updated = addReelComment(currentReel.asset || currentReel.title, newCommentText.trim());
    setComments(updated);
    setNewCommentText('');
  };

  const currentAsset = currentReel?.asset;
  const [directReelUrl, setDirectReelUrl] = useState<string | null>(() => {
    return currentAsset ? getPlayerUrl(currentAsset) : null;
  });

  useEffect(() => {
    if (!currentAsset) {
      setDirectReelUrl(null);
      return;
    }
    let cancelled = false;
    const defaultUrl = getPlayerUrl(currentAsset);
    setDirectReelUrl(defaultUrl || null);

    authService.fetchVideoToken(currentAsset).then(code => {
      if (!cancelled && code) {
        setDirectReelUrl(`https://app.tpstreams.com/embed/kuepke/${encodeURIComponent(currentAsset)}/?access_token=${code}`);
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentAsset]);

  if (!currentReel) {
    return (
      <div className="text-center py-20 bg-slate-900 rounded-2xl text-white">
        <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Loading Tik-Reels...</h3>
        <p className="text-xs text-slate-400 mt-1">Fetching lectures and study clips.</p>
      </div>
    );
  }

  const isLiked = !!(currentReel.asset && likedMap[currentReel.asset]);
  const bookmarkId = `${currentReel.courseId}_${currentReel.folderId}_${currentReel.title}`;
  const bookmarked = isBookmarked(bookmarkId);
  const playerUrl = currentReel.asset ? getPlayerUrl(currentReel.asset) : null;
  const activeReelSrc = directReelUrl || playerUrl;

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto pb-2 w-full">
      
      {/* Top Filter Chips */}
      <div className="w-full flex items-center justify-between gap-3 mb-4 overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-1.5">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedFilter(opt.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedFilter === opt.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRandom}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:text-blue-600 transition-colors shrink-0"
          title="Jump to a random reel"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Shuffle</span>
        </button>
      </div>

      {/* Main Reels Viewport Container */}
      <div className={`relative w-full ${
        isFullscreen
          ? 'max-w-4xl sm:max-w-5xl md:max-w-6xl aspect-[16/9] min-h-[75vh]'
          : 'max-w-md sm:max-w-lg md:max-w-xl aspect-[9/16] sm:aspect-[4/5] md:aspect-[16/10]'
      } bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center transition-all duration-300`}>
        
        {/* The TargetBoard Video Embed */}
        {activeReelSrc ? (
          <iframe
            key={currentReel.asset || currentIndex}
            src={activeReelSrc}
            title={currentReel.title}
            className="w-full h-full border-0 select-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Sparkles className="w-10 h-10 text-blue-400 animate-pulse" />
            <span className="text-xs font-medium">Loading revision reel...</span>
          </div>
        )}

        {/* Double-click Heart burst animation */}
        {heartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-ping">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
          </div>
        )}

        {/* Navigation Floating Buttons */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-black/90 transition-all hover:scale-110 active:scale-95"
            title="Previous Reel (Key: Up or K)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-black/90 transition-all hover:scale-110 active:scale-95"
            title="Next Reel (Key: Down or J)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Reels Interaction Sidebar (Right side) */}
        <div className="absolute right-3 bottom-16 sm:bottom-12 flex flex-col items-center gap-3.5 z-20">
          {/* Like */}
          <button
            onClick={handleLike}
            className="group flex flex-col items-center gap-1 text-white select-none"
          >
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 ${
              isLiked ? 'bg-rose-600 text-white' : 'bg-black/50 border border-white/10 text-white'
            }`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-semibold drop-shadow">
              {isLiked ? 'Liked' : '1.2k'}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(true)}
            className="group flex flex-col items-center gap-1 text-white select-none"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold drop-shadow">
              {comments.length}
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className="group flex flex-col items-center gap-1 text-white select-none"
          >
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 ${
              bookmarked ? 'bg-blue-600 text-white' : 'bg-black/50 border border-white/10 text-white'
            }`}>
              {bookmarked ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </div>
            <span className="text-[11px] font-semibold drop-shadow">
              {bookmarked ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="group flex flex-col items-center gap-1 text-white select-none"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 text-white">
              {copiedShare ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </div>
            <span className="text-[11px] font-semibold drop-shadow">
              {copiedShare ? 'Copied' : 'Share'}
            </span>
          </button>

          {/* Fullscreen Button in Reels */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="group flex flex-col items-center gap-1 text-white select-none"
              title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
            >
              <div className="w-11 h-11 rounded-full bg-black/50 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 active:scale-90 text-white">
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-blue-400" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </div>
              <span className="text-[11px] font-semibold drop-shadow">
                {isFullscreen ? 'Exit' : 'Full'}
              </span>
            </button>
          )}
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none">
          <div className="max-w-[75%] space-y-1.5 pointer-events-auto">
            {/* Batch & Channel */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800/80 backdrop-blur-sm">
                <GraduationCap className="w-3 h-3 text-blue-400" />
                <span>{currentReel.courseName.slice(0, 28)}</span>
              </span>
            </div>

            {/* Lecture Title */}
            <h3 className="font-display font-bold text-sm sm:text-base text-white leading-snug line-clamp-2 drop-shadow-md">
              {currentReel.title}
            </h3>

            {/* Chapter link */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => onOpenFolder(currentReel.courseId, currentReel.folderId)}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md transition-colors"
              >
                <Layers className="w-3 h-3 text-amber-300" />
                <span className="truncate max-w-[170px]">{currentReel.folderName}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Drawer (Modal / Sheet) */}
        {showComments && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md p-4 flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm text-white">Student Discussions</span>
                <span className="text-xs text-slate-400">({comments.length})</span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {comments.map(c => (
                <div key={c.id} className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-400">{c.author}</span>
                    <span className="text-[10px] text-slate-500">{c.timeAgo}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Ask doubt or share revision tip..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Reel Progress & Keyboard Instructions */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <span>Reel {currentIndex + 1} of {filteredVideos.length}</span>
          <span>·</span>
          <span className="hidden sm:inline">Use ↑ / ↓ arrow keys to flip</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenFolder(currentReel.courseId, currentReel.folderId)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Full Batch</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
};
