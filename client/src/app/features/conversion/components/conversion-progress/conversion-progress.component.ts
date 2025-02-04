import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ConversionService } from '../../services/conversion.service';

interface ConversionStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  outputPath?: string;
}

@Component({
  selector: 'app-conversion-progress',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Converting Video</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="progress-container">
          <div class="status-text" [ngClass]="status">
            {{ getStatusText() }}
            <mat-icon *ngIf="status === 'completed'">check_circle</mat-icon>
            <mat-icon *ngIf="status === 'failed'">error</mat-icon>
          </div>

          <mat-progress-bar
            *ngIf="status === 'processing'"
            mode="determinate"
            [value]="progress">
          </mat-progress-bar>

          <div class="progress-text" *ngIf="status === 'processing'">
            {{ progress }}%
          </div>

          <div class="error-text" *ngIf="status === 'failed' && error">
            {{ error }}
          </div>

          <div class="actions" *ngIf="status === 'completed' && outputPath">
            <a [href]="outputPath" download mat-raised-button color="primary">
              <mat-icon>download</mat-icon>
              Download GIF
            </a>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    }

    .status-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2em;
    }

    .status-text.completed {
      color: #4caf50;
    }

    .status-text.failed {
      color: #f44336;
    }

    .status-text.processing {
      color: #2196f3;
    }

    .progress-text {
      text-align: center;
      color: #666;
    }

    .error-text {
      color: #f44336;
      font-size: 0.9em;
    }

    .actions {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }
  `]
})
export class ConversionProgressComponent implements OnInit, OnDestroy {
  @Input() conversionId!: string;
  @Output() completed = new EventEmitter<void>();

  status: ConversionStatus['status'] = 'pending';
  progress = 0;
  error?: string;
  outputPath?: string;

  private statusCheckSubscription?: Subscription;

  constructor(private conversionService: ConversionService) {}

  ngOnInit() {
    // Check status every 2 seconds
    this.statusCheckSubscription = interval(2000).subscribe(() => {
      this.checkStatus();
    });
    // Initial check
    this.checkStatus();
  }

  ngOnDestroy() {
    this.statusCheckSubscription?.unsubscribe();
  }

  private async checkStatus() {
    try {
      const status = await this.conversionService.getConversionStatus(this.conversionId);
      this.status = status.status;
      this.progress = status.progress;
      this.error = status.error;
      this.outputPath = status.outputPath;

      if (status.status === 'completed') {
        this.statusCheckSubscription?.unsubscribe();
        this.completed.emit();
      } else if (status.status === 'failed') {
        this.statusCheckSubscription?.unsubscribe();
      }
    } catch (error) {
      console.error('Failed to check conversion status:', error);
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case 'pending':
        return 'Preparing conversion...';
      case 'processing':
        return 'Converting video...';
      case 'completed':
        return 'Conversion completed!';
      case 'failed':
        return 'Conversion failed';
      default:
        return 'Unknown status';
    }
  }
} 