const multer = require("multer");

// Configure Multer to store files in memory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/"); //Specify  the directory  to store upload files
  },
  filename: (req, file, cb) => {
    // Generate a unique suffix using the current timestamp and a random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random());
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "text/csv", // Comma-separated values (CSV)
    "text/plain", // Plain text (TXT)
  ];

  // Check if the file type is in the allowed list using
  const check_mimetype = allowedFileTypes.some((elm) => elm === file.mimetype);

  if (check_mimetype) {
    return cb(null, true);
  }

  // If not allowed, provide clear error message with specific file types
  return cb(new Error("Only TXT and CSV files are allowed!"));
};

// Initialize upload with memory storage
const upload = multer({ storage, fileFilter });

module.exports = upload;
