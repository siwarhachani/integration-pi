import { Component } from '@angular/core';

@Component({
  selector: 'app-not-authorized',
  template: `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js"></script>

    <div class="error-container">
      <div class="lottie-animation"></div>
      <div class="error-content">
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <a routerLink="/home" class="btn btn-primary">Go to Homepage</a>
      </div>
    </div>
  `,
  styleUrls: ['./not-authorized.component.css']
})
export class NotAuthorizedComponent {}
