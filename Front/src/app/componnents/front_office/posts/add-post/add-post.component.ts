import {Component, AfterViewInit, OnDestroy, Output, EventEmitter} from '@angular/core'; // Import OnDestroy
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { PostService } from 'src/app/services/posts/post.service';
import { HeaderComponent } from '../../template/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../template/footer/footer.component';

declare var tinymce: any;

@Component({
  selector: 'app-add-post',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
      HeaderComponent,
      FooterComponent,
      NgChartsModule
    ],
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})

export class AddPostComponent implements AfterViewInit, OnDestroy { // Implement OnDestroy
  title = '';
  content = '';
  errorMessage: string = '';
  editor: any; // To hold the TinyMCE editor instance

  constructor(
    private postService: PostService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngAfterViewInit(): void {
    tinymce.init({
      selector: '#content',
      plugins: ['image', 'link', 'lists', 'code'],
      toolbar: 'undo redo | bold italic | image link | alignleft aligncenter alignright',
      file_picker_types: 'image',
      height: 400,
      branding: false,
      setup: (editor: any) => {
        this.editor = editor; // Store the editor instance
      },
      images_upload_handler: (
        blobInfo: any,
        success: (url: string) => void,
        failure: (err: string) => void
      ): Promise<string | void> => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());
          formData.append('upload_preset', 'PiProject'); // Replace with yours
          formData.append('cloud_name', 'dzqwayyti'); // Replace with yours

          fetch('https://api.cloudinary.com/v1_1/dzqwayyti/image/upload', {
            method: 'POST',
            body: formData
          })
            .then(res => res.json())
            .then(data => {
              if (data.url) {
                success(data.url);
                resolve(data.url); // Resolve the Promise with the URL
              } else {
                failure('Upload failed: No URL returned');
                reject('Upload failed: No URL returned'); // Reject the Promise
              }
            })
            .catch(err => {
              console.error('Upload error:', err);
              failure('Image upload failed');
              reject('Image upload failed'); // Reject the Promise
            });
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Destroy the editor instance to prevent memory leaks
    if (this.editor) {
      this.editor.destroy();
    }
  }

  @Output() postCreated = new EventEmitter<void>();

  addPost() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.errorMessage = 'You must be logged in to create a post.';
      return;
    }

    this.content = this.editor.getContent();

    this.postService.createPost({ title: this.title, content: this.content }, token).subscribe({
      next: () => {
        this.postCreated.emit(); // 🔥 tell parent to reload
        this.title = '';
        this.editor.setContent(''); // clear TinyMCE content
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to create post. Please try again.';
        console.error(error);
      }
    });
  }


  stripHtmlTags(html: string): string {
    const noImgHtml = html.replace(/<img[^>]*>/gi, '');
    const div = document.createElement('div');
    div.innerHTML = noImgHtml;
    return div.textContent || div.innerText || '';
  }

  generateTitle() {
    if (!this.editor || !this.editor.getContent().trim()) {
      this.errorMessage = 'Write some content first.';
      return;
    }

    const rawHtml = this.editor.getContent();
    const cleanText = this.stripHtmlTags(rawHtml); // remove HTML tags + images

    const prompt = `${cleanText}`; // send clean text to the API

    this.http.post<any>('http://localhost:8000/generate-title', {
      prompt,
      max_tokens: 20
    }).subscribe({
      next: (res) => {
        this.title = res.response.trim();
      },
      error: (err) => {
        this.errorMessage = 'Failed to generate title.';
        console.error(err);
      }
    });
  }

}
