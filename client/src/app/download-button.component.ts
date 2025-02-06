import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-download-button',
  templateUrl: './download-button.component.html'
})
export class DownloadButtonComponent implements OnInit {
  @Input() gifFileName: string = '';
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('DownloadButtonComponent initialized with filename:', this.gifFileName);
  }

  downloadGif() {
    if (!this.gifFileName) {
      console.error('No filename provided for download');
      return;
    }

    // Clean the filename and ensure .gif extension
    const filename = this.gifFileName
      .split('?')[0]  // Remove query parameters
      .replace(/[^a-zA-Z0-9-_\.]/g, '') // Remove special characters
      .endsWith('.gif') ? this.gifFileName : `${this.gifFileName}.gif`;

    const url = `/app/output/${filename}`; // Use relative URL, let proxy handle it
    console.log('Attempting to download from:', url);
    
    this.http.get(url, { 
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        console.log('Response headers:', response.headers);
        console.log('Response status:', response.status);
        const blob = response.body;
        
        if (!blob) {
          console.error('No blob received in response');
          return;
        }

        console.log('Received blob:', {
          type: blob.type,
          size: blob.size,
          headers: response.headers
        });

        // Create blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        
        // Append link to body (sometimes needed for Firefox)
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        console.log('Download initiated and blob URL cleaned up');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Download failed:', {
          error,
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          headers: error.headers
        });
        alert(`Failed to download GIF: ${error.message}`);
      }
    });
  }
} 