import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;

// NOTE: This stores files on local disk which is fine for development.
// In production (e.g. on Render's ephemeral filesystem), swap this out for
// a cloud storage provider like Cloudinary, AWS S3, or Firebase Storage,
// since local files won't persist across deploys/restarts.
