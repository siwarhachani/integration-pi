import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { AuthService } from 'src/app/services/user/auth.service';
 

@Component({
  selector: 'app-oauth-success',
  templateUrl: './oauth-success.component.html',
  styleUrls: ['./oauth-success.component.css']
})
export class OauthSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.saveToken(token);

        // Decode token to get username
        const username = this.authService.getCurrentUserUsername();
        this.router.navigate(['/profile/@' + username]);
      } else {
        // No token? Redirect to log in
        this.router.navigate(['/login']);
      }
    });
  }


}
