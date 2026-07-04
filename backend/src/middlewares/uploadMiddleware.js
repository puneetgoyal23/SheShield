import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images for profile pictures and incident reports
  const allowedImages = /jpeg|jpg|png|webp/;
  // Allow audio/video for SOS future feature
  const allowedMedia = /mp3|mp4|wav|ogg|webm|m4a|aac/;

  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const isImage = allowedImages.test(ext);
  const isMedia = allowedMedia.test(ext);

  if (isImage || isMedia) {
    return cb(null, true);
  }
  cb(new Error("Only images (.jpg, .png, .webp) and media (.mp3, .mp4, .wav) files are allowed."));
};

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB to accommodate video/audio
  fileFilter
});
