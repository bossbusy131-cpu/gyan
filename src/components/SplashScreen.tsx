import React, { useEffect, useState } from 'react';
import { GraduationCap, Sparkles, BookOpen, Heart } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  isLoadingData: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, isLoadingData }) => {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Smooth progress simulation from 0 to 100
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + step, 98);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // When progress reaches 100 and data is loaded, initiate exit animation
    if (progress >= 98 && !isLoadingData) {
      setProgress(100);
      const timer = setTimeout(() => {
        setFadingOut(true);
        const finishTimer = setTimeout(() => {
          onFinish();
        }, 600);
        return () => clearTimeout(finishTimer);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [progress, isLoadingData, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white select-none transition-all duration-700 ${
        fadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top decorative element */}
      <div className="pt-8 flex items-center gap-2 text-xs font-medium text-slate-400 tracking-widest uppercase">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>TargetBoard · 2026-27</span>
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
      </div>

      {/* Center Branding Content */}
      <div className="flex flex-col items-center text-center max-w-md w-full px-4 -mt-6">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          {/* Glowing pulse rings */}
          <div className="absolute -inset-4 rounded-3xl bg-blue-500/20 blur-xl animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 opacity-80" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
            <GraduationCap className="w-10 h-10 drop-shadow-md animate-bounce" />
          </div>
        </div>

        {/* Website Name: GyanSarthi */}
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-sky-300 bg-clip-text text-transparent">
          GyanSarthi
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
          Your Smart Study & Revision Companion
        </p>

        {/* Developer Credit Requested by User */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs sm:text-sm font-semibold shadow-lg">
          <span>Devloper</span>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse inline-block" />
          <span className="text-white font-bold tracking-wide">Mohammad Irfan</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-10 space-y-2">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 px-1 font-mono">
            <span>Loading courses & reels</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Credit */}
      <div className="pb-4 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>11,600+ Lectures</span>
          <span>·</span>
          <span>TargetBoard Prep</span>
          <span>·</span>
          <span>Tik-Reels</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Crafted with care by Mohammad Irfan
        </p>
      </div>
    </div>
  );
};
