import { Schema, model, Document, Types } from 'mongoose';

export interface IConversion extends Document {
  userId: Types.ObjectId;
  originalFileName: string;
  inputPath: string;
  outputPath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  metadata: {
    duration: number;
    width: number;
    height: number;
    size: number;
  };
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversionSchema = new Schema<IConversion>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  inputPath: {
    type: String,
    required: true
  },
  outputPath: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  metadata: {
    duration: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 0
    }
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for faster queries
conversionSchema.index({ userId: 1, createdAt: -1 });
conversionSchema.index({ status: 1 });

export const Conversion = model<IConversion>('Conversion', conversionSchema); 