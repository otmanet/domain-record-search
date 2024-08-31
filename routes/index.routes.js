const express = require("express");
const router = express.Router(); // Use express.Router() to create a new router instance
const fileRouter = require("./file.routes");

// Mount the file routes at the '/file' path
router.use("/file", fileRouter);

// Export the router to be used in other parts of the application
module.exports = router;
