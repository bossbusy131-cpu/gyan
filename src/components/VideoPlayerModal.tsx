import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, Course, TreeNode } from '../types/study';
import { 
  ChevronLeft, 
  RotateCw, 
  Maximize, 
  Send, 
  Film,
  RefreshCw,
  AlertCircle,
  Lock,
  LogIn
} from 'lucide-react';
import { 
  getPlayerUrl, 
  saveToHistory 
} from '../utils/studyUtils';
import { authService, UserProfile } from '../services/authService';
import { commentService, LectureComment, formatTimeAgo } from '../services/commentService';
import { TargetBoardLoginModal } from './TargetBoardLoginModal';

interface VideoPlayerModalProps {
  video: VideoItem;
  videoIndex: number;
  allVideos: VideoItem[];
  course?: Course | null;
  folder?: TreeNode | null;
  onClose: () => void;
  onSelectVideo: (video: VideoItem, index: number) => void;
  onSwitchToReels?: (video: VideoItem) => void;
  onBookmarkChange: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  course,
  folder,
  onClose,
}) => {
  const [directPlayerUrl, setDirectPlayerUrl] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'ready' | 'needs_login'>('loading');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return authService.getStoredUser();
  });

  // Comments state
  const [comments, setComments] = useState<LectureComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  const browserUrl = video.asset ? getPlayerUrl(video.asset) : null;
  const playerUrl = directPlayerUrl;
  const lectureIdentifier = video.title || video.asset || 'lecture';

  // Listen for login request from iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data === 'OPEN_TB_LOGIN') {
        setIsLoginModalOpen(true);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  // Load video token from TargetBoard backend and build safe proxied player URL
  useEffect(() => {
    let cancelled = false;
    async function loadToken() {
      if (!video.asset) {
        setDirectPlayerUrl(null);
        setTokenStatus('ready');
        return;
      }

      setTokenStatus('loading');

      const userToken = localStorage.getItem('token') || '';
      if (!userToken) {
        setTokenStatus('needs_login');
        return;
      }

      // First attempt to get authorized streaming code via student session
      try {
        const code = await authService.fetchVideoToken(video.asset);
        if (!cancelled && code) {
          setDirectPlayerUrl(
            `/api/tpstreams-player?asset=${encodeURIComponent(video.asset)}&token=${encodeURIComponent(code)}&userToken=${encodeURIComponent(userToken)}`
          );
          setTokenStatus('ready');
          return;
        }
      } catch (err) {
        console.warn('Could not fetch token via client API', err);
      }

      // If token not received or unauthorized, prompt login to authenticate stream
      if (!cancelled) {
        setTokenStatus('needs_login');
      }
    }

    loadToken();
    return () => {
      cancelled = true;
    };
  }, [video.asset, reloadCounter]);

  // Record history on mount/change
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
  }, [video, course, folder]);

  // Load persistent comments for this lecture
  useEffect(() => {
    let cancelled = false;
    async function loadComments() {
      setCommentsLoading(true);
      setCommentError(null);
      try {
        const list = await commentService.getComments(lectureIdentifier);
        if (!cancelled) {
          setComments(list);
        }
      } catch (err: any) {
        if (!cancelled) {
          setCommentError(err?.message || 'Failed to load comments');
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [lectureIdentifier]);

  // Handle reload action
  const handleReload = () => {
    setIsReloading(true);
    setReloadCounter(prev => prev + 1);
    setTimeout(() => {
      setIsReloading(false);
    }, 700);
  };

  // Handle comment submit
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setSubmittingComment(true);
    setCommentError(null);

    const user = currentUser || authService.getStoredUser();
    const authorName = user?.fullName || 'Student';

    try {
      const newComment = await commentService.addComment(
        lectureIdentifier,
        trimmed,
        authorName,
        user?.id
      );
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch (err: any) {
      setCommentError(err?.message || 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const courseDisplayName = course?.name || folder?.name || 'वरदान बैच - 12th Science Batch 2026-27';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      
      {/* Top 16:9 Video Player Container (Matches Reference Screenshot 2) */}
      <div className="relative w-full bg-black shrink-0">
        
        {/* Circular Back Button on top-left of video */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
          aria-label="Back to course"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6 -ml-0.5" />
        </button>

        {/* 16:9 Responsive Player */}
        <div className="w-full aspect-video max-h-[75vh] mx-auto flex items-center justify-center relative overflow-hidden bg-black">
          {tokenStatus === 'loading' ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-black space-y-3 p-4 text-center">
              <RefreshCw className="w-9 h-9 text-emerald-500 animate-spin" />
              <span className="text-xs sm:text-sm font-medium text-slate-300">Authenticating TargetBoard lecture stream...</span>
            </div>
          ) : tokenStatus === 'needs_login' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-0.5">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">TargetBoard Student Login Required</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                Log in with your TargetBoard registered mobile number to stream this video lecture directly inside our player.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2 mt-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Login with TargetBoard</span>
              </button>
            </div>
          ) : playerUrl ? (
            <iframe
              key={`${playerUrl}_${reloadCounter}`}
              src={playerUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-black space-y-2.5">
              <Film className="w-10 h-10 text-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">Preparing TargetBoard lecture player...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area (Light clean background matching Screenshot 2) */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28">
        
        {/* Lecture Details */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-5">
          {/* Lecture Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            {video.title}
          </h1>

          {/* Batch / Course Name */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {courseDisplayName}
          </p>

          {/* Action Buttons (Reload and Browser) */}
          <div className="flex items-center gap-3 mt-4">
            
            {/* Reload Button */}
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="bg-[#e7f0e7] hover:bg-[#d8e6d8] active:bg-[#cde0cd] text-[#24422e] dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 font-semibold rounded-full px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              title="Reload lecture video player"
            >
              <RotateCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </button>

            {/* Browser Button */}
            {(browserUrl || playerUrl) && (
              <a
                href={browserUrl || playerUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold rounded-full px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                title="Open lecture in browser"
              >
                <Maximize className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Browser</span>
              </a>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="pt-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">
            Comments
          </h2>

          {/* Error Message */}
          {commentError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{commentError}</span>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs">Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((item) => {
                const initial = (item.author || 'S').trim().charAt(0).toUpperCase();
                const timeText = formatTimeAgo(item.timestamp, item.timeAgo);

                return (
                  <div key={item.id} className="flex items-start gap-3">
                    {/* User Avatar Initial Badge (Matches Screenshot 2 light teal circle) */}
                    <div className="w-9 h-9 rounded-full bg-[#b2ede2] dark:bg-teal-900/70 text-[#0f5348] dark:text-teal-200 font-bold flex items-center justify-center text-sm shrink-0 shadow-xs select-none">
                      {initial}
                    </div>

                    {/* Comment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.author}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] sm:text-xs">
                          · {timeText}
                        </span>
                      </div>

                      <p className="text-slate-800 dark:text-slate-300 text-xs sm:text-sm mt-0.5 leading-relaxed break-words">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

      </div>

      {/* Sticky Bottom Comment Input Bar (Matches Screenshot 2) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <form 
          onSubmit={handleAddComment}
          className="max-w-4xl mx-auto flex items-center gap-2.5 sm:gap-3"
        >
          {/* Comment text input */}
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            disabled={submittingComment}
            className="flex-1 bg-[#f3f4f6] dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3c] border border-slate-200/90 dark:border-slate-700 transition-colors"
          />

          {/* Send Button (Dark forest green circle with paperplane icon) */}
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="w-10 h-10 rounded-full bg-[#2d5a3c] hover:bg-[#234830] active:scale-95 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Send comment"
            title="Post comment"
          >
            {submittingComment ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 -ml-0.5" />
            )}
          </button>
        </form>
      </div>

      {/* In-Player TargetBoard Login Modal */}
      {isLoginModalOpen && (
        <TargetBoardLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(u) => {
            setIsLoginModalOpen(false);
            setCurrentUser(u);
            setReloadCounter(prev => prev + 1);
          }}
        />
      )}

    </div>
  );
};
