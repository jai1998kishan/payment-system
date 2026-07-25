import multer from "multer";

import { uploadConfig } from "../config/upload.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }

  cb(null, true);
};

export const uploadProductImages = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: uploadConfig.maxFileSize,

    files: uploadConfig.maxFiles,
  },
});
