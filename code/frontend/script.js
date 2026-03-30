async function loadStatus() {
  try {
    const response = await fetch("/status");
    const data = await response.json();

    const status = document.getElementById("status");
    const message = document.getElementById("message");

    status.textContent = data.connected
      ? "Status: Connected"
      : "Status: Not Connected";
    status.className = data.connected ? "connected" : "disconnected";
    message.textContent = data.connected
      ? "Database connection is currently open."
      : "Database connection is currently closed.";
  } catch (error) {
    document.getElementById("status").textContent = "Status: Backend Not Reachable";
    document.getElementById("status").className = "disconnected";
    document.getElementById("message").textContent = "Could not reach the backend server.";
  }
}

async function openConnection() {
  try {
    const response = await fetch("/connect", {
      method: "POST"
    });
    const data = await response.json();
    document.getElementById("message").textContent = data.message;
    loadStatus();
  } catch (error) {
    document.getElementById("message").textContent = "Failed to open the connection.";
  }
}

async function closeConnection() {
  try {
    const response = await fetch("/disconnect", {
      method: "POST"
    });
    const data = await response.json();
    document.getElementById("message").textContent = data.message;
    loadStatus();
  } catch (error) {
    document.getElementById("message").textContent = "Failed to close the connection.";
  }
}

window.onload = loadStatus;