import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>🎥 MP4 to GIF Converter (Dev)</span>
      <span class="spacer"></span>
      <ng-container *ngIf="authService.currentUser$ | async as user">
        <button mat-button routerLink="/dashboard" routerLinkActive="active">
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </button>
        <button mat-button routerLink="/conversion" routerLinkActive="active">
          <mat-icon>movie</mat-icon>
          Convert Video
        </button>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <div class="user-menu-header" mat-menu-item disabled>
            {{ user.email }}
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-menu-header {
      padding: 8px 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.54);
    }

    .mat-button {
      margin: 0 4px;
    }

    .mat-button.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .mat-button .mat-icon {
      margin-right: 4px;
    }
  `]
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 