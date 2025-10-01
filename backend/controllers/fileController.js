const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow .wav files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/wave' || path.extname(file.originalname).toLowerCase() === '.wav') {
        cb(null, true);
    } else {
        cb(new Error('Only .wav files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: fileFilter
});


const uploadWavFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileInfo = {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            message: 'WAV file uploaded successfully',
            file: fileInfo
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed'
        });
    }
};


// Analyze audio file using external API
const analyzeAudio = async (req, res) => {
    try {
        const { filename, domain, paragraph_number } = req.body;
        
        if (!filename || !domain || !paragraph_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: filename, domain, paragraph_number'
            });
        }

        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Audio file not found'
            });
        }

        // Create FormData for the external API request
        const formData = new FormData();
        formData.append('audio_file', fs.createReadStream(filePath));
        formData.append('domain', domain);
        formData.append('paragraph_number', paragraph_number.toString());

        // Make request to analysis API
        const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000 // 60 second timeout
        });

        // Return the analysis results
        res.status(200).json({
            
            analysis: response.data.word_lists

            
        });

    } catch (error) {
        console.error('Analysis error:', error);
        
        if (error.response) {
            // The external API returned an error response
            return res.status(error.response.status).json({
                success: false,
                message: 'Analysis API error',
                error: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(503).json({
                success: false,
                message: 'Analysis service unavailable'
            });
        } else {
            // Something else happened
            return res.status(500).json({
                success: false,
                message: 'Analysis failed',
                error: error.message
            });
        }
    }
};

// Upload and analyze in one step
const uploadAndAnalyze = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { domain, paragraph_number } = req.body;
        
        if (!domain || !paragraph_number) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: domain, paragraph_number'
            });
        }

        // Create FormData for the external API request
        const formData = new FormData();
        formData.append('audio_file', fs.createReadStream(req.file.path));
        formData.append('domain', domain);
        formData.append('paragraph_number', paragraph_number.toString());

        // Make request to analysis API
        const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000 // 60 second timeout
        });

        // Return both upload info and analysis results
        res.status(200).json({
            success: true,
            message: 'File uploaded and analyzed successfully',
            file: {
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                uploadedAt: new Date().toISOString()
            },
            analysis: response.data,
            parameters: {
                domain: domain,
                paragraph_number: paragraph_number
            }
        });

    } catch (error) {
        console.error('Upload and analyze error:', error);
        
        // Clean up uploaded file if analysis failed
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Failed to cleanup file:', cleanupError);
            }
        }

        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Analysis API error',
                error: error.response.data
            });
        } else if (error.request) {
            return res.status(503).json({
                success: false,
                message: 'Analysis service unavailable'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Upload and analysis failed',
                error: error.message
            });
        }
    }
};

// Get uploaded file
const getUploadedFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        
        res.status(200).json({
            success: true,
            file: {
                filename: filename,
                size: stats.size,
                uploadedAt: stats.birthtime,
                path: `/api/files/download/${filename}`
            }
        });

    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving file'
        });
    }
};

// Download/Stream uploaded file
const downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Set appropriate headers for audio file
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading file'
        });
    }
};

// Delete uploaded file
const deleteFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file'
        });
    }
};

// List all uploaded files
const listFiles = async (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const fileList = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename: filename,
                size: stats.size,
                uploadedAt: stats.birthtime,
                downloadPath: `/api/files/download/${filename}`
            };
        });

        res.status(200).json({
            success: true,
            files: fileList,
            count: fileList.length
        });

    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing files'
        });
    }
};

module.exports = {
    upload,
    uploadWavFile,
    analyzeAudio,
    uploadAndAnalyze,
    getUploadedFile,
    downloadFile,
    deleteFile,
    listFiles
};