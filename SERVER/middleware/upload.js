const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png/;
  const isValid = allowed.test(file.mimetype);

  if (isValid) cb(null, true);
  else cb("Only images allowed", false);
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
