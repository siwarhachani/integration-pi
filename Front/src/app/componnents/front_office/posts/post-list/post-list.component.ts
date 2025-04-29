import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {Component, OnInit, ChangeDetectorRef, HostListener} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { Post } from 'src/app/models/posts/post.interface';
import { PostService } from 'src/app/services/posts/post.service';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';
import { PostModalComponent } from "../post-modal/post-modal.component";
import { AddPostComponent } from '../add-post/add-post.component';
import { NotificationsComponent } from '../../user/notifications/notifications.component';

declare var bootstrap: any;

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    NgChartsModule,
    PostModalComponent,
    AddPostComponent,
    NotificationsComponent
],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  selectedPost: Post | null = null;
  showModal: boolean = false;
  activeTab = 'Latest';
  searchTerm = '';
  page = 0; // Current page number
  pageSize = 4; // Number of posts to load per page
  allPostsLoaded = false; // Flag to indicate if all posts have been loaded
  loadingMore = false; // Flag to prevent multiple loadMore calls
  isMasonryLayout: boolean = false;

  constructor(private postService: PostService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.activeTab === 'Latest' && !this.allPostsLoaded && !this.loadingMore) {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.offsetHeight;
      const threshold = 200; // Adjust as needed (e.g., load when 200px from bottom)

      if (scrollPosition > documentHeight - threshold) {
        this.loadMorePosts();
      }
    }
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe(allPosts => {
      const startIndex = this.page * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const newPosts = allPosts.slice(startIndex, endIndex);

      if (this.page === 0) {
        this.posts = newPosts;
        this.filteredPosts = newPosts;
      } else {
        this.posts = [...this.posts, ...newPosts];
        this.filteredPosts = [...this.filteredPosts, ...newPosts];
      }

      newPosts.forEach(post => this.fetchVoteStatus(post));
      this.allPostsLoaded = allPosts.length <= this.posts.length;
      this.cdr.detectChanges();
    });
  }

  openPostModal(postId: number): void {
    this.postService.getPost(postId).subscribe(post => {
      this.selectedPost = post;
      this.showModal = true;
      this.cdr.detectChanges();
    });
  }

  closePostModal(): void {
    this.showModal = false;
    this.selectedPost = null;
    this.cdr.detectChanges();
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

  searchPosts(): void {
    if (!this.searchTerm) {
      this.filteredPosts = this.posts;
    } else {
      this.filteredPosts = this.posts.filter(post =>
        post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.cdr.detectChanges();
  }

  loadHotPosts(): void {
    this.postService.getHotPosts().subscribe((posts) => {
      this.posts = posts;
      this.filteredPosts = posts;
      this.posts.forEach(post => this.fetchVoteStatus(post));
      this.cdr.detectChanges();
    });
  }

  loadTopPosts(): void {
    this.postService.getTopPosts().subscribe((posts) => {
      this.posts = posts;
      this.filteredPosts = posts;
      this.posts.forEach(post => this.fetchVoteStatus(post));
      this.cdr.detectChanges();
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.page = 0; // Reset page when tab changes
    this.allPostsLoaded = false; // Reset loaded status
    this.searchTerm = ''; // Clear search term
    this.posts = []; // Clear existing posts
    this.filteredPosts = []; // Clear filtered posts
    if (tab === 'Latest') {
      this.loadPosts();
    } else if (tab === 'HOT') {
      this.loadHotPosts();
    } else if (tab === 'TOP') {
      this.loadTopPosts();
    } else if (tab === 'Search') {
      this.searchPosts();
    }
  }

  loadMorePosts(): void {
    this.page++;
    this.loadPosts();
  }

  voteOnPost(post: Post, voteType: 'UPVOTE' | 'DOWNVOTE') {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('You must be logged in to vote.');
      return;
    }

    const currentVote = post.userVote;
    let newVote: 'UPVOTE' | 'DOWNVOTE' | null = voteType;

    if (currentVote === voteType) {
      newVote = null;
    }

    if (voteType === 'UPVOTE') {
      post.upvoteCount = (post.upvoteCount || 0) + (newVote === 'UPVOTE' ? 1 : (currentVote === 'UPVOTE' ? -1 : 0));
      if (currentVote === 'DOWNVOTE') {
        post.downvoteCount = (post.downvoteCount || 0) - 1;
      }
    } else {
      post.downvoteCount = (post.downvoteCount || 0) + (newVote === 'DOWNVOTE' ? 1 : (currentVote === 'DOWNVOTE' ? -1 : 0));
      if (currentVote === 'UPVOTE') {
        post.upvoteCount = (post.upvoteCount || 0) - 1;
      }
    }

    post.userVote = newVote;
    this.cdr.detectChanges();

    this.postService.votePost(post.id, voteType).subscribe({
      next: () => {
        this.fetchVoteStatus(post);
      },
      error: (err) => {
        console.error('Vote failed:', err);
        this.fetchVoteStatus(post);
        alert('Failed to update vote. Please try again.');
      }
    });
  }

  fetchVoteStatus(post: Post) {
    this.postService.getPostVoteStatus(post.id).subscribe({
      next: (voteStatus) => {
        post.userVote = voteStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch vote status for post', post.id, err);
        post.userVote = null;
        this.cdr.detectChanges();
      }
    });
  }

  getVoteCount(post: Post): number {
    return (post.upvoteCount || 0) - (post.downvoteCount || 0);
  }

  stripHtmlTags(html: string): string {
    const noImgHtml = html.replace(/<img[^>]*>/gi, '');
    const div = document.createElement('div');
    div.innerHTML = noImgHtml;
    return div.textContent || div.innerText || '';
  }

  getImageUrls(content: string): string[] {
    const div = document.createElement('div');
    div.innerHTML = content;
    const images = div.querySelectorAll('img');
    return Array.from(images).map((img) => img.getAttribute('src') || '').filter(Boolean);
  }

  toggleMasonryLayout(): void {
    this.isMasonryLayout = !this.isMasonryLayout;
  }
}
