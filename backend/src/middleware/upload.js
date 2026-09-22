import multer from 'multer';

// Use memory storage so files are never written to disk uninspected
const storage = multer.memoryStorage();

// File filter: only accept PDF
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resume files are accepted.'), false);
  }
};

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});
