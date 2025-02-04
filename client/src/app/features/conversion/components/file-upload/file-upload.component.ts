import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  template: `
    <div
      class="upload-area"
      [class.dragging]="isDragging"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)">
      
      <div class="upload-content">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <div class="upload-text">
          <ng-container *ngIf="!isUploading">
            Drag and drop your MP4 video here<br>
            or <button mat-button color="primary" (click)="fileInput.click()">browse</button>
          </ng-container>
          <ng-container *ngIf="isUploading">
            Uploading video...
          </ng-container>
        </div>
        <input
          #fileInput
          type="file"
          accept="video/mp4"
          (change)="onFileSelected($event)"
          [style.display]="'none'">
      </div>

      <mat-progress-bar
        *ngIf="isUploading"
        mode="indeterminate">
      </mat-progress-bar>
    </div>
  `,
  styles: [`
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 40px 20px;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .upload-area.dragging {
      border-color: #2196f3;
      background: #e3f2fd;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .upload-text {
      color: #666;
      font-size: 1.1em;
      line-height: 1.5;
    }

    mat-progress-bar {
      margin-top: 20px;
    }
  `]
})
export class FileUploadComponent {
  @Input() isUploading = false;
  @Output() fileSelected = new EventEmitter<File>();

  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      this.handleFile(files[0]);
      input.value = ''; // Reset input
    }
  }

  private handleFile(file: File) {
    if (file.type === 'video/mp4') {
      this.fileSelected.emit(file);
    }
  }
} 