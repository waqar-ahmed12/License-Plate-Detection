const multer = require('multer');
// const path = require('path');

console.log("In the uplaod middle ware")
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video files are allowed!'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;