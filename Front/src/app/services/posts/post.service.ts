import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from 'src/app/models/posts/post.interface';
import { VoteDTO } from 'src/app/models/posts/vote.dto';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:9090/api/posts'; // Backend URL for posts
  private votesApiUrl = 'http://localhost:9090/api/votes'; // Backend URL for votes

  constructor(private http: HttpClient) { }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(post: { title: string, content: string }, token: string): Observable<Post> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Post>(this.apiUrl, post, { headers });
  }

  updatePost(id: number, post: { title: string, content: string }, token: string): Observable<Post> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post, { headers });
  }

  deletePost(id: number, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Method to vote on a post
  votePost(postId: number, voteType: 'UPVOTE' | 'DOWNVOTE') {
    const body: VoteDTO = { voteType };
    const token = localStorage.getItem('jwtToken'); // Get JWT token if needed
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.votesApiUrl}/post/${postId}`, body, { headers });
  }


  getPostVoteStatus(postId: number): Observable<'UPVOTE' | 'DOWNVOTE' | null> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<'UPVOTE' | 'DOWNVOTE' | null>(`${this.votesApiUrl}/post/${postId}/status`, { headers });
  }

  getHotPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/hot`);
  }

  getTopPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/top`);
  }

  getMyPosts(token: string): Observable<Post[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Post[]>(`${this.apiUrl}/my-posts`, { headers });
  }

}
