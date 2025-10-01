const express = require('express');
const router = express.Router();
const { 
    upload, 
    uploadWavFile, 
    analyzeAudio,
    uploadAndAnalyze,
    getUploadedFile, 
    downloadFile, 
    deleteFile, 
    listFiles 
} = require('../controllers/fileController'); // Updated to match your file name

// Upload a WAV file
router.post('/upload', upload.single('audio_file'), uploadWavFile);

// Analyze an already uploaded file - Note: this should handle form-data for file upload
router.post('/analyze', upload.single('audio_file'), (req, res) => {
    // If a file is uploaded, use the uploaded file
    if (req.file) {
        // Extract other form data
        const { domain, paragraph_number } = req.body;
        req.body.filename = req.file.filename; // Add filename to body
        return analyzeAudio(req, res);
    } else {
        // If no file uploaded, expect JSON with filename
        return analyzeAudio(req, res);
    }
});

// Upload and analyze in one step
router.post('/upload-and-analyze', upload.single('audio_file'), uploadAndAnalyze);

// Get file info
router.get('/files/:filename', getUploadedFile);

// Download file
router.get('/files/download/:filename', downloadFile);

// Delete file
router.delete('/files/:filename', deleteFile);

// List all files
router.get('/files', listFiles);

module.exports = router;