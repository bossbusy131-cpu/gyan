export interface LectureComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  timeAgo?: string;
  userId?: string;
}

const COMMENTS_STORAGE_KEY = 'tb_lecture_comments_v1';

export function formatTimeAgo(timestamp: number, customTimeAgo?: string): string {
  if (customTimeAgo) return customTimeAgo;
  if (!timestamp) return 'Just now';

  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function getLocalCommentsMap(): Record<string, LectureComment[]> {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCommentsMap(map: Record<string, LectureComment[]>): void {
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save comments locally', e);
  }
}

// Default initial comments to match reference screenshot
const SEED_COMMENTS: LectureComment[] = [
  {
    id: 'cm_seed_1',
    author: 'shaheer',
    text: 'Hi',
    timestamp: Date.now() - 86400000,
    timeAgo: 'Yesterday',
  },
  {
    id: 'cm_seed_2',
    author: 'shaheer',
    text: 'Hello sir',
    timestamp: Date.now() - 28 * 60000,
    timeAgo: '28 minutes ago',
  },
];

export const commentService = {
  async getComments(lectureId: string): Promise<LectureComment[]> {
    const cleanId = (lectureId || 'default').trim();
    const localMap = getLocalCommentsMap();

    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.comments)) {
          let comments = data.comments;
          // If server comments are empty for this lecture, seed with default comments
          if (comments.length === 0) {
            comments = [...SEED_COMMENTS];
            localMap[cleanId] = comments;
            saveLocalCommentsMap(localMap);
          } else {
            localMap[cleanId] = comments;
            saveLocalCommentsMap(localMap);
          }
          return comments;
        }
      }
    } catch {
      // Offline or network error: use local storage fallback
    }

    if (localMap[cleanId] && localMap[cleanId].length > 0) {
      return localMap[cleanId];
    }

    // Default seed
    localMap[cleanId] = [...SEED_COMMENTS];
    saveLocalCommentsMap(localMap);
    return localMap[cleanId];
  },

  async addComment(
    lectureId: string,
    text: string,
    author: string,
    userId?: string
  ): Promise<LectureComment> {
    const cleanId = (lectureId || 'default').trim();
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Comment cannot be blank');
    }

    const newComment: LectureComment = {
      id: 'cm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      author: author.trim() || 'Student',
      text: trimmed,
      timestamp: Date.now(),
      timeAgo: 'Just now',
      userId,
    };

    // Update local storage immediately for responsive UX
    const localMap = getLocalCommentsMap();
    if (!localMap[cleanId]) {
      localMap[cleanId] = [...SEED_COMMENTS];
    }
    localMap[cleanId] = [newComment, ...localMap[cleanId]];
    saveLocalCommentsMap(localMap);

    // Persist to server API
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(cleanId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newComment.author,
          text: newComment.text,
          userId: newComment.userId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          return data.comment;
        }
      }
    } catch (e) {
      console.warn('API sync warning; comment stored in local persistence', e);
    }

    return newComment;
  },
};
