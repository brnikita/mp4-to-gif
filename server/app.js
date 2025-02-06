// Required modules
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the generated_gifs directory
app.use('/gifs', express.static(path.join(__dirname, '../worker/generated_gifs')));

// Add logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    url: req.url,
    method: req.method,
    headers: req.headers,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  next();
});

// Serve GIF files from the output directory
app.get('/app/output/:filename', (req, res, next) => {
  let filename = req.params.filename;
  
  // Remove any query parameters from filename
  filename = filename.split('?')[0];
  
  // Ensure filename has .gif extension
  if (!filename.endsWith('.gif')) {
    filename = `${filename}.gif`;
  }

  // Construct absolute path to the generated_gifs directory
  const outputDir = path.resolve(__dirname, '../worker/generated_gifs');
  const filePath = path.join(outputDir, filename);

  // Ensure the file path is within the output directory (security measure)
  if (!filePath.startsWith(outputDir)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }

  console.log('Download request received for file:', filename);
  console.log('Looking for file at path:', filePath);
  console.log('Output directory:', outputDir);
  
  try {
    // List directory contents
    const dirContents = fs.readdirSync(outputDir);
    console.log('Directory contents:', dirContents);

    // First check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ 
        error: 'GIF not found',
        requestedFile: filename,
        availableFiles: dirContents
      });
    }

    const stats = fs.statSync(filePath);
    console.log('File stats:', {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      permissions: stats.mode
    });

    // Set headers for GIF download
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log('Sending file with headers:', res.getHeaders());

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      next(err);
    });

    fileStream.on('end', () => {
      console.log('File stream completed successfully');
    });

  } catch (err) {
    console.error('Error processing file:', err);
    next(err);
  }
});

// Log all errors
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// ----- Catch-all route for Angular SPA (should come after API routes) ----- //
app.get('*', (req, res) => {
  console.log('Catch-all route hit:', req.url);
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app; 