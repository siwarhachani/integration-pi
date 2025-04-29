export interface Comment {
  voteCount?: number;
  id?: number;
  content?: string;
  authorUsername?: string;
  authorId?: number;
  postId?: number;
  parentId?: number | null;
  createdAt?: string | null;
  updatedAt?: string;
  upvoteCount?: number;
  downvoteCount?: number;
  replies?: Comment[];
}
