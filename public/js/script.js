// Get the file input element by its ID
var fileInput = document.getElementById("fileInput");

// Get the span element where the file name will be displayed
var fileNameSpan = document.getElementById("fileName");

// Set the default message when the page loads
fileNameSpan.textContent = "Upload your file";

// Add an event listener to the file input element that triggers when the user selects a file
fileInput.addEventListener("change", () => {
  // Get the first file selected by the user
  const file = fileInput.files[0];

  // If a file is selected, display its name in the span element
  if (file) {
    fileNameSpan.textContent = file.name;
  }
  // If no file is selected, reset the span element text to the default message
  else {
    fileNameSpan.textContent = "Upload your file";
  }
});

// Connect to Socket.IO server
const socket = io();

// Get the progress bar
const progressBar = document.querySelector(".progress-bar");

// get the link Download file
const downloadResult = document.getElementById("downloadResult");

downloadResult.style.display = "none";
// Update the progress bar on receiving 'progress' event
socket.on("progress", (data) => {
  const percentage = data.percentage || 0;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", percentage);
  progressBar.innerText = `${percentage}%`;
});

// Form action :
document
  .getElementById("fileForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(this);
    fetch("/api/file", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json()) // Handle response as JSON or adjust based on your server response
      .then((data) => {
        downloadResult.style.display = "none";
        // Process the response data here (e.g., update the DOM or show a message)
        console.log("Success:", data);
        if (data.success) {
          downloadResult.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
