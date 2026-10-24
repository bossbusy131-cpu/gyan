export interface Course {
  id: string;
  name: string;
  group: string; // '12th' | '10th' | '11th' | '9th' | 'exam'
  enrollments: number;
}

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  parent?: string | null;
}

export interface VideoItem {
  title: string;
  asset: string;
  duration?: string;
}

export interface PdfItem {
  title: string;
  url?: string;
  fileName?: string;
}

export interface TestItem {
  title: string;
  url?: string;
  questionsCount?: number;
}

export interface CatalogFolder {
  videos?: VideoItem[];
  pdfs?: PdfItem[];
  tests?: TestItem[];
}

export interface StudyData {
  courses: Course[];
  trees: Record<string, TreeNode[]>;
  catalogs: Record<string, Record<string, CatalogFolder>>;
}

export interface HistoryItem {
  asset?: string;
  title: string;
  courseId: string;
  courseName: string;
  folderId: string;
  folderName: string;
  timestamp: number;
}

export interface BookmarkItem {
  id: string;
  type: 'video' | 'pdf' | 'test';
  title: string;
  asset?: string;
  courseId: string;
  courseName: string;
  folderId: string;
  folderName: string;
  savedAt: number;
}

export interface StudyNote {
  id: string;
  asset?: string;
  title: string;
  courseName: string;
  content: string;
  updatedAt: number;
}
