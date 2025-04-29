import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from 'src/app/models/posts/comment.interface';
import { HttpParams } from '@angular/common/http'; // Import HttpParams
import { VoteDTO } from 'src/app/models/posts/vote.dto';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:9090/api/comments';
  private votesApiUrl = 'http://localhost:9090/api/votes';


  constructor(private http: HttpClient) {}

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`);
  }

  createComment(comment: { postId: number; text: string; parentId: number | null }, token: string): Observable<Comment> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      postId: comment.postId,
      text: comment.text,
      parentId: comment.parentId
    };

    return this.http.post<Comment>(this.apiUrl, payload, { headers });
  }

  updateComment(commentId: number, text: string, token: string): Observable<Comment> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, { text }, { headers });
  }

  deleteComment(commentId: number, token: string): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`, { headers });
  }

  voteComment(commentId: number, voteType: 'UPVOTE' | 'DOWNVOTE'): Observable<Comment> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const body: VoteDTO = { voteType };
    return this.http.post<Comment>(`${this.votesApiUrl}/comment/${commentId}`, body, { headers });
  }

  getCommentVoteStatus(commentId: number): Observable<'UPVOTE' | 'DOWNVOTE' | null> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<'UPVOTE' | 'DOWNVOTE' | null>(`${this.votesApiUrl}/comment/${commentId}/status`, { headers });
  }
  getAllComments(): Observable<Comment[]> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<Comment[]>(this.apiUrl, { headers });
  }


}
