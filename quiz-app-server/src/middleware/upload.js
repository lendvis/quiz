import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadSingle = (folderName, fieldName) => {
  const baseUploadDir = process.env.UPLOAD_DIR || path.resolve("uploads");
  const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 5);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(baseUploadDir, folderName);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: (req, file, cb) => {
      const id = req.params.id;
      const ext = path.extname(file.originalname);
      cb(null, `${id}${ext}`);
    }
  });

  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  return multer({
    storage,
    limits: {
      fileSize: maxUploadSizeMb * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        return cb(new Error("Only image uploads are allowed"));
      }

      return cb(null, true);
    },
  }).single(fieldName);
};
