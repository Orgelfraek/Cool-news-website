export interface Article {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  category: string;
  tags: string[];
  excerpt: string;
  imageUrl: string;
}

export interface Comment {
  id?: string;
  articleId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
}