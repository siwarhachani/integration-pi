export interface Notification {
  notificationType: 'POST_UPVOTE'| 'POST_DOWNVOTE' | 'COMMENT_REPLY' | 'NEW_COMMENT';
  eventTimestamp: string;
  triggeringUsername: string;
  relatedPostId: number;
  relatedPostTitle: string;
  relatedCommentId: number | null;
  itemContentSnippet: string | null;
}
