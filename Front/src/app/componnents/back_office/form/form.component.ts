import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { Comment } from 'src/app/models/posts/comment.interface'; // Assuming correct import here now

import { Post } from 'src/app/models/posts/post.interface';     // Assuming correct import here now
import { CommentService } from 'src/app/services/posts/comment.service';
import { PostService } from 'src/app/services/posts/post.service';

declare const Chart: any;

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    NgChartsModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  posts: Post[] = [];
  comments: Comment[] = [];
  paginatedPosts: Post[] = [];
  paginatedComments: Comment[] = [];

  postsPerPage = 5;
  commentsPerPage = 5;
  postPage = 0;
  commentPage = 0;

  postsPages: number[] = [];
  commentsPages: number[] = [];

  chartInstances: { [key: string]: any } = {};

  constructor(
    private postService: PostService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadComments();
  }

  loadPosts() {
    this.postService.getPosts().subscribe(data => {
      this.posts = data;
      this.paginatePosts();
      // Call with 'this.posts' should now work if Post interface is similar
      this.generateChart('postsChart', this.getCountPerDay(this.posts, 7));
    });
  }

  loadComments() {
    this.commentService.getAllComments().subscribe(data => {
       // Assuming the import issue in CommentService is fixed, 'data' should be Comment[]
      this.comments = data.map(comment => ({
        ...comment,
        // This fallback ensures createdAt is a string before passing to getCountPerDay if needed,
        // but getCountPerDay can now handle null/undefined directly.
        // You might keep this map or remove it depending on if you want '1970-01-01'
        // stored in this.comments or just handled within getCountPerDay.
        // For simplicity with the fixed getCountPerDay, you could potentially just do:
        // this.comments = data;
        createdAt: comment.createdAt || '1970-01-01'
      }));
      this.paginateComments();
       // Call with 'this.comments' should now work
      this.generateChart('commentsChart', this.getCountPerDay(this.comments, 7));
    });
  }

  paginatePosts() {
    const totalPages = Math.ceil(this.posts.length / this.postsPerPage);
    this.postsPages = Array(totalPages).fill(0).map((_, i) => i);
    this.paginatedPosts = this.posts.slice(
      this.postPage * this.postsPerPage,
      (this.postPage + 1) * this.postsPerPage
    );
  }

  paginateComments() {
    const totalPages = Math.ceil(this.comments.length / this.commentsPerPage);
    this.commentsPages = Array(totalPages).fill(0).map((_, i) => i);
    this.paginatedComments = this.comments.slice(
      this.commentPage * this.commentsPerPage,
      (this.commentPage + 1) * this.commentsPerPage
    );
  }

  changePostPage(page: number) {
    this.postPage = page;
    this.paginatePosts();
  }

  changeCommentPage(page: number) {
    this.commentPage = page;
    this.paginateComments();
  }

  deletePost(id: number) {
    const token = localStorage.getItem('jwtToken');
    this.postService.deletePost(id, token!).subscribe(() => this.loadPosts());
  }

  deleteComment(id: number) {
    const token = localStorage.getItem('jwtToken');
    this.commentService.deleteComment(id, token!).subscribe(() => this.loadComments());
  }

  // ***** FIXED FUNCTION SIGNATURE *****
  getCountPerDay(items: { createdAt?: string | null }[], days: number): { [key: string]: number } {
    const result: { [key: string]: number } = {};
    const today = new Date(); // Uses current date: April 29, 2025

    // Initialize the result for the last 'days' days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0]; // Format YYYY-MM-DD
      result[key] = 0;
    }

    // Iterate over items and count by date
    items.forEach(item => {
      // Safely access createdAt using optional chaining (?.)
      // and provide a default date using nullish coalescing (??)
      const date = item.createdAt?.split('T')[0] ?? '1970-01-01';
      // Check if the date falls within our initialized keys before incrementing
      if (result[date] !== undefined) {
           result[date]++;
      }
    });

    return result;
  }
  // ***** END OF FIXED FUNCTION *****

  generateChart(id: string, data: { [date: string]: number }) {
    if (this.chartInstances[id]) {
      this.chartInstances[id].destroy();
    }

    const ctx = document.getElementById(id) as HTMLCanvasElement;
    if (!ctx) {
        console.error(`Canvas element with id '${id}' not found.`);
        return; // Avoid creating chart if canvas doesn't exist
    }
    this.chartInstances[id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: id.includes('posts') ? 'Posts' : 'Comments',
          data: Object.values(data),
          fill: false,
          borderColor: id.includes('posts') ? '#007bff' : '#28a745',
          tension: 0.2
        }]
      }
    });
  }

  onRangeChange(range: string): void {
    let days: number;
    switch (range) {
      case '7days':
        days = 7;
        break;
      case '1month':
        days = 30;
        break;
      case '3months':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
      default:
        days = 7;
    }

    // These calls should now work correctly
    this.generateChart('postsChart', this.getCountPerDay(this.posts, days));
    this.generateChart('commentsChart', this.getCountPerDay(this.comments, days));
  }
}