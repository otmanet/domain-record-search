// Import the express-async-handler module to handle async errors in Express routes
const asyncHandler = require("express-async-handler");

// Import the `readline` module to create an interface for reading input from the command line
// Use asynchronous streaming techniques to avoid memory issues and improve performance
const readline = require("readline");
//  This imports the fs (file system) module
const fs = require("fs");

// Import the Node.js path module for working with file and directory paths
const path = require("path");

const { io } = require("../controller/socketController"); // Import io from index.js

// Import the Worker class from the worker_threads module
const { Worker } = require("worker_threads");

// Import the `parse` function from the `json2csv` module
const { parse } = require("json2csv");

// array for push result
let results = [];
// used for check  worker finish for create file
let tasks = 0;

let totalLines = 0;

let numberLineProcess = 0;
// Number of workers you want to run concurrently
const maxWorkers = 4;

let queue = [];
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

// progress function
const progressFunction = (processedLines) => {
  const percentage = Math.floor((processedLines / totalLines) * 100);
  // Check if io is defined
  if (io) {
    io.emit("progress", { percentage: percentage });
  } else {
    console.error("Socket.IO instance is not defined");
    return;
  }
};

const processWithWorkerPool = (domain, keyword, filePathRemoved) => {
  return new Promise((resolve) => {
    // If active workers are less than the maximum, start a new worker
    if (tasks < maxWorkers) {
      processDomain(domain, keyword, filePathRemoved, resolve);
    } else {
      // Otherwise, queue the task
      queue.push({ domain, keyword, filePathRemoved, resolve });
    }
  });
};

// function process Domain :
const processDomain = (domain, keyword, filePathRemoved) => {
  return new Promise((resolve) => {
    // Worker threads can handle CPU-intensive tasks like image processing, data crunching, or complex calculations without blocking the main Express.js thread
    // This allows your application to continue serving other requests while the worker thread processes the intensive task.
    const worker = new Worker(path.join(__dirname, "../helpers/worker.js"));
    tasks++;

    worker.postMessage({ domain });
    worker.on("message", (result) => {
      numberLineProcess++;
      tasks--;
      if (result.txtRecords && result.txtRecords.includes(keyword)) {
        results.push(result);
      }
      resolve();
      // Terminate the worker once the task is done
      worker.terminate();
      // If there are tasks in the queue, process the next one
      if (queue.length > 0) {
        const nextTask = queue.shift();
        processDomain(
          nextTask.domain,
          nextTask.keyword,
          nextTask.filePathRemoved
        );
      }
      if (tasks === 0) {
        finalizeResults(filePathRemoved);
        console.log("processing successfully");
      }
    });
    worker.on("error", (error) => {
      numberLineProcess++;
      tasks--;
      console.error(`Error in worker : ${error.message}`);
      resolve();
      // Terminate the worker in case of an error
      worker.terminate();
      if (tasks === 0) {
        finalizeResults(filePathRemoved);
      }
    });
    worker.on("exit", (code) => {
      progressFunction(numberLineProcess);
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  });
};

// Define an async function to handle the GET request for filterFile
const domainRecordSearch = asyncHandler(async (req, res) => {
  // initializes  array results and tasks each request user
  results = [];
  tasks = 0;
  numberLineProcess = 0;
  const file = req.file;
  // Get path file
  const filePath = file.path;
  // Destructuring keyword from req.body(Object)
  const { keyword } = req.body;
  // Check file uploaded :
  if (!file || !keyword) {
    return res.status(400).send("No file uploaded");
  }

  return new Promise(async (resolve, reject) => {
    totalLines = await countLine(filePath);
    // Once we know the total lines, start processing again to calculate the percentage in real-time
    let processedLines = 0;
    // Create an array of promises for processing each line
    const processingPromises = [];
    // Parse line based on file type
    let lines;

    // Create an interface for reading data from a readable stream (in this case, a file) line by line
    const readLine = readline.createInterface({
      // Specify the input stream as a file stream created from the provided file path
      input: fs.createReadStream(filePath),
      // Specify the output stream as the standard output (typically the terminal or console)
      // output: process.stdout,
      terminal: false,
    });

    //  Using readline with a file stream is particularly useful when you want to process a large file line by line, rather than loading the entire file into memory at once.
    readLine.on("line", async (line) => {
      processedLines++;

      lines = filePath.endsWith(".csv")
        ? line.split(",")
        : filePath.endsWith(".txt")
        ? line.split("\n")
        : line;
      const domain = lines.toString().trim();
      // Filter line based on keyword
      const processingPromise = processWithWorkerPool(
        domain,
        keyword,
        filePath
      );
      // progressFunction(processedLines);
      processingPromises.push(processingPromise);
    });
    readLine.on("close", async () => {
      resolve();
      await Promise.all(processingPromises).then(() => {
        return res.status(200).json({
          success: true,
        });
      });
    });
    readLine.on("error", (err) => {
      reject(err);
    });
  });
});
// function finalizeResults for create file csv
const finalizeResults = (filePathRemoved) => {
  // Create a file for domains that contain a specific keyword
  const csv = parse(results, { fields: ["domain"] });
  fs.writeFileSync("Download/DownloadResult.csv", csv);
  //Remove the file when the stream is done to free up space on the server
  fs.unlink(filePathRemoved, (err) => {
    if (err) {
      console.error(`Error removing file :${err.message}`);
      return;
    }
    console.log(`file ${filePathRemoved} has been successfully removed.`);
  });
};
// function for download  results as file the type csv
const downloadFileFiltered = asyncHandler(async (req, res) => {
  const filePath = "Download/DownloadResult.csv";
  // Download function provided by express
  res.download(filePath, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

module.exports = {
  domainRecordSearch,
  downloadFileFiltered,
};
