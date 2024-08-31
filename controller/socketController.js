const socketIo = require("socket.io");

// Create a new Socket.IO instance with CORS configuration
const io = socketIo({
  cors: {
    origin: "*",
  },
});

// Function to set up Socket.IO with the server
const socketConnection = function (server) {
  // Attach the Socket.IO instance to the server
  io.attach(server);

  // Listen for client connections
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

// Export the Socket.IO instance and the socketConnection function
module.exports = { io, socketConnection };
