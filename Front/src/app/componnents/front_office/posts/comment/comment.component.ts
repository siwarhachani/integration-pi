import { Component, Input, OnInit } from '@angular/core';
import { Comment } from 'src/app/models/posts/comment.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import {RouterLink} from "@angular/router";
import { Post } from 'src/app/models/posts/post.interface';
import { CommentService } from 'src/app/services/posts/comment.service';
import { PostService } from 'src/app/services/posts/post.service';
import { AuthService } from 'src/app/services/user/auth.service';

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  upvoteCount?: number;
  downvoteCount?: number;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
})
export class CommentComponent implements OnInit {
  suggestions: string[] = [];
  isLoadingSuggestions = false;

  @Input() postId!: number;
  comments: CommentWithReplies[] = [];
  newCommentForm: FormGroup;
  replyForms: { [commentId: number]: FormGroup } = {};
  showReplyInput: { [commentId: number]: boolean } = {};
  userRole: string | null = null;
  username: string | null = null;
  post!: Post;
  @Input() articleText!: string;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private postService: PostService,
    private http: HttpClient
  ) {
    this.userRole = this.authService.getRole();
    this.username = this.authService.getCurrentUserUsername();
    this.newCommentForm = this.fb.group({
      text: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadComments();
    this.loadPost();
    this.fetchCommentSuggestions(this.articleText);
  }

  stripHtmlTagsAndSanitize(html: string, maxWords: number = 100): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = div.textContent || div.innerText || '';
    text = text.replace(/https?:\/\/\S+/g, '');
    text = text.replace(/@\w+/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    const words = text.split(' ');
    if (words.length > maxWords) {
      text = words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  }

  fetchCommentSuggestions(article: string) {
    this.isLoadingSuggestions = true;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams().set('key', 'AIzaSyAE_uDXOB4nPMnSFTGEwm_UdoEzatJQLNg');
    const plainTextArticle = this.stripHtmlTagsAndSanitize(article);
    const body = {
      contents: [
        {
          parts: [
            {
              text: `Suggest 3 insightful, short comments a user might leave on this article reponse in 3 very short comments seperate each comment with ; use emojis in only one comment 3 to 5 words Direct response please just 3 comments seperated by ";" DIRECT OUTPUT PLEASE example: Comment1;Comment2;Comment3 don't tell me things like  :\n\n${plainTextArticle}`
            }
          ]
        }
      ]
    };

    this.http
      .post<any>(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        body,
        { headers, params }
      )
      .subscribe({
        next: (res) => {
          const rawText = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          this.suggestions = this.extractSuggestions(rawText);
          this.isLoadingSuggestions = false;
        },
        error: (err) => {
          console.error('Failed to fetch suggestions', err);
          this.isLoadingSuggestions = false;
        }
      });
  }

  extractSuggestions(response: string): string[] {
    return response
      .split(';')
      .map((comment) => comment.trim())
      .filter((comment) => comment.length > 0);
  }

  useSuggestion(comment: string) {
    const textarea = document.getElementById('comment-box') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = comment;
    }
  }

  async addComment() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return alert('You must be logged in to add a comment.');

    if (this.newCommentForm.valid) {
      const rawText = this.newCommentForm.value.text;
      const sanitized = await this.censorBadWords(rawText);

      this.commentService
        .createComment({ postId: this.postId, text: sanitized, parentId: null }, token)
        .subscribe(() => {
          this.loadComments();
          this.newCommentForm.reset();
        });
    }
  }

  async addReply(parentCommentId: number) {
    const token = localStorage.getItem('jwtToken');
    if (!token) return alert('You must be logged in to reply.');

    if (this.replyForms[parentCommentId].valid) {
      const rawText = this.replyForms[parentCommentId].value.text;
      const sanitized = await this.censorBadWords(rawText);

      this.commentService
        .createComment(
          { postId: this.postId, text: sanitized, parentId: parentCommentId },
          token
        )
        .subscribe(() => {
          this.loadComments();
          this.replyForms[parentCommentId].reset();
          this.showReplyInput[parentCommentId] = false;
        });
    }
  }

  async censorBadWords(content: string): Promise<string> {
    const url = 'https://neutrinoapi-bad-word-filter.p.rapidapi.com/bad-word-filter';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-rapidapi-key': '8433d15735msh2702a52a05e99bdp1e7f6djsn60b6c77343ce',
      'x-rapidapi-host': 'neutrinoapi-bad-word-filter.p.rapidapi.com',
    });

    const body = new URLSearchParams();
    body.set('content', content);
    body.set('censor-character', '*');

    try {
      const res = await this.http.post<any>(url, body, { headers }).toPromise();
      return res?.['censored-content'] ?? content;
    } catch (error) {
      console.error('Bad word filter failed:', error);
      return content;
    }
  }

  loadComments() {
    this.commentService.getCommentsByPostId(this.postId).subscribe((comments: CommentWithReplies[]) => {
      this.comments = comments;
      this.fetchVoteStatusesForAll();
    });
  }

  fetchVoteStatusesForAll() {
    this.comments.forEach(comment => {
      this.fetchVoteStatus(comment);
      if (comment.replies) {
        comment.replies.forEach(reply => this.fetchVoteStatus(reply));
      }
    });
  }

  fetchVoteStatus(comment: CommentWithReplies) {
    this.commentService.getCommentVoteStatus(comment.id!).subscribe({
      next: (voteStatus) => {
        comment.userVote = voteStatus;
      },
      error: (err) => {
        console.error('Failed to fetch vote status for comment', comment.id, err);
        comment.userVote = null;
      }
    });
  }

  deleteComment(commentId: number) {
    const token = localStorage.getItem('jwtToken');
    if (!token) return alert('You must be logged in to delete a comment.');

    this.commentService.deleteComment(commentId, token).subscribe(() => {
      this.loadComments();
    });
  }

  showReply(commentId: number) {
    this.showReplyInput[commentId] = !this.showReplyInput[commentId];
    if (!this.replyForms[commentId]) {
      this.replyForms[commentId] = this.fb.group({
        text: ['', Validators.required],
      });
    }
  }

  canEditOrDelete(comment: CommentWithReplies): boolean {
    return this.userRole === 'ADMIN' || comment.authorUsername === this.username;
  }

  voteOnComment(comment: CommentWithReplies, voteType: 'UPVOTE' | 'DOWNVOTE') {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('You must be logged in to vote.');
      return;
    }

    const currentVote = comment.userVote;
    let newVote: 'UPVOTE' | 'DOWNVOTE' | null = voteType;

    if (currentVote === voteType) {
      newVote = null;
    }

    if (voteType === 'UPVOTE') {
      comment.upvoteCount = (comment.upvoteCount || 0) + (newVote === 'UPVOTE' ? 1 : (currentVote === 'UPVOTE' ? -1 : 0));
      if (currentVote === 'DOWNVOTE') {
        comment.downvoteCount = (comment.downvoteCount || 0) - 1;
      }
    } else {
      comment.downvoteCount = (comment.downvoteCount || 0) + (newVote === 'DOWNVOTE' ? 1 : (currentVote === 'DOWNVOTE' ? -1 : 0));
      if (currentVote === 'UPVOTE') {
        comment.upvoteCount = (comment.upvoteCount || 0) - 1;
      }
    }

    comment.userVote = newVote;

    this.commentService.voteComment(comment.id!, voteType).subscribe({
      next: () => {
        this.fetchVoteStatus(comment);
      },
      error: (err) => {
        console.error('Vote failed:', err);
        comment.userVote = currentVote;
        this.loadComments();
        alert('Failed to update vote. Please try again.');
      }
    });
  }

  getVoteCount(comment: CommentWithReplies): number {
    return (comment.upvoteCount || 0) - (comment.downvoteCount || 0);
  }

  loadPost() {
    this.postService.getPost(this.postId).subscribe({
      next: (post) => {
        this.post = post;
      },
      error: (err) => {
        console.error('Failed to load post:', err);
      }
    });
  }
}
