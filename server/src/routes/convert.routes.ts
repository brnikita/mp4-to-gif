import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Conversion } from '../models/conversion.model';
import { addConversionJob } from '../services/queue/conversion.queue';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import fs from 'fs';

const router = Router();

// Ensure upload and output directories exist
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
const outputDir = process.env.OUTPUT_DIR || '/app/output';

// Create directories if they don't exist
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'video/mp4') {
      cb(new Error('Invalid file type. Only MP4 videos are allowed.'));
      return;
    }
    cb(null, true);
  }
});

// Start conversion
router.post('/', authenticate, upload.single('video'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No video file uploaded');
    }

    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    // Generate output path
    const outputFileName = path.basename(req.file.originalname, '.mp4') + '.gif';
    const outputPath = path.join(outputDir, `${Date.now()}-${outputFileName}`);

    const conversion = new Conversion({
      userId: req.user.userId,
      originalFileName: req.file.originalname,
      inputPath: req.file.path,
      outputPath,
      metadata: {
        size: req.file.size,
        // These will be updated by the worker after analysis
        duration: 0,
        width: 0,
        height: 0
      }
    });

    await conversion.save();

    // Add to conversion queue with input and output paths
    await addConversionJob(
      conversion._id.toString(),
      req.user.userId,
      req.file.path,
      outputPath
    );

    logger.info('Started conversion', {
      userId: req.user.userId,
      conversionId: conversion._id,
      fileName: req.file.originalname,
      inputPath: req.file.path,
      outputPath
    });

    res.status(201).json({
      message: 'Conversion started',
      conversionId: conversion._id,
      status: conversion.status
    });
  } catch (error) {
    next(error);
  }
});

// Get conversion status
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    const conversion = await Conversion.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!conversion) {
      throw new ApiError(404, 'Conversion not found');
    }

    res.json({
      conversionId: conversion._id,
      status: conversion.status,
      progress: conversion.progress,
      error: conversion.error,
      metadata: conversion.metadata,
      outputPath: conversion.outputPath,
      createdAt: conversion.createdAt,
      updatedAt: conversion.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Get user's conversion history
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    const conversions = await Conversion.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      conversions: conversions.map(conversion => ({
        id: conversion._id,
        originalFileName: conversion.originalFileName,
        status: conversion.status,
        progress: conversion.progress,
        error: conversion.error,
        outputPath: conversion.outputPath,
        createdAt: conversion.createdAt,
        updatedAt: conversion.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

export const convertRoutes = router; 