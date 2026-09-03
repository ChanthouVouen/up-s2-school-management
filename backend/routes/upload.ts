import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /upload/image - Save base64 or file binary to backend/uploads directory
router.post('/image', (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ message: 'No image provided' });
      return;
    }

    // If it is already a server-hosted URL, return directly
    if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/'))) {
      res.json({ url: image });
      return;
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Parse base64 string
    const matches = typeof image === 'string' ? image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/) : null;
    if (!matches) {
      res.status(400).json({ message: 'Invalid image format' });
      return;
    }

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const dataBuffer = Buffer.from(matches[2], 'base64');
    const filename = `student-photo-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, dataBuffer);

    const fileUrl = `/uploads/${filename}`;
    res.json({ url: fileUrl, filename });
  } catch (err: any) {
    console.error('File upload failed:', err);
    res.status(500).json({ message: 'Failed to upload photo file' });
  }
});

export default router;
