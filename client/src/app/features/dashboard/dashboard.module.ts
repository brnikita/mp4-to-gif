import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConversionListComponent } from './components/conversion-list/conversion-list.component';
import { DashboardService } from './services/dashboard.service';

@NgModule({
  declarations: [
    DashboardComponent,
    ConversionListComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent
      }
    ])
  ],
  providers: [DashboardService]
})
export class DashboardModule { } 