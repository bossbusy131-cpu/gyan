import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StudyData, 
  Course, 
  TreeNode, 
  CatalogFolder, 
  VideoItem, 
  PdfItem, 
  BookmarkItem, 
  HistoryItem 
} from './types/study';
import { 
  loadStudyData, 
  extractAllVideos, 
  FlatItem, 
  getBookmarks, 
  getHistory,
  getFavoriteBatches,
  toggleFavoriteBatch 
} from './utils/studyUtils';
import { Header } from './components/Header';
import { CourseList } from './components/CourseList';
import { FolderTree } from './components/FolderTree';
import { ItemList } from './components/ItemList';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { TikReelsView } from './components/TikReelsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { BookmarksHistoryModal } from './components/BookmarksHistoryModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { SplashScreen } from './components/SplashScreen';
import { BottomNav } from './components/BottomNav';
import { TargetBoardLoginModal } from './components/TargetBoardLoginModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LiveClassesView } from './components/LiveClassesView';
import { authService, UserProfile } from './services/authService';
import { 
  Sparkles, 
  GraduationCap, 
  AlertCircle, 
  RefreshCw, 
  Heart,
  Maximize,
  Minimize,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // TargetBoard Authentication & Profile State
  const [user, setUser] = useState<UserProfile | null>(() => authService.getStoredUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync login on initial load
  useEffect(() => {
    const existing = authService.getStoredUser();
    if (existing) {
      setUser(existing);
    }
  }, []);

  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' && !!document.fullscreenElement;
  });

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen]);

  // Views & Navigation
  const [view, setView] = useState<'browser' | 'reels' | 'live'>('browser');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [nodeMap, setNodeMap] = useState<Record<string, TreeNode>>({});
  const [activeLeafFolder, setActiveLeafFolder] = useState<TreeNode | null>(null);

  // Playing / Viewing Modals
  const [playingVideoState, setPlayingVideoState] = useState<{
    video: VideoItem;
    index: number;
    allVideos: VideoItem[];
  } | null>(null);
  const [viewingPdf, setViewingPdf] = useState<PdfItem | null>(null);
  const [reelInitialAsset, setReelInitialAsset] = useState<string | undefined>(undefined);

  // Overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [bookmarksTab, setBookmarksTab] = useState<'bookmarks' | 'history'>('bookmarks');
  
  // Storage state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favoriteBatchIds, setFavoriteBatchIds] = useState<string[]>(() => getFavoriteBatches());
  const [batchFilterGroup, setBatchFilterGroup] = useState<string>('all');

  const handleToggleFavoriteBatch = useCallback((courseId: string) => {
    toggleFavoriteBatch(courseId);
    setFavoriteBatchIds(getFavoriteBatches());
  }, []);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tik_reels_theme') as 'light' | 'dark') || 'light';
  });

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tik_reels_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load study data
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setLoading(true);
        const data = await loadStudyData();
        if (mounted) {
          if (data && data.courses && data.courses.length > 0) {
            setStudyData(data);
          } else {
            setError('Could not load course catalog. Please check network connection.');
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Failed to initialize study materials.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync bookmarks, history, and favorite batches
  const reloadSavedItems = useCallback(() => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
    setFavoriteBatchIds(getFavoriteBatches());
  }, []);

  useEffect(() => {
    reloadSavedItems();
  }, [reloadSavedItems]);

  // Global keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Flattened video list for Reels and Global Search
  const flatVideos = useMemo(() => {
    if (!studyData) return [];
    return extractAllVideos(studyData);
  }, [studyData]);

  // Index nodes of selected course
  const indexCourseTree = useCallback((nodes: TreeNode[]) => {
    const map: Record<string, TreeNode> = {};
    const traverse = (items: TreeNode[], parentId: string | null) => {
      for (const item of items) {
        map[item.id] = { ...item, parent: parentId };
        if (item.children && item.children.length > 0) {
          traverse(item.children, item.id);
        }
      }
    };
    traverse(nodes, null);
    setNodeMap(map);
  }, []);

  // Course Selection Handler
  const handleSelectCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
    setCurrentPath([]);
    setActiveLeafFolder(null);
    if (studyData?.trees[course.id]) {
      indexCourseTree(studyData.trees[course.id]);
    } else {
      setNodeMap({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [studyData, indexCourseTree]);

  // Node Click inside FolderTree
  const handleNavigateNode = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const newPath = [...currentPath, node.id];
    setCurrentPath(newPath);

    if (hasChildren) {
      setActiveLeafFolder(null);
    } else {
      // Leaf folder: display items (videos, pdfs, tests)
      setActiveLeafFolder(node);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Breadcrumb navigation
  const handleNavigateBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
      setActiveLeafFolder(null);
      return;
    }
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    const targetNode = nodeMap[newPath[newPath.length - 1]];
    if (targetNode && (!targetNode.children || targetNode.children.length === 0)) {
      setActiveLeafFolder(targetNode);
    } else {
      setActiveLeafFolder(null);
    }
  };

  // Back to course list
  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentPath([]);
    setActiveLeafFolder(null);
    setNodeMap({});
  };

  // Back from items list to parent folder
  const handleBackFromItems = () => {
    setActiveLeafFolder(null);
    if (currentPath.length > 0) {
      setCurrentPath(prev => prev.slice(0, -1));
    }
  };

  // Open folder directly (e.g. from reels or search)
  const handleOpenFolderFromOutside = (courseId: string, folderId: string) => {
    if (!studyData) return;
    const course = studyData.courses.find(c => c.id === courseId);
    if (!course) return;

    setSelectedCourse(course);
    const tree = studyData.trees[courseId] || [];
    indexCourseTree(tree);

    // Build path to this folder
    const map: Record<string, TreeNode> = {};
    const parentMap = new Map<string, string>();
    const traverse = (items: TreeNode[], parentId: string | null) => {
      for (const item of items) {
        map[item.id] = item;
        if (parentId) parentMap.set(item.id, parentId);
        if (item.children && item.children.length > 0) {
          traverse(item.children, item.id);
        }
      }
    };
    traverse(tree, null);

    const path: string[] = [];
    let cur: string | undefined = folderId;
    while (cur) {
      path.unshift(cur);
      cur = parentMap.get(cur);
    }

    setCurrentPath(path);
    const target = map[folderId];
    if (target && (!target.children || target.children.length === 0)) {
      setActiveLeafFolder(target);
    } else {
      setActiveLeafFolder(null);
    }

    setView('browser');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Play video from any item or search
  const handlePlayVideo = (video: VideoItem, index: number, allVideos: VideoItem[]) => {
    setPlayingVideoState({ video, index, allVideos });
  };

  // Play video from search or history
  const handlePlayVideoFromSearchOrHistory = (
    title: string,
    asset?: string,
    courseId?: string,
    folderId?: string
  ) => {
    if (asset) {
      setPlayingVideoState({
        video: { title, asset },
        index: 0,
        allVideos: [{ title, asset }],
      });
      if (courseId) {
        const c = studyData?.courses.find(course => course.id === courseId);
        if (c) setSelectedCourse(c);
      }
    }
  };

  // Switch to Reels Mode starting with a specific video
  const handlePlayInReelMode = (video: VideoItem) => {
    setReelInitialAsset(video.asset);
    setView('reels');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mandatory Login Gate: The website cannot be opened or accessed without login
  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white`}>
        {/* Splash Screen */}
        {showSplash && (
          <SplashScreen
            onFinish={() => setShowSplash(false)}
            isLoadingData={loading}
          />
        )}

        {/* Minimal Auth Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  GyanSarthi
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  TargetBoard Student Portal
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </header>

        {/* Mandatory Login Modal */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <TargetBoardLoginModal
            isOpen={true}
            onClose={() => {}}
            onLoginSuccess={newUser => {
              setUser(newUser);
              setIsLoginModalOpen(false);
            }}
            isMandatory={true}
          />
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800 bg-slate-900/60">
          TargetBoard Student Login Required • Developer ♥️ Mohammad Irfan
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Universal Clean Header */}
      <Header
        onGoHome={() => {
          setView('browser');
          setBatchFilterGroup('all');
          setSelectedCourse(null);
          setCurrentPath([]);
          setActiveLeafFolder(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLive={() => {
          setView('live');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area (padding-bottom ensures bottom nav doesn't cover content) */}
      <main className={`flex-1 w-full mx-auto transition-all pb-24 ${
        view === 'reels' || isFullscreen
          ? 'max-w-none px-2 sm:px-6 py-3 md:py-6'
          : 'max-w-7xl px-3 sm:px-6 py-4 md:py-8'
      }`}>
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 animate-bounce">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Loading GyanSarthi Catalog...
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Preparing 29 batches, 11,600+ lectures, and TargetBoard study materials.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Unable to load catalog
            </h2>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Ready State */}
        {!loading && studyData && (
          <>
            {/* 1. Tik-Reels View */}
            {view === 'reels' && (
              <TikReelsView
                videos={flatVideos}
                initialAsset={reelInitialAsset}
                onOpenFolder={handleOpenFolderFromOutside}
                onBookmarkChange={reloadSavedItems}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            )}

            {/* 2. Course & Batch Browser View */}
            {view === 'browser' && (
              <>
                {/* Level 1: Course List */}
                {!selectedCourse && (
                  <CourseList
                    courses={studyData.courses}
                    onSelectCourse={handleSelectCourse}
                    favoriteBatchIds={favoriteBatchIds}
                    onToggleFavoriteBatch={handleToggleFavoriteBatch}
                    filterGroup={batchFilterGroup}
                    onFilterGroupChange={setBatchFilterGroup}
                    onOpenReelsForGroup={group => {
                      setView('reels');
                    }}
                  />
                )}

                {/* Level 2 & 3: Folder Tree or Item List */}
                {selectedCourse && (
                  <>
                    {activeLeafFolder ? (
                      // Leaf Items screen (Videos, PDFs, Tests)
                      <ItemList
                        course={selectedCourse}
                        folder={activeLeafFolder}
                        catalog={
                          studyData.catalogs[selectedCourse.id]?.[activeLeafFolder.id] || {
                            videos: [],
                            pdfs: [],
                            tests: [],
                          }
                        }
                        onBack={handleBackFromItems}
                        onPlayVideo={handlePlayVideo}
                        onPlayInReelMode={handlePlayInReelMode}
                        onOpenPdf={pdf => setViewingPdf(pdf)}
                        onBookmarkChange={reloadSavedItems}
                        isFavoriteBatch={favoriteBatchIds.includes(selectedCourse.id)}
                        onToggleFavoriteBatch={() => handleToggleFavoriteBatch(selectedCourse.id)}
                      />
                    ) : (
                      // Hierarchical folder/chapter browser
                      <FolderTree
                        course={selectedCourse}
                        nodes={studyData.trees[selectedCourse.id] || []}
                        currentPath={currentPath}
                        nodeMap={nodeMap}
                        onNavigateNode={handleNavigateNode}
                        onNavigateBreadcrumb={handleNavigateBreadcrumb}
                        onBackToCourses={handleBackToCourses}
                        isFavorite={favoriteBatchIds.includes(selectedCourse.id)}
                        onToggleFavorite={() => handleToggleFavoriteBatch(selectedCourse.id)}
                      />
                    )}
                  </>
                )}
              </>
            )}
            {/* 3. Live Classes View */}
            {view === 'live' && (
              <LiveClassesView
                onSelectStream={() => {
                  // Handled inside LiveClassesView
                }}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">GyanSarthi</span>
            <span>·</span>
            <span>Tik-Reels Study Companion for TargetBoard</span>
          </div>

          {/* Devloper Mohammad Irfan Credit Badge (Replays Splash Screen) */}
          <button
            onClick={() => setShowSplash(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors cursor-pointer"
            title="View Splash Screen"
          >
            <span>Devloper</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white">Mohammad Irfan</span>
          </button>

          <div className="flex items-center gap-4 text-[11px]">
            <span>11,680+ Lectures</span>
            <span>·</span>
            <span>11,130+ PDFs</span>
            <span>·</span>
            <span>810+ Tests</span>
          </div>
        </div>
      </footer>

      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          isLoadingData={loading}
        />
      )}

      {/* Video Player Modal */}
      {playingVideoState && (
        <VideoPlayerModal
          video={playingVideoState.video}
          videoIndex={playingVideoState.index}
          allVideos={playingVideoState.allVideos}
          course={selectedCourse}
          folder={activeLeafFolder}
          onClose={() => setPlayingVideoState(null)}
          onSelectVideo={(video, index) =>
            setPlayingVideoState({
              video,
              index,
              allVideos: playingVideoState.allVideos,
            })
          }
          onSwitchToReels={handlePlayInReelMode}
          onBookmarkChange={reloadSavedItems}
        />
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <PdfViewerModal
          pdf={viewingPdf}
          course={selectedCourse}
          folder={activeLeafFolder}
          onClose={() => setViewingPdf(null)}
          onBookmarkChange={reloadSavedItems}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        videos={flatVideos}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectVideo={item => {
          if (item.asset) {
            handlePlayVideo(
              { title: item.title, asset: item.asset },
              0,
              [{ title: item.title, asset: item.asset }]
            );
          }
        }}
        onOpenFolder={handleOpenFolderFromOutside}
      />

      {/* Bookmarks and History Modal */}
      <BookmarksHistoryModal
        isOpen={isBookmarksOpen}
        initialTab={bookmarksTab}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        history={history}
        onPlayVideo={handlePlayVideoFromSearchOrHistory}
        onClearHistory={() => {
          localStorage.removeItem('tik_reels_history_v1');
          reloadSavedItems();
        }}
        onBookmarkChange={reloadSavedItems}
      />

      {/* Mobile Bottom Navigation Bar (Batches, Live, Telegram, Favourites ♥️, Profile) */}
      <BottomNav
        currentView={view}
        onViewChange={v => {
          setView(v);
          if (v === 'browser') {
            setBatchFilterGroup('all');
            setSelectedCourse(null);
            setCurrentPath([]);
            setActiveLeafFolder(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFavorites={() => {
          setView('browser');
          setBatchFilterGroup('favorites');
          setSelectedCourse(null);
          setCurrentPath([]);
          setActiveLeafFolder(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isFavoritesActive={view === 'browser' && !selectedCourse && batchFilterGroup === 'favorites'}
        favoritesCount={favoriteBatchIds.length}
        onOpenBookmarks={() => {
          setBookmarksTab('bookmarks');
          setIsBookmarksOpen(true);
        }}
        onOpenProfile={() => {
          if (user) {
            setIsProfileModalOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        bookmarksCount={bookmarks.length}
        user={user}
      />

      {/* TargetBoard Official Login Modal */}
      <TargetBoardLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={newUser => {
          setUser(newUser);
        }}
        isMandatory={false}
      />

      {/* TargetBoard User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={() => {
          authService.logout();
          setUser(null);
        }}
        onSwitchAccount={() => {
          setIsProfileModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        bookmarksCount={bookmarks.length}
        historyCount={history.length}
        favoriteBatchesCount={favoriteBatchIds.length}
        onOpenFavorites={() => {
          setView('browser');
          setBatchFilterGroup('favorites');
          setSelectedCourse(null);
          setCurrentPath([]);
          setActiveLeafFolder(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}
