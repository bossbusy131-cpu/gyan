import React from 'react';
import { Layers, Heart, Radio, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../services/authService';

interface BottomNavProps {
  currentView: 'browser' | 'reels' | 'live';
  onViewChange: (view: 'browser' | 'reels' | 'live') => void;
  onOpenFavorites: () => void;
  isFavoritesActive?: boolean;
  favoritesCount?: number;
  onOpenBookmarks: () => void;
  onOpenProfile: () => void;
  bookmarksCount: number;
  user: UserProfile | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenFavorites,
  isFavoritesActive = false,
  favoritesCount = 0,
  onOpenBookmarks,
  onOpenProfile,
  bookmarksCount,
  user,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 transition-colors shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-15 items-center px-1">
        
        {/* 1. Batches / Courses */}
        <button
          onClick={() => onViewChange('browser')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentView === 'browser'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className={`w-5 h-5 transition-transform ${currentView === 'browser' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Batches</span>
        </button>

        {/* 2. Live Broadcasts */}
        <button
          onClick={() => onViewChange('live')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
            currentView === 'live'
              ? 'text-red-600 dark:text-red-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Radio className={`w-5 h-5 transition-transform ${currentView === 'live' ? 'scale-110 text-red-600' : ''}`} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Live</span>
        </button>

        {/* 3. Telegram Channel */}
        <a
          href="https://t.me/nbi_2310"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 rounded-xl text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-all group active:scale-95"
          title="Join Official Telegram Channel (@nbi_2310)"
        >
          <div className="w-5 h-5 flex items-center justify-center text-[#0088cc] dark:text-[#29b6f6] group-hover:scale-110 transition-transform">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium text-sky-600 dark:text-sky-400">
            Telegram
          </span>
        </a>

        {/* 4. Favourites (Heart ♥️) */}
        <button
          onClick={onOpenFavorites}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-95 group ${
            isFavoritesActive
              ? 'text-rose-600 dark:text-rose-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Favourites"
        >
          <div className="relative">
            <Heart 
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isFavoritesActive || favoritesCount > 0
                  ? 'fill-rose-500 text-rose-500' 
                  : 'text-slate-500 dark:text-slate-400'
              } ${isFavoritesActive ? 'scale-110' : ''}`} 
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isFavoritesActive ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}>
            Favourites
          </span>
        </button>

        {/* 5. User Profile */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 relative"
          title="TargetBoard Student Profile"
        >
          {user ? (
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {user.fullName?.charAt(0) || 'S'}
            </div>
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          {bookmarksCount > 0 && (
            <span className="absolute top-1 right-2 min-w-3.5 h-3.5 px-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {bookmarksCount > 9 ? '9+' : bookmarksCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[48px]">
            {user ? 'Profile' : 'Login'}
          </span>
        </button>

      </div>
    </nav>
  );
};
