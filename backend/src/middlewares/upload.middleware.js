import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_IMAGES_ROOT = path.resolve(__dirname, "../../public/images");

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const buildStorage = (folderName) => multer.diskStorage({
  destination: (req, file, callback) => {
    const targetDir = path.join(PUBLIC_IMAGES_ROOT, folderName);
    fs.mkdirSync(targetDir, { recursive: true });
    callback(null, targetDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".png";
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${safeExtension}`;
    callback(null, uniqueName);
  },
});

const createImageUploadMiddleware = (folderName) => {
  const upload = multer({
    storage: buildStorage(folderName),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
    fileFilter: (req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const error = new Error("Format d'image non supporte.");
        error.statusCode = 400;
        callback(error);
        return;
      }

      callback(null, true);
    },
  });

  return [
    upload.single("image"),
    (req, res, next) => {
      if (req.file) {
        req.uploadedImageUrl = `images/${folderName}/${req.file.filename}`;
      }
      next();
    },
  ];
};

export default createImageUploadMiddleware;
