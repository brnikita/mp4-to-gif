export interface ConversionJob {
  videoId: string;
  userId: string;
  inputPath: string;
  outputPath: string;
}

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
}

export interface ConvertOptions {
  inputPath: string;
  outputPath: string;
  onProgress?: (progress: number) => void;
} 