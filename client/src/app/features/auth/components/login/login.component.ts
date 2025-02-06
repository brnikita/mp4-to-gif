import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Login</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="serverError" class="error-message">
          {{ serverError }}
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">
              Email is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">
              Invalid email format
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
              Password is required
            </mat-error>
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Login</span>
            </button>
            <button mat-button type="button" routerLink="/auth/register">Register</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 20px;
    }

    mat-card {
      max-width: 400px;
      width: 100%;
    }

    mat-card-content {
      padding: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    button[type="submit"] {
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required
      ]]
    });

    // Clear errors when user starts typing
    this.loginForm.valueChanges.subscribe(() => {
      this.serverError = null;
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.serverError = null;

      try {
        await this.authService.login(this.loginForm.value);
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private handleError(error: any) {
    console.error('Login error:', error);
    
    if (error.status === 401) {
      this.serverError = 'Invalid email or password';
    } else if (error.status === 422 && error.error?.errors) {
      const serverErrors = error.error.errors;
      this.serverError = Object.values(serverErrors)[0] as string;
    } else if (error.error?.message) {
      this.serverError = error.error.message;
    } else {
      this.serverError = 'An unexpected error occurred. Please try again later.';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 