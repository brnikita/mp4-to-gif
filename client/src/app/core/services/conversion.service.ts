import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

export interface ConversionMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
}

export interface Conversion {
  id: string;
  originalFileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  metadata: ConversionMetadata;
  outputPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversionResponse {
  message: string;
  conversionId: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(environment.socketUrl, {
      auth: {
        token: localStorage.getItem('token')
      }
    });
  }

  uploadVideo(file: File): Observable<ConversionResponse> {
    const formData = new FormData();
    formData.append('video', file);

    return this.http.post<ConversionResponse>(
      `${environment.apiUrl}/convert`,
      formData
    );
  }

  getConversion(id: string): Observable<Conversion> {
    return this.http.get<Conversion>(`${environment.apiUrl}/convert/${id}`);
  }

  getConversionHistory(): Observable<{ conversions: Conversion[] }> {
    return this.http.get<{ conversions: Conversion[] }>(
      `${environment.apiUrl}/convert`
    );
  }

  onConversionProgress(callback: (data: { conversionId: string; progress: number }) => void): void {
    this.socket.on('conversionProgress', callback);
  }

  onConversionStatus(callback: (data: { conversionId: string; status: string; error?: string }) => void): void {
    this.socket.on('conversionStatus', callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
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