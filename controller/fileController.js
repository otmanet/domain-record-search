// Import the express-async-handler module to handle async errors in Express routes
const asyncHandler = require("express-async-handler");

// Import the `readline` module to create an interface for reading input from the command line
// Use asynchronous streaming techniques to avoid memory issues and improve performance
const readline = require("readline");
//  This imports the fs (file system) module
const fs = require("fs");

const { io } = require("../controller/socketController"); // Import io from index.js

// Get the total number of lines first (you could use a library for this or process the file twice)
let totalLines = 0;

// async function for start stream File :
async function countLine(filePath) {
  return new Promise((resolve, reject) => {
    totalLines = 0;
    // Create an interface for reading data from a readable stream (in this case, a file) line by line
    const readLine = readline.createInterface({
      // Specify the input stream as a file stream created from the provided file path
      input: fs.createReadStream(filePath),
      // Specify the output stream as the standard output (typically the terminal or console)
      // output: process.stdout,
      terminal: false,
    });

    readLine.on("line", (line) => {
      totalLines++;
    });

    readLine.on("close", () => {
      resolve(totalLines);
    });

    readLine.on("error", (err) => {
      reject(err);
    });
  });
}
// Define an async function to handle the GET request for filterFile
const filterDataByKeyword = asyncHandler(async (req, res) => {
  const file = req.file;
  // Check file uploaded :
  if (!file) {
    return res.status(400).send("No file uploaded");
  }
  // Get path file
  const filePath = file.path;
  // Destructuring keyword from req.body(Object)
  const { keyword } = req.body;
  return new Promise(async (resolve, reject) => {
    let totalLines = await countLine(filePath);

    // Once we know the total lines, start processing again to calculate the percentage in real-time
    let processedLines = 0;

    // Parse line based on file type
    let lines;
    const emails = [];
    // Create an interface for reading data from a readable stream (in this case, a file) line by line
    const readLine = readline.createInterface({
      // Specify the input stream as a file stream created from the provided file path
      input: fs.createReadStream(filePath),
      // Specify the output stream as the standard output (typically the terminal or console)
      // output: process.stdout,
      terminal: false,
    });

    //  Using readline with a file stream is particularly useful when you want to process a large file line by line, rather than loading the entire file into memory at once.
    readLine.on("line", (line) => {
      lines = filePath.endsWith(".csv")
        ? line.split(",")
        : filePath.endsWith(".txt")
        ? line.split("\n")
        : line;
      // Filter line based on keyword
      if (lines.toString().toLowerCase().includes(keyword.toLowerCase())) {
        emails.push(lines);
      }
      processedLines++;
      const percentage = Math.floor((processedLines / totalLines) * 100);
      if (io) {
        // Check if io is defined
        io.emit("progress", { percentage: percentage });
      } else {
        console.error("Socket.IO instance is not defined");
        return;
      }
    });
    readLine.on("close", () => {
      // Create new file With filtered emails
      const filteredFilePath = `Download/DownloadResult.txt`;
      // Join the elements of the `filteredEmails` array into a single string,
      // with each element separated by a newline character ("\n")
      fs.writeFile(filteredFilePath, emails.join("\n"), (err) => {
        if (err) {
          console.log("Error writing filtered file:", err);
          return res.status(500).send("Error writing filtered file");
        }
      });
      resolve(emails);
      return res.status(200).json({
        success: true,
      });
    });
    readLine.on("error", (err) => {
      reject(err);
    });
  });
});

const downloadFileFiltered = asyncHandler(async (req, res) => {
  const filePath = "Download/DownloadResult.txt";
  // Download function provided by express
  res.download(filePath, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

module.exports = {
  filterDataByKeyword,
  downloadFileFiltered,
};
