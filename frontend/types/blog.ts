export interface Comment {
  name: string;
  comment: string;
  createdAt: string;
}

export type BlogCategory =
  | "NEPSE News"
  | "Technical Analysis"
  | "IPO Updates"
  | "Vehicles & Tech";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  mainImage: string; // URL string
  secondaryImages: string[]; // Supports 3-4 additional images
  content: string; // Rich text / Markdown support
  category: BlogCategory;
  likes: number; // defaults to 0
  comments: Comment[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string; // Comma-separated
  createdAt: string;
  updatedAt: string;
}
