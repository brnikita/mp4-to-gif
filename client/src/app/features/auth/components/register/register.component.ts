import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '@app/core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Register</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="serverError" class="error-message">
          {{ serverError }}
        </div>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched">
              Email is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched">
              Invalid email format
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('pattern') && registerForm.get('email')?.touched">
              Please enter a valid email address
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('serverError') && registerForm.get('email')?.touched">
              {{ registerForm.get('email')?.getError('serverError') }}
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-hint>Password must be at least 6 characters with 1 uppercase, 1 lowercase and 1 number</mat-hint>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched">
              Password is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched">
              Password must be at least 6 characters
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('pattern') && registerForm.get('password')?.touched">
              Password must contain at least one uppercase letter, one lowercase letter, and one number
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('serverError') && registerForm.get('password')?.touched">
              {{ registerForm.get('password')?.getError('serverError') }}
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Confirm Password</mat-label>
            <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" required>
            <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched">
              Please confirm your password
            </mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
              Passwords do not match
            </mat-error>
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">Register</span>
            </button>
            <button mat-button type="button" routerLink="/auth/login">Back to Login</button>
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

    mat-hint {
      font-size: 12px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Clear errors when user starts typing
    this.registerForm.valueChanges.subscribe(() => {
      this.serverError = null;
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.serverError = null;

      try {
        const { email, password } = this.registerForm.value;
        const credentials: LoginCredentials = { email, password };
        const response = await firstValueFrom(this.authService.register(credentials));
        
        if (response && response.token) {
          this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
          await this.router.navigate(['/dashboard']);
        } else {
          this.serverError = 'Invalid response from server';
        }
      } catch (error: any) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private handleError(error: any) {
    console.error('Registration error:', error);
    
    if (error.status === 409) {
      this.serverError = 'Email already exists';
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