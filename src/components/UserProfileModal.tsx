import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  BookOpen, 
  Bookmark, 
  History,
  Sparkles,
  ExternalLink,
  Heart
} from 'lucide-react';
import { UserProfile } from '../services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  onSwitchAccount: () => void;
  bookmarksCount: number;
  historyCount: number;
  favoriteBatchesCount?: number;
  onOpenFavorites?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onSwitchAccount,
  bookmarksCount,
  historyCount,
  favoriteBatchesCount = 0,
  onOpenFavorites,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col my-auto space-y-5">
        
        {/* Header Close */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TargetBoard Profile</span>
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/25">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white truncate">
                {user?.fullName || 'TargetBoard Student'}
              </h3>
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {user?.mobile ? `+91 ${user.mobile}` : 'TargetBoard User'}
            </p>

            <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Verified & Direct Play Active
            </span>
          </div>
        </div>

        {/* Enrolled Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>Current Class</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.className || 'Class 12th Board 2026-27'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Target Board</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
              {user?.stateBoard || 'Bihar Board (BSEB)'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
              {historyCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Lectures
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenFavorites) {
                onClose();
                onOpenFavorites();
              }
            }}
            className="bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-800 text-center transition-all cursor-pointer group"
          >
            <span className="text-base sm:text-lg font-bold text-rose-500 flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>{favoriteBatchesCount}</span>
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 mt-0.5 truncate font-medium">
              Favourites
            </p>
          </button>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="text-base sm:text-lg font-bold text-amber-500">
              {bookmarksCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Bookmarks
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onSwitchAccount();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Switch / Login with another number</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout from TargetBoard</span>
          </button>
        </div>

      </div>
    </div>
  );
};
