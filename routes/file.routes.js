// Create an Express router instance
const router = require("express").Router();

const upload = require("../helpers/multer");

const {
  domainRecordSearch,
  downloadFileFiltered,
} = require("../controller/fileController");

// Render the index.ejs page on a GET request to /api/file
router.get("/file", (req, res) => {
  res.render("index"); // Render the index.ejs file
});

// Handle the file upload and filtering on a POST request to /api/file
router.route("/").post(upload.single("file"), domainRecordSearch);

// Import the filterFile  function from the fileController module
router.route("/download").get(upload.single("file"), downloadFileFiltered);

// Export the router instance to be used in other parts of the application
module.exports = router;
