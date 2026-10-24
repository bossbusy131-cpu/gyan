import React from 'react';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  Maximize, 
  Minimize,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { UserProfile } from '../services/authService';

interface HeaderProps {
  onGoHome: () => void;
  onOpenLive: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  user: UserProfile | null;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenLive,
  theme,
  onToggleTheme,
  isFullscreen,
  onToggleFullscreen,
  user,
  onOpenProfile,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">
                GyanSarthi
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 shrink-0">
                Tik-Reels
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-none mt-0.5 hidden xs:block truncate">
              TargetBoard Learning & Revision
            </p>
          </div>
        </div>

        {/* Action icons: Live + Profile + Fullscreen + Theme */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Classes Button */}
          <button
            onClick={onOpenLive}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
            title="Watch TargetBoard Live Classes"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>Live</span>
          </button>

          {/* User Profile / Login Button */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 sm:pl-1 sm:pr-2.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
              title="View Student Profile"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user.fullName?.charAt(0) || 'S'}
              </div>
              <span className="hidden sm:inline truncate max-w-[80px]">
                {user.fullName}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
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

      </div>
    </header>
  );
};

