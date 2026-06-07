import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG and PDF files are allowed'));
  }
});

// @POST /api/uploads/document
router.post('/document', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(400).json({ success: false, message: 'Upload service not configured' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `mahajanseva/${req.user._id}`,
      resource_type: 'auto',
      public_id: `${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`
    });

    res.json({ success: true, url: result.secure_url, publicId: result.public_id, name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/uploads/signature - Upload signature image
router.post('/signature', protect, upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No signature uploaded' });
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(400).json({ success: false, message: 'Upload service not configured' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `mahajanseva/signatures`,
      public_id: `sig_${req.user._id}_${Date.now()}`
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
