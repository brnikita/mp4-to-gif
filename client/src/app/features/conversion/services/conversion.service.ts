import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

interface ConversionStatus {
  conversionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  metadata?: {
    duration: number;
    width: number;
    height: number;
    size: number;
  };
  outputPath?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  constructor(private http: HttpClient) {}

  async uploadVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await firstValueFrom(
      this.http.post<{ conversionId: string; message: string }>(
        `${environment.apiUrl}/convert`,
        formData
      )
    );

    return response.conversionId;
  }

  async getConversionStatus(conversionId: string): Promise<ConversionStatus> {
    const response = await firstValueFrom(
      this.http.get<ConversionStatus>(`${environment.apiUrl}/convert/${conversionId}`)
    );
    return response;
  }

  validateFile(file: File): string | null {
    if (file.type !== 'video/mp4') {
      return 'Only MP4 videos are allowed';
    }

    if (file.size > environment.maxFileSize) {
      return `File size must not exceed ${environment.maxFileSize / (1024 * 1024)}MB`;
    }

    return null;
  }
} 