import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing token and user data
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  async login(credentials: { email: string; password: string }): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
    );
    this.setAuthData(response);
  }

  async register(credentials: { email: string; password: string }): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, credentials)
    );
    this.setAuthData(response);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
} 