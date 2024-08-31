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

    // hidden downloadResult each  new submission
    downloadResult.style.display = "none";
    const formData = new FormData(this);
    fetch("/api/file", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json()) // Handle response as JSON or adjust based on your server response
      .then((data) => {
        // Process the response data here (e.g., update the DOM or show a message)
        console.log("Success:", data);
        if (data.success) {
          downloadResult.style.display = "block";
          setTimeout(() => {
            // Reset the progress bar before each new submission
            progressBar.style.width = "0%";
            progressBar.setAttribute("aria-valuenow", 0);
            progressBar.innerText = "0%";
          }, 1500);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

// // Reset the progress bar when the button is clicked again
// document.getElementById("submitButton").addEventListener("click", function () {
//   console.log("here");

//   downloadResult.style.display = "none";
//   progressBar.style.width = "0%";
//   progressBar.setAttribute("aria-valuenow", 0);
//   progressBar.innerText = "0%";
// });
