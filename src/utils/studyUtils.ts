import { StudyData, HistoryItem, BookmarkItem, StudyNote, VideoItem } from '../types/study';

const K = [0x4b, 0x72, 0x1a, 0x5e, 0x33, 0x6d, 0x0f, 0x41, 0x28, 0x59];

/**
 * Encodes asset ID using TargetBoard's XOR cipher with timestamp prefix
 */
export function encodeAssetId(id: string): string {
  if (!id) return '';
  const payload = Date.now().toString(36) + '.' + id;
  const bytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    bytes.push(payload.charCodeAt(i) ^ K[i % K.length]);
  }
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generates TargetBoard video player embed URL
 */
export function getPlayerUrl(assetId: string): string {
  return `https://targetboard.co.in/dashboard/video?v=${encodeURIComponent(encodeAssetId(assetId))}`;
}

/**
 * Asynchronously loads the STUDY dataset
 */
export async function loadStudyData(): Promise<StudyData | null> {
  const win = window as unknown as { STUDY?: StudyData };
  if (win.STUDY && win.STUDY.courses && win.STUDY.courses.length > 0) {
    return win.STUDY;
  }

  // If not yet evaluated, load or fetch
  try {
    const res = await fetch('/study-data.js');
    const text = await res.text();
    const jsonStr = text.replace(/^window\.STUDY\s*=\s*/, '').replace(/;?\s*$/, '');
    const data = JSON.parse(jsonStr) as StudyData;
    win.STUDY = data;
    return data;
  } catch (err) {
    console.error('Failed to load study data:', err);
    return null;
  }
}

// Local Storage Keys
const HISTORY_KEY = 'tik_reels_history_v1';
const BOOKMARKS_KEY = 'tik_reels_bookmarks_v1';
const NOTES_KEY = 'tik_reels_notes_v1';
const LIKES_KEY = 'tik_reels_likes_v1';
const REELS_COMMENTS_KEY = 'tik_reels_comments_v1';
const FAVORITE_BATCHES_KEY = 'tb_favorite_batches_v1';

export function getFavoriteBatches(): string[] {
  try {
    const item = localStorage.getItem(FAVORITE_BATCHES_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteBatch(courseId: string): boolean {
  try {
    const list = getFavoriteBatches();
    const exists = list.includes(courseId);
    let updated: string[];
    if (exists) {
      updated = list.filter(id => id !== courseId);
    } else {
      updated = [courseId, ...list];
    }
    localStorage.setItem(FAVORITE_BATCHES_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

export function isFavoriteBatch(courseId: string): boolean {
  return getFavoriteBatches().includes(courseId);
}

export function getHistory(): HistoryItem[] {
  try {
    const item = localStorage.getItem(HISTORY_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryItem): void {
  try {
    const list = getHistory().filter(h => h.asset !== entry.asset || h.title !== entry.title);
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 40)));
  } catch (err) {
    console.error('Failed to save history', err);
  }
}

export function getBookmarks(): BookmarkItem[] {
  try {
    const item = localStorage.getItem(BOOKMARKS_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(item: BookmarkItem): boolean {
  try {
    const list = getBookmarks();
    const exists = list.some(b => b.id === item.id);
    let updated: BookmarkItem[];
    if (exists) {
      updated = list.filter(b => b.id !== item.id);
    } else {
      updated = [item, ...list];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().some(b => b.id === id);
}

export function getNotes(): Record<string, StudyNote> {
  try {
    const item = localStorage.getItem(NOTES_KEY);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
}

export function saveNote(note: StudyNote): void {
  try {
    const notes = getNotes();
    notes[note.id] = note;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save note', err);
  }
}

export function deleteNote(id: string): void {
  try {
    const notes = getNotes();
    delete notes[id];
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to delete note', err);
  }
}

// Reel Likes
export function getLikedReels(): Record<string, boolean> {
  try {
    const item = localStorage.getItem(LIKES_KEY);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
}

export function toggleReelLike(asset: string): boolean {
  try {
    const likes = getLikedReels();
    const current = !!likes[asset];
    if (current) {
      delete likes[asset];
    } else {
      likes[asset] = true;
    }
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    return !current;
  } catch {
    return false;
  }
}

// Reel Comments
export interface ReelComment {
  id: string;
  author: string;
  text: string;
  timeAgo: string;
}

export function getReelComments(asset: string): ReelComment[] {
  try {
    const all = JSON.parse(localStorage.getItem(REELS_COMMENTS_KEY) || '{}');
    const defaultComments: ReelComment[] = [
      { id: 'c1', author: 'Aman Kumar', text: 'Sir is concept ko bhut ache se explain kiya aapne! 🔥', timeAgo: '2h ago' },
      { id: 'c2', author: 'Pooja Sharma', text: 'Board exam ke liye bahut imp topic hai ye!', timeAgo: '5h ago' },
    ];
    return all[asset] || defaultComments;
  } catch {
    return [];
  }
}

export function addReelComment(asset: string, text: string, author = 'Student'): ReelComment[] {
  try {
    const all = JSON.parse(localStorage.getItem(REELS_COMMENTS_KEY) || '{}');
    const list: ReelComment[] = all[asset] || [
      { id: 'c1', author: 'Aman Kumar', text: 'Sir is concept ko bhut ache se explain kiya aapne! 🔥', timeAgo: '2h ago' },
      { id: 'c2', author: 'Pooja Sharma', text: 'Board exam ke liye bahut imp topic hai ye!', timeAgo: '5h ago' },
    ];
    const newComment: ReelComment = {
      id: Date.now().toString(36),
      author,
      text,
      timeAgo: 'Just now',
    };
    list.unshift(newComment);
    all[asset] = list;
    localStorage.setItem(REELS_COMMENTS_KEY, JSON.stringify(all));
    return list;
  } catch {
    return [];
  }
}

/**
 * Flattens catalog items for search and reels
 */
export interface FlatItem {
  courseId: string;
  courseName: string;
  folderId: string;
  folderName: string;
  type: 'video' | 'pdf' | 'test';
  title: string;
  asset?: string;
}

export function extractAllVideos(studyData: StudyData): FlatItem[] {
  const result: FlatItem[] = [];
  const courseMap = new Map(studyData.courses.map(c => [c.id, c.name]));

  // Helper to map folder names
  const folderNames = new Map<string, string>();
  for (const courseId in studyData.trees) {
    const traverse = (nodes: any[]) => {
      for (const n of nodes) {
        folderNames.set(n.id, n.name);
        if (n.children && n.children.length > 0) {
          traverse(n.children);
        }
      }
    };
    traverse(studyData.trees[courseId] || []);
  }

  for (const courseId in studyData.catalogs) {
    const courseName = courseMap.get(courseId) || 'Course';
    const folders = studyData.catalogs[courseId];
    for (const folderId in folders) {
      const folderName = folderNames.get(folderId) || 'Chapter';
      const pack = folders[folderId];
      if (pack.videos) {
        for (const v of pack.videos) {
          if (v.asset) {
            result.push({
              courseId,
              courseName,
              folderId,
              folderName,
              type: 'video',
              title: v.title,
              asset: v.asset,
            });
          }
        }
      }
    }
  }
  return result;
}
