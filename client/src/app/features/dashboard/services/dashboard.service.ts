import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

interface ConversionStats {
  total: number;
  active: number;
}

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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  async getConversionStats(): Promise<ConversionStats> {
    const conversions = await this.getConversionHistory();
    const active = conversions.filter(c => c.status === 'pending' || c.status === 'processing').length;
    return {
      total: conversions.length,
      active
    };
  }

  async getConversionHistory(): Promise<Conversion[]> {
    const response = await firstValueFrom(
      this.http.get<{ conversions: Conversion[] }>(`${environment.apiUrl}/convert`)
    );
    return response.conversions;
  }
} 