import fs from 'fs';
import path from 'path';

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Decodes a `data:<mime>;base64,<data>` string and writes it under
 * backend/uploads/<subdir>/, mirroring the pattern used for student photos
 * in routes/upload.ts. Returns the public URL to store on the record.
 */
export function saveBase64File(dataUrl: string, subdir: string, filePrefix: string): { url: string; filename: string; mimeType: string; size: number } {
  const matches = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid file format');
  }

  const mime = matches[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) {
    throw new Error(`Unsupported file type: ${mime}`);
  }

  const uploadsDir = path.join(process.cwd(), 'uploads', subdir);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const dataBuffer = Buffer.from(matches[2], 'base64');
  const filename = `${filePrefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), dataBuffer);

  return { url: `/uploads/${subdir}/${filename}`, filename, mimeType: mime, size: dataBuffer.length };
}
