import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ConversionComponent } from './components/conversion/conversion.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ConversionProgressComponent } from './components/conversion-progress/conversion-progress.component';
import { ConversionService } from './services/conversion.service';

@NgModule({
  declarations: [
    ConversionComponent,
    FileUploadComponent,
    ConversionProgressComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    RouterModule.forChild([
      {
        path: '',
        component: ConversionComponent
      }
    ])
  ],
  providers: [ConversionService]
})
export class ConversionModule { } 