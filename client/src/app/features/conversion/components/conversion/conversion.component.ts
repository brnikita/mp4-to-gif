import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConversionService } from '../../services/conversion.service';

@Component({
  selector: 'app-conversion',
  template: `
    <div class="conversion-page">
      <mat-card *ngIf="!conversionId">
        <mat-card-header>
          <mat-card-title>Convert MP4 to GIF</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-file-upload
            (fileSelected)="onFileSelected($event)"
            [isUploading]="isUploading">
          </app-file-upload>
        </mat-card-content>
      </mat-card>

      <app-conversion-progress
        *ngIf="conversionId"
        [conversionId]="conversionId"
        (completed)="onConversionCompleted()">
      </app-conversion-progress>
    </div>
  `,
  styles: [`
    .conversion-page {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 20px;
    }

    mat-card-content {
      padding: 20px;
    }
  `]
})
export class ConversionComponent {
  conversionId?: string;
  isUploading = false;

  constructor(
    private conversionService: ConversionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async onFileSelected(file: File) {
    const error = this.conversionService.validateFile(file);
    if (error) {
      this.snackBar.open(error, 'Close', { duration: 5000 });
      return;
    }

    this.isUploading = true;
    try {
      this.conversionId = await this.conversionService.uploadVideo(file);
    } catch (error) {
      console.error('Upload failed:', error);
      this.snackBar.open('Failed to upload video', 'Close', { duration: 5000 });
    } finally {
      this.isUploading = false;
    }
  }

  onConversionCompleted() {
    this.snackBar.open('Conversion completed!', 'View', {
      duration: 5000
    }).onAction().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
} 