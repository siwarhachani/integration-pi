import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CommentComponent } from "../comment/comment.component";
import { AfterViewInit } from '@angular/core';
import { Post } from 'src/app/models/posts/post.interface';
import { CommentService } from 'src/app/services/posts/comment.service';
import { PostService } from 'src/app/services/posts/post.service';
import { AuthService } from 'src/app/services/user/auth.service';
import { VoteDTO } from 'src/app/models/posts/vote.dto'; // Import VoteType enum
declare var bootstrap: any; // Add this if you’re not using types for Bootstrap

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

@Component({
  selector: 'app-post-modal',
  templateUrl: './post-modal.component.html',
  styleUrls: ['./post-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CommentComponent, NgOptimizedImage],
})
export class PostModalComponent implements OnInit {
  @Input() post!: Post;
  @Output() close = new EventEmitter<void>();
  comments: CommentWithReplies[] = [];
  newCommentForm: FormGroup;
  replyForms: { [commentId: number]: FormGroup } = {};
  showReplyInput: { [commentId: number]: boolean } = {};
  userRole: string | null = null;
  username: string | null = null;

  constructor(private commentService: CommentService, private fb: FormBuilder, private authService: AuthService, private postService: PostService) {
    this.newCommentForm = this.fb.group({
      text: ['', Validators.required],
    });
    this.userRole = this.authService.getRole();
    this.username = this.authService.getCurrentUserUsername();
  }

  ngOnInit(): void {
    this.fetchVoteStatus();
  }

  onClose() {
    this.close.emit();
  }

  showReply(commentId: number) {
    this.showReplyInput[commentId] = !this.showReplyInput[commentId];
    if (!this.replyForms[commentId]) {
      this.replyForms[commentId] = this.fb.group({
        text: ['', Validators.required],
      });
    }
  }

  canEditOrDelete(post: Post): boolean {
    return this.userRole === 'ADMIN' || post.authorUsername === this.username;
  }

  ngAfterViewInit() {
    const toastEl = document.getElementById('copyToast');
    if (toastEl) {
      this.toast = new bootstrap.Toast(toastEl);
    }
  }

  toast: any;

  copyLink(postId: number) {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toast?.show();
    });
  }

  scrollToCommentSection() {
    const el = document.getElementById('comment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleVote(voteType: 'UPVOTE' | 'DOWNVOTE') {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('You must be logged in to vote.');
      return;
    }

    const currentVote = this.post.userVote;
    let newVote: 'UPVOTE' | 'DOWNVOTE' | null = voteType;

    if (currentVote === voteType) {
      newVote = null;
    }

    if (voteType === 'UPVOTE') {
      this.post.upvoteCount = (this.post.upvoteCount || 0) + (newVote === 'UPVOTE' ? 1 : (currentVote === 'UPVOTE' ? -1 : 0));
      if (currentVote === 'DOWNVOTE') {
        this.post.downvoteCount = (this.post.downvoteCount || 0) - 1;
      }
    } else {
      this.post.downvoteCount = (this.post.downvoteCount || 0) + (newVote === 'DOWNVOTE' ? 1 : (currentVote === 'DOWNVOTE' ? -1 : 0));
      if (currentVote === 'UPVOTE') {
        this.post.upvoteCount = (this.post.upvoteCount || 0) - 1;
      }
    }

    this.post.userVote = newVote;

    this.postService.votePost(this.post.id, voteType).subscribe({
      next: () => {
        this.fetchVoteStatus();
      },
      error: (err) => {
        console.error('Vote failed:', err);
        this.fetchVoteStatus();
        alert('Failed to update vote. Please try again.');
      }
    });
  }

  fetchVoteStatus() {
    this.postService.getPostVoteStatus(this.post.id).subscribe({
      next: (voteStatus) => {
        this.post.userVote = voteStatus;
      },
      error: (err) => {
        console.error('Failed to fetch vote status for post', this.post.id, err);
        this.post.userVote = null;
      }
    });
  }
  deletePost(id: number) {
    const token = localStorage.getItem('jwtToken');
    this.postService.deletePost(id, token!).subscribe(() => this.close.emit());
  }

}
