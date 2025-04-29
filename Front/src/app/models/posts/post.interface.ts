export interface Post {
  id: number;
  title: string;
  content: string;
  authorUsername: string;
  authorId: number;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: string;
  updatedAt: string;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  commentCount: number;

}
