const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads_podcast/',
    filename: (req, file, cb) => {
        cb(null, `podcast_${req.user.id}${path.extname(file.originalname)}`); // Unique file name
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!'); // Reject files that are not images
    }
}

// Initialize upload
const uploadPodcast = multer({
    storage,
    limits: { fileSize: 2000000 }, // Max file size: 2MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

module.exports = uploadPodcast;