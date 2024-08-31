// Import the HTTP module to create an HTTP server
const http = require("http");

// Import the Express app instance from the app module
const app = require("./app");

// create instance to socket io
const { socketConnection } = require("./controller/socketController");
// Set the default port to 8080
const PORT = 8080;

// Create an HTTP server instance, passing in the Express app as the request handler
const server = http.createServer(app);

// Function to start the server
const startServer = () => {
  server.listen(PORT, () => {
    // Set up Socket.IO with the server
    socketConnection(server);
    console.log(`Server started on port ${PORT}`);
  });
};

// Call the startServer function to initiate the server
startServer();
