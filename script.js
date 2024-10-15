// script.js

const rfidInput = document.getElementById('rfidInput');
const logDiv = document.getElementById('log');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');
let rfidLog = [];

// Load existing data from localStorage
window.onload = function() {
    const savedLog = localStorage.getItem('rfidLog');
    if (savedLog) {
        rfidLog = JSON.parse(savedLog);
        rfidLog.forEach(entry => addLogEntry(entry.rfid, entry.time, false));
    }
    rfidInput.focus(); // Ensure the input field is focused on page load
};

// Function to add log entry to the display
function addLogEntry(rfidCode, timestamp, save = true) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `${timestamp} - ${rfidCode}`;
    logDiv.prepend(entry); // Add new entries to the top

    if (save) {
        // Save the new entry to the log and localStorage
        rfidLog.push({ rfid: rfidCode, time: timestamp });
        localStorage.setItem('rfidLog', JSON.stringify(rfidLog));
    }
}

// Event listener for RFID input
rfidInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const rfidCode = rfidInput.value.trim();
        if (rfidCode) {
            const timestamp = new Date().toLocaleString();
            addLogEntry(rfidCode, timestamp);
            rfidInput.value = '';
        }
        event.preventDefault(); // Prevent form submission or other default actions
    }
});

// Ensure the input field is always focused
rfidInput.addEventListener('blur', function() {
    setTimeout(() => rfidInput.focus(), 0);
});

// Function to save log to a file
saveButton.addEventListener('click', function() {
    if (rfidLog.length === 0) {
        alert('No data to save.');
        return;
    }
    const data = rfidLog.map(entry => `${entry.time} - ${entry.rfid}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });

    // Create a link element
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'rfid_log.txt';
    link.click();

    // Clean up
    window.URL.revokeObjectURL(link.href);
});

// Function to clear the log
clearButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear the log? This action cannot be undone.')) {
        rfidLog = [];
        localStorage.removeItem('rfidLog');
        logDiv.innerHTML = '';
        rfidInput.value = '';
        rfidInput.focus();
    }
});
