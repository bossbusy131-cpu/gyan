import React, { useState, useMemo } from 'react';
import { Course, TreeNode } from '../types/study';
import { 
  ArrowLeft, 
  Folder, 
  BookOpen, 
  ChevronRight, 
  Search, 
  PlayCircle,
  FolderOpen,
  Heart
} from 'lucide-react';

interface FolderTreeProps {
  course: Course;
  nodes: TreeNode[];
  currentPath: string[];
  nodeMap: Record<string, TreeNode>;
  onNavigateNode: (node: TreeNode) => void;
  onNavigateBreadcrumb: (index: number) => void;
  onBackToCourses: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  course,
  nodes,
  currentPath,
  nodeMap,
  onNavigateNode,
  onNavigateBreadcrumb,
  onBackToCourses,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Determine current children to show
  const currentNode = currentPath.length > 0 ? nodeMap[currentPath[currentPath.length - 1]] : null;
  const currentChildren = currentNode ? (currentNode.children || []) : nodes;

  const filteredChildren = useMemo(() => {
    if (!searchQuery.trim()) return currentChildren;
    const query = searchQuery.toLowerCase().trim();
    return currentChildren.filter(child => child.name.toLowerCase().includes(query));
  }, [currentChildren, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Navigation Header & Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentPath.length > 0) {
                onNavigateBreadcrumb(currentPath.length - 2);
              } else {
                onBackToCourses();
              }
            }}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
              <button
                onClick={onBackToCourses}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                All Batches
              </button>
              <span>/</span>
              <button
                onClick={() => onNavigateBreadcrumb(-1)}
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                  currentPath.length === 0 ? 'font-semibold text-slate-900 dark:text-white' : ''
                }`}
              >
                {course.name}
              </button>
              {currentPath.map((id, index) => {
                const node = nodeMap[id];
                const isLast = index === currentPath.length - 1;
                return (
                  <React.Fragment key={id}>
                    <span>/</span>
                    <button
                      onClick={() => onNavigateBreadcrumb(index)}
                      className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[200px] ${
                        isLast ? 'font-semibold text-slate-900 dark:text-white' : ''
                      }`}
                    >
                      {node ? node.name : 'Folder'}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate mt-0.5">
              {currentNode ? currentNode.name : course.name}
            </h2>
          </div>

          {/* Favourite Batch button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/50 text-rose-500 scale-105 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
              title={isFavorite ? 'Remove Batch from Favourites' : 'Add Batch to Favourites'}
              aria-label={isFavorite ? 'Remove Batch from Favourites' : 'Add Batch to Favourites'}
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Sub-search inside folder */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search folders or chapters in this section..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Children list */}
      <div className="space-y-2.5">
        {filteredChildren.map(child => {
          const hasChildren = child.children && child.children.length > 0;
          return (
            <button
              key={child.id}
              onClick={() => onNavigateNode(child)}
              className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 group transition-all duration-150 hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    hasChildren
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100'
                  }`}
                >
                  {hasChildren ? (
                    <Folder className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {child.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>
                      {hasChildren
                        ? `${child.children?.length} sub-sections`
                        : 'Open chapter materials'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0">
                <span className="text-xs font-medium hidden sm:inline">
                  {hasChildren ? 'Open Folder' : 'View Content'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}

        {filteredChildren.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No matching items found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Check spelling or clear the search filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
