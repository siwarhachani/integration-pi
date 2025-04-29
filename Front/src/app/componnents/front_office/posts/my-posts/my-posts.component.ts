import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Post } from 'src/app/models/posts/post.interface';
import { PostService } from 'src/app/services/posts/post.service';

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    
  ],
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.css']
})
export class MyPostsComponent implements OnInit {
  posts: Post[] = [];

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    this.postService.getMyPosts(token).subscribe({
      next: (data) => this.posts = data,
      error: (err) => console.error('Failed to load posts', err)
    });
  }

  viewPost(id: number) {
    this.router.navigate(['/post', id]);
  }
}
