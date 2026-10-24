import React, { useState, useMemo } from 'react';
import { Course } from '../types/study';
import { Search, Users, ChevronRight, BookOpen, GraduationCap, Flame, Heart } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onOpenReelsForGroup?: (group: string) => void;
  favoriteBatchIds?: string[];
  onToggleFavoriteBatch?: (courseId: string) => void;
  filterGroup?: string;
  onFilterGroupChange?: (group: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  onSelectCourse,
  favoriteBatchIds = [],
  onToggleFavoriteBatch,
  filterGroup: externalFilterGroup,
  onFilterGroupChange,
}) => {
  const [internalFilterGroup, setInternalFilterGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeFilterGroup = externalFilterGroup !== undefined ? externalFilterGroup : internalFilterGroup;
  const setFilterGroup = (grp: string) => {
    if (onFilterGroupChange) {
      onFilterGroupChange(grp);
    } else {
      setInternalFilterGroup(grp);
    }
  };

  const groups = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => set.add(c.group));
    return Array.from(set);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      let matchesGroup = true;
      if (activeFilterGroup === 'favorites') {
        matchesGroup = favoriteBatchIds.includes(course.id);
      } else if (activeFilterGroup !== 'all') {
        matchesGroup = course.group === activeFilterGroup;
      }

      const matchesSearch =
        !searchQuery.trim() ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesGroup && matchesSearch;
    });
  }, [courses, activeFilterGroup, favoriteBatchIds, searchQuery]);

  const formatEnrollments = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
  };

  const getGroupBadgeColor = (group: string) => {
    switch (group) {
      case '12th':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
      case '11th':
        return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800';
      case '10th':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case '9th':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      default:
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            GyanSarthi · TargetBoard 2026-27
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            TargetBoard Batches & Video Lectures
          </h1>
          <p className="mt-2 text-sm md:text-base text-blue-100/90 leading-relaxed">
            Access 29 comprehensive batches covering Class 9th, 10th, 11th, 12th Board Exams, CUET, and Crash Courses with instant video lessons, panel notes & revision reels.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-blue-200">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-white" />
              <span>29 Live Batches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-white" />
              <span>100,000+ Enrolled Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-white" />
              <span>11,600+ Lectures</span>
            </div>
          </div>
        </div>
        
        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* All Batches */}
          <button
            onClick={() => setFilterGroup('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeFilterGroup === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            All Batches ({courses.length})
          </button>

          {/* Favourites Tab */}
          <button
            onClick={() => setFilterGroup('favorites')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilterGroup === 'favorites'
                ? 'bg-rose-600 text-white shadow-sm font-semibold'
                : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeFilterGroup === 'favorites' || favoriteBatchIds.length > 0 ? 'fill-current' : ''}`} />
            <span>Favourites ({favoriteBatchIds.length})</span>
          </button>

          {groups.map(group => {
            const count = courses.filter(c => c.group === group).length;
            const label = group === 'exam' ? 'CUET / Exam' : `Class ${group}`;
            return (
              <button
                key={group}
                onClick={() => setFilterGroup(group)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilterGroup === group
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter batch by name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => {
          const isFav = favoriteBatchIds.includes(course.id);

          return (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-500/80 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getGroupBadgeColor(
                      course.group
                    )}`}
                  >
                    {course.group === 'exam' ? 'Competitive / Exam' : `Class ${course.group}`}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{formatEnrollments(course.enrollments)}</span>
                    </div>

                    {/* Heart Favourite Button on Batch Card */}
                    {onToggleFavoriteBatch && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoriteBatch(course.id);
                        }}
                        className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                          isFav
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 scale-105'
                            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        }`}
                        title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                        aria-label={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                      >
                        <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {course.name}
                </h2>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Subjects & Chapters
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Batch</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {activeFilterGroup === 'favorites' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Koi favourite batch nahi hai
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Kisi bhi batch card par bane heart ♥️ icon par tap karke use apne favourites me add karein.
              </p>
              <button
                onClick={() => setFilterGroup('all')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              >
                Sabhi Batches Dekhein ({courses.length})
              </button>
            </>
          ) : (
            <>
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No batches found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search query or group filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterGroup('all');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
