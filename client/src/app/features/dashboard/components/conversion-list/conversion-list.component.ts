import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { interval, Subscription } from 'rxjs';

interface Conversion {
  id: string;
  originalFileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  outputPath?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-conversion-list',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Recent Conversions</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="conversion-list">
          <div *ngFor="let conversion of conversions" class="conversion-item">
            <div class="conversion-info">
              <div class="filename">{{ conversion.originalFileName }}</div>
              <div class="status" [ngClass]="conversion.status">
                {{ conversion.status }}
                <mat-icon *ngIf="conversion.status === 'completed'">check_circle</mat-icon>
                <mat-icon *ngIf="conversion.status === 'failed'">error</mat-icon>
              </div>
            </div>
            
            <mat-progress-bar
              *ngIf="conversion.status === 'processing'"
              mode="determinate"
              [value]="conversion.progress">
            </mat-progress-bar>

            <div class="actions" *ngIf="conversion.status === 'completed' && conversion.outputPath">
              <a [href]="conversion.outputPath" download mat-button color="primary">
                <mat-icon>download</mat-icon>
                Download GIF
              </a>
            </div>

            <div class="error" *ngIf="conversion.status === 'failed' && conversion.error">
              {{ conversion.error }}
            </div>

            <div class="timestamp">
              {{ conversion.createdAt | date:'medium' }}
            </div>
          </div>

          <div *ngIf="conversions.length === 0" class="no-conversions">
            No conversions yet. Start by creating a new conversion.
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .conversion-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .conversion-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .conversion-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .filename {
      font-weight: 500;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 4px;
      text-transform: capitalize;
    }

    .status.completed {
      color: #4caf50;
    }

    .status.failed {
      color: #f44336;
    }

    .status.processing {
      color: #2196f3;
    }

    .status.pending {
      color: #ff9800;
    }

    .actions {
      margin-top: 8px;
    }

    .error {
      margin-top: 8px;
      color: #f44336;
      font-size: 0.9em;
    }

    .timestamp {
      margin-top: 8px;
      color: #666;
      font-size: 0.9em;
    }

    .no-conversions {
      text-align: center;
      padding: 32px;
      color: #666;
    }
  `]
})
export class ConversionListComponent implements OnInit, OnDestroy {
  conversions: Conversion[] = [];
  private refreshSubscription?: Subscription;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadConversions();
    // Refresh every 5 seconds if there are active conversions
    this.refreshSubscription = interval(5000).subscribe(() => {
      if (this.hasActiveConversions()) {
        this.loadConversions();
      }
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private async loadConversions() {
    try {
      this.conversions = await this.dashboardService.getConversionHistory();
    } catch (error) {
      console.error('Failed to load conversions:', error);
    }
  }

  private hasActiveConversions(): boolean {
    return this.conversions.some(c => 
      c.status === 'pending' || c.status === 'processing'
    );
  }
} 