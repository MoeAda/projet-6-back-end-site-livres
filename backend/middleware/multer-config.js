const multer = require('multer');

const MIME_TYPES = {
    "image/jpg": "webp",
    "image/jpeg": "webp",
    "image/png": "webp",
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.').slice(0, -1).join('.');
        const extension = MIME_TYPES[file.mimetype] || 'webp'; // Correction ici
        callback(null, `${name}_${Date.now()}.${extension}`);
    }
});

module.exports = multer({ storage }).single('image');