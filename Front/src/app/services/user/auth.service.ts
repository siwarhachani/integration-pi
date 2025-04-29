import {BehaviorSubject, catchError, Observable, throwError} from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap from 'rxjs/operators'
import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthResponseDTO } from 'src/app/models/user/auth-response.dto';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService(); // Create an instance of JwtHelperService
  private apiUrl = 'http://localhost:9090/api/auth'; // Update with your backend URL
  private authStatus = new BehaviorSubject<boolean>(this.hasToken()); // Track login status
  authStatus$ = this.authStatus.asObservable(); // Expose observable for components

  constructor(private http: HttpClient) {}

  //Register Endpoint
  register(username: string, email: string, password: string, firstName: string, lastName: string, birthdate: Date, role: string): Observable<any> {
    const body = { username, email, password, firstName, lastName, birthdate, role };
    return this.http.post(`${this.apiUrl}/register`, body, { observe: 'response' });
  }



  //Login Endpoint

  login(username: string, password: string): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: AuthResponseDTO) => {
        if (response.token) {
          this.saveToken(response.token);
          this.authStatus.next(true);
          console.log('JWT Token:', response.token);
        }
      }),
      catchError(this.handleError)  // Catch errors, including 403 for banned users
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 403) {
      // Handle banned user case
      return throwError(() => new Error('Your account is banned.'));
    }
    // Handle other types of errors
    return throwError(() => new Error('Login failed! Please try again.'));
  }

  //Forgot Password Endpoints
  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.get(`${this.apiUrl}/validate-reset-token?token=${token}`);
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }


  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    return !this.jwtHelper.isTokenExpired(token); // Returns false if expired
  }

  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('jwtToken'); // Returns true if the token exists
  }

  logout(): Observable<any> {
    localStorage.removeItem('jwtToken');
    this.authStatus.next(false); // Notify that user is logged out
    return this.http.post(`${this.apiUrl}/logout`, {});
  }


  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.role || null;
    }
    return null;
  }

  getCurrentUserPicture(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.picture || decoded?.sub || null;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }


  getCurrentUserUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded?.username || decoded?.sub || null;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  isCurrentUser(username: string): boolean {
    const currentUsername = this.getCurrentUserUsername();
    if (!currentUsername) return false;

    // Remove @ from the beginning if present
    const cleanProfileUsername = username.startsWith('@')
      ? username.substring(1)
      : username;

    return currentUsername === cleanProfileUsername;
  }


  getFirstname(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken?.firstname || null;
    }
    return null;
  }

    // New method to get user ID by current username
    getUserIdByCurrentUsername(): Observable<number> {
      const username = this.getCurrentUserUsername();
      const token = this.getToken();  // Get the token
      if (username && token) {
        const headers = { Authorization: `Bearer ${token}` };  // Add the token to headers
        return this.http.get<number>(`${this.apiUrl}/id?username=${username}`, { headers });
      } else {
        throw new Error('Username or Token is not available');
      }
    }
    




}
