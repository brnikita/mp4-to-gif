import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <mat-card class="stats">
        <mat-card-header>
          <mat-card-title>Your Conversions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="stats-grid">
            <div class="stat">
              <div class="value">{{ totalConversions }}</div>
              <div class="label">Total Conversions</div>
            </div>
            <div class="stat">
              <div class="value">{{ activeConversions }}</div>
              <div class="label">Active Conversions</div>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="startNewConversion()">
            <mat-icon>add</mat-icon>
            New Conversion
          </button>
        </mat-card-actions>
      </mat-card>

      <app-conversion-list></app-conversion-list>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .stats {
      margin-bottom: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      padding: 20px 0;
    }

    .stat {
      text-align: center;
    }

    .value {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .label {
      color: #666;
      margin-top: 8px;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalConversions = 0;
  activeConversions = 0;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const stats = await this.dashboardService.getConversionStats();
      this.totalConversions = stats.total;
      this.activeConversions = stats.active;
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }

  startNewConversion() {
    this.router.navigate(['/conversion']);
  }
} 