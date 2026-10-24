import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, Course, TreeNode } from '../types/study';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  Save, 
  Film,
  Copy,
  Check,
  CheckCircle,
  ExternalLink,
  Maximize2,
  Minimize2,
  MessageSquare,
  ThumbsUp,
  Send,
  Trash2,
  Sparkles,
  ShieldCheck,
  Radio,
  Clock,
  User,
  Heart
} from 'lucide-react';
import { 
  getPlayerUrl, 
  isBookmarked, 
  toggleBookmark, 
  getNotes, 
  saveNote, 
  saveToHistory 
} from '../utils/studyUtils';
import { authService, UserProfile } from '../services/authService';

export interface CommentItem {
  id: string;
  author: string;
  authorRole?: string;
  text: string;
  timestamp: number;
  timeAgo: string;
  likes: number;
  isLikedByMe?: boolean;
  isMyComment?: boolean;
  pinned?: boolean;
}

interface TopVideoPlayerProps {
  video: VideoItem;
  videoIndex: number;
  allVideos: VideoItem[];
  course?: Course | null;
  folder?: TreeNode | null;
  user: UserProfile | null;
  onClose: () => void;
  onSelectVideo: (video: VideoItem, index: number) => void;
  onSwitchToReels?: (video: VideoItem) => void;
  onBookmarkChange: () => void;
}

const COMMENTS_STORAGE_PREFIX = 'tb_lecture_comments_v2_';

export const TopVideoPlayer: React.FC<TopVideoPlayerProps> = ({
  video,
  videoIndex,
  allVideos,
  course,
  folder,
  user,
  onClose,
  onSelectVideo,
  onSwitchToReels,
  onBookmarkChange,
}) => {
  const [directPlayerUrl, setDirectPlayerUrl] = useState<string | null>(() => {
    return video.asset ? getPlayerUrl(video.asset) : null;
  });
  const [isDirectStream, setIsDirectStream] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'notes'>('comments');

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [noteSavedAlert, setNoteSavedAlert] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const commentsStorageKey = `${COMMENTS_STORAGE_PREFIX}${video.asset || video.title}`;

  const bookmarkId = `${course?.id || 'c'}_${folder?.id || 'f'}_${video.title}`;
  const bookmarked = isBookmarked(bookmarkId);
  const playerUrl = directPlayerUrl;

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullScreenPlayer(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullScreenPlayer(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreenPlayer(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Fetch direct video token from TargetBoard backend
  useEffect(() => {
    let cancelled = false;
    async function loadToken() {
      if (!video.asset) {
        setDirectPlayerUrl(null);
        setIsDirectStream(false);
        return;
      }

      const defaultUrl = getPlayerUrl(video.asset);
      setDirectPlayerUrl(defaultUrl || null);
      setIsDirectStream(false);

      try {
        const code = await authService.fetchVideoToken(video.asset);
        if (!cancelled && code) {
          setDirectPlayerUrl(
            `https://app.tpstreams.com/embed/kuepke/${encodeURIComponent(video.asset)}/?access_token=${code}`
          );
          setIsDirectStream(true);
        }
      } catch {
        // Fallback to default
      }
    }
    loadToken();
    return () => {
      cancelled = true;
    };
  }, [video.asset]);

  // Load history & notes
  useEffect(() => {
    if (video.asset) {
      saveToHistory({
        asset: video.asset,
        title: video.title,
        courseId: course?.id || '',
        courseName: course?.name || 'GyanSarthi',
        folderId: folder?.id || '',
        folderName: folder?.name || 'Chapter',
        timestamp: Date.now(),
      });
    }

    const notes = getNotes();
    const existing = notes[video.asset || video.title];
    if (existing) {
      setNoteContent(existing.content);
    } else {
      setNoteContent('');
    }
  }, [video, course, folder]);

  // Load Comments for this video
  useEffect(() => {
    try {
      const stored = localStorage.getItem(commentsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComments(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse comments', e);
    }

    // Default seeded comments for authentic engagement
    const defaultSeeded: CommentItem[] = [
      {
        id: 'seed-mentor-1',
        author: 'TargetBoard Faculty',
        authorRole: 'Official Faculty',
        text: 'Dear Students, is video lecture ke sabhi definitions aur formulas board exam me 5-marks section me aate hain. Notes zarur banayein!',
        timestamp: Date.now() - 1000 * 60 * 60 * 12,
        timeAgo: '12h ago',
        likes: 38,
        pinned: true,
      },
      {
        id: 'seed-student-1',
        author: 'Rahul Sharma',
        authorRole: 'Class 12th Topper',
        text: 'Sir derivation bohot detail me aur aasan bhasha me samjhaya aapne. Saare doubts clear ho gaye! 🙏',
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
        timeAgo: '4h ago',
        likes: 16,
      },
      {
        id: 'seed-student-2',
        author: 'Pooja Kumari',
        authorRole: 'Class 12th Board',
        text: 'BSEB Board exam preparation ke liye best lecture series hai TargetBoard par. Thank you sir!',
        timestamp: Date.now() - 1000 * 60 * 90,
        timeAgo: '2h ago',
        likes: 9,
      },
      {
        id: 'seed-student-3',
        author: 'Aman Kumar',
        authorRole: 'Student',
        text: 'Sir question 3 ka formula revise karne me bohot help mili. 100/100 marks target! 🔥',
        timestamp: Date.now() - 1000 * 60 * 30,
        timeAgo: '30m ago',
        likes: 6,
      },
    ];

    setComments(defaultSeeded);
    try {
      localStorage.setItem(commentsStorageKey, JSON.stringify(defaultSeeded));
    } catch {}
  }, [commentsStorageKey, video.title]);

  const handleSaveNote = () => {
    const noteId = video.asset || video.title;
    saveNote({
      id: noteId,
      asset: video.asset,
      title: video.title,
      courseName: course?.name || 'GyanSarthi',
      content: noteContent,
      updatedAt: Date.now(),
    });
    setNoteSavedAlert(true);
    setTimeout(() => setNoteSavedAlert(false), 2000);
  };

  const handleCopyLink = () => {
    if (playerUrl) {
      navigator.clipboard.writeText(playerUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToggleBookmark = () => {
    toggleBookmark({
      id: bookmarkId,
      type: 'video',
      title: video.title,
      asset: video.asset,
      courseId: course?.id || '',
      courseName: course?.name || 'GyanSarthi',
      folderId: folder?.id || '',
      folderName: folder?.name || 'Chapter',
      savedAt: Date.now(),
    });
    onBookmarkChange();
  };

  // Add a new comment
  const handlePostComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;

    setCommentSubmitting(true);
    const newComment: CommentItem = {
      id: 'cmt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      author: user?.fullName || 'Student',
      authorRole: user?.className ? user.className.split(' ')[0] + ' ' + (user.className.split(' ')[1] || '') : 'TargetBoard Student',
      text: newCommentText.trim(),
      timestamp: Date.now(),
      timeAgo: 'Just now',
      likes: 0,
      isLikedByMe: false,
      isMyComment: true,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setNewCommentText('');
    setCommentSubmitting(false);

    try {
      localStorage.setItem(commentsStorageKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save comment to localStorage', err);
    }
  };

  // Toggle like on comment
  const handleToggleLikeComment = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const isLiked = !c.isLikedByMe;
        return {
          ...c,
          isLikedByMe: isLiked,
          likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
        };
      }
      return c;
    });

    setComments(updated);
    try {
      localStorage.setItem(commentsStorageKey, JSON.stringify(updated));
    } catch {}
  };

  // Delete comment (if user's own)
  const handleDeleteComment = (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId);
    setComments(updated);
    try {
      localStorage.setItem(commentsStorageKey, JSON.stringify(updated));
    } catch {}
  };

  // Quick feedback tag click
  const handleQuickTagClick = (tagText: string) => {
    setNewCommentText(prev => prev ? `${prev} ${tagText}` : tagText);
  };

  const hasPrev = videoIndex > 0;
  const hasNext = videoIndex < allVideos.length - 1;

  return (
    <div className="w-full mb-8 sm:mb-12 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      
      {/* Main Video Section with 16:9 Aspect Ratio on Top */}
      <div className="w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 truncate">
              <span>{course?.name || 'TargetBoard'}</span>
              <span className="text-slate-600 dark:text-slate-500">·</span>
              <span className="text-slate-300 truncate">{folder?.name || 'Chapter'}</span>
              {isDirectStream && (
                <span className="ml-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 shrink-0">
                  Direct 1080p
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
              {video.title}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullScreenPlayer ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreenPlayer ? (
                <Minimize2 className="w-4 h-4 text-amber-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Reel Mode */}
            {onSwitchToReels && (
              <button
                onClick={() => {
                  onSwitchToReels(video);
                }}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                title="View in Reel Mode"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Reel</span>
              </button>
            )}

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl text-xs transition-colors ${
                bookmarked
                  ? 'text-amber-400 bg-amber-950/70 border border-amber-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={bookmarked ? 'Saved in Bookmarks' : 'Add to Bookmarks'}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* External Tab */}
            {playerUrl && (
              <a
                href={playerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-950/80 hover:text-rose-400 transition-colors ml-1"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 16:9 Video Player Screen (Strict 16:9 aspect-video) */}
        <div 
          ref={playerContainerRef} 
          className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden"
        >
          {playerUrl ? (
            <iframe
              src={playerUrl}
              title={video.title}
              className="w-full h-full border-0 aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-3 p-4">
              <Film className="w-12 h-12 text-amber-500 animate-pulse" />
              <span className="text-sm font-semibold">Loading TargetBoard Lecture Stream...</span>
            </div>
          )}
        </div>

        {/* Player Navigation Bar */}
        <div className="px-4 py-2.5 sm:px-6 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          {/* Previous Video */}
          <button
            disabled={!hasPrev}
            onClick={() => hasPrev && onSelectVideo(allVideos[videoIndex - 1], videoIndex - 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              hasPrev
                ? 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer'
                : 'bg-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Lecture</span>
          </button>

          {/* Lecture Progress Counter */}
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="text-amber-400 font-bold">Lecture {videoIndex + 1}</span>
            <span>of</span>
            <span>{allVideos.length}</span>
          </div>

          {/* Next Video */}
          <button
            disabled={!hasNext}
            onClick={() => hasNext && onSelectVideo(allVideos[videoIndex + 1], videoIndex + 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              hasNext
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Next Lecture</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Comments vs Personal Notes */}
        <div className="px-4 sm:px-6 pt-4 pb-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments & Doubts ({comments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Personal Notes</span>
            </button>
          </div>

          {activeTab === 'notes' && noteSavedAlert && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              Notes Saved!
            </span>
          )}
        </div>

        {/* TAB 1: COMMENTS SECTION (Website me niche comment karne ka feature) */}
        {activeTab === 'comments' && (
          <div className="p-4 sm:p-6 bg-slate-900 space-y-6">
            
            {/* Comment Post Input Box */}
            <form onSubmit={handlePostComment} className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/90 shadow-inner">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                  {user?.fullName?.charAt(0) || 'S'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      {user?.fullName || 'TargetBoard Student'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {user?.className || 'Board Exam Student'}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    placeholder="Is lecture par apna comment ya doubt puchein..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                  />

                  {/* Quick comment chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {[
                      '💡 Concept Clear!',
                      '❓ Sir ek doubt hai',
                      '🔥 Superb Teaching',
                      '📝 Important for Exam',
                      '💯 100/100 Target',
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleQuickTagClick(tag)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim() || commentSubmitting}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Discussion & Questions ({comments.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  TargetBoard Verified Community
                </span>
              </div>

              {comments.map(c => (
                <div
                  key={c.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-colors ${
                    c.pinned
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        c.pinned
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.author.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {c.author}
                          </span>
                          {c.authorRole && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              c.pinned
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {c.authorRole}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {c.timeAgo}
                          </span>
                        </div>

                        {/* Comment Content */}
                        <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed break-words">
                          {c.text}
                        </p>

                        {/* Actions: Like, Reply */}
                        <div className="flex items-center gap-4 mt-2.5">
                          <button
                            onClick={() => handleToggleLikeComment(c.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              c.isLikedByMe
                                ? 'text-amber-400'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${c.isLikedByMe ? 'fill-current' : ''}`} />
                            <span>{c.likes}</span>
                          </button>

                          {c.isMyComment && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {c.pinned && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-md shrink-0">
                        Pinned Mentor
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: PERSONAL NOTES SECTION */}
        {activeTab === 'notes' && (
          <div className="p-4 sm:p-6 bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Personal Revision Notes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Is lecture ke key formulas, imp questions aur revision points yahan save karein.
                </p>
              </div>

              <button
                onClick={handleSaveNote}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="1. Formula 1: ...&#10;2. Important step: ...&#10;3. Exam tip: ..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono resize-y"
            />
          </div>
        )}

      </div>
    </div>
  );
};
