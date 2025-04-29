// post-page.component.ts
import {Component, Input, OnInit} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Post } from 'src/app/models/posts/post.interface';
import { PostService } from 'src/app/services/posts/post.service';
import { PostModalComponent } from "../post-modal/post-modal.component";
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';
;

@Component({
  selector: 'app-post-page',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    PostModalComponent
],
  template: `
    <div class="container my-4">
      <div class="card shadow-sm">
      <app-post-modal *ngIf="post" [post]="post"></app-post-modal>
      </div>
    </div>
  `,
})
export class PostPageComponent implements OnInit {
  post!: Post;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getPost(id).subscribe((post) => this.post = post);
  }
  copyLink(postId: number): void {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied!');
    });
  }
  @Input() inPage = false;

}
