const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

function fileFilter(_, file, cb) {
  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Solo se permiten imágenes JPG, PNG o WEBP'), ok);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // máximo 1MB
});
