// script.js

const rfidInput = document.getElementById('rfidInput');
const addButton = document.getElementById('addButton');
const logDiv = document.getElementById('log');
const selectFileButton = document.getElementById('selectFileButton');
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');
let rfidLog = [];
let fileHandle = null;

// Ensure the input field is always focused
function maintainFocus() {
    rfidInput.focus();
}

window.onload = maintainFocus;
rfidInput.onblur = () => setTimeout(maintainFocus, 0);

// Function to format the timestamp
function formatTimestamp(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Function to add log entry to the display, store in memory, and write to file
async function addLogEntry(rfidCode, timestamp) {
    const entryText = `${timestamp} ${rfidCode}`;

    // Display the entry
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = entryText;
    logDiv.prepend(entry); // Add new entries to the top

    // Store the entry in the log array
    rfidLog.push(entryText);

    // Write to file immediately
    if (fileHandle) {
        try {
            await writeFile(`${entryText}\n`);
        } catch (err) {
            console.error('Failed to write to file:', err);
            alert('Failed to write to file. See console for details.');
        }
    }
}

// Function to handle adding an entry (both from Enter key and Add Entry button)
function handleAddEntry() {
    const rfidCode = rfidInput.value.trim();
    if (rfidCode) {
        const timestamp = formatTimestamp(new Date());
        addLogEntry(rfidCode, timestamp);
        rfidInput.value = '';
    }
}

// Event listener for RFID input
rfidInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        handleAddEntry();
        event.preventDefault(); // Prevent default action
    }
});

// Event listener for Add Entry button
addButton.addEventListener('click', function() {
    handleAddEntry();
});

// Function to select file
selectFileButton.addEventListener('click', async function() {
    try {
        [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Text Files',
                accept: {'text/plain': ['.txt']}
            }],
            multiple: false
        });
        // Verify write permission
        const options = { mode: 'readwrite' };
        // Get permission to read and write to the file
        if ((await fileHandle.queryPermission(options)) !== 'granted') {
            if ((await fileHandle.requestPermission(options)) !== 'granted') {
                throw new Error('Permission to access file was denied.');
            }
        }
        alert('Log file selected successfully.');
    } catch (err) {
        console.error('File selection canceled or failed:', err);
        alert('Failed to select file. See console for details.');
    }
});

// Function to write data to file (appending content)
async function writeFile(content) {
    if (!fileHandle) return;

    // Get the current size of the file
    const file = await fileHandle.getFile();
    const size = file.size;

    // Create a writable stream with keepExistingData: true
    const writable = await fileHandle.createWritable({ keepExistingData: true });

    // Move the file pointer to the end of the file
    await writable.seek(size);

    // Write the content
    await writable.write(content);

    // Close the writable stream
    await writable.close();
}

// Function to save log to a new file
saveButton.addEventListener('click', function() {
    if (rfidLog.length === 0) {
        alert('No entries to save.');
        return;
    }

    // Prepare data to save
    const data = rfidLog.join('\n');

    // Generate default file name
    const now = new Date();
    const defaultFileName = formatTimestamp(now).replace(/[\/: ]/g, '_') + '.txt';

    // Create a blob with the data
    const blob = new Blob([data], { type: 'text/plain' });

    // Create a link to trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = defaultFileName;
    link.click();

    // Clean up
    window.URL.revokeObjectURL(link.href);
});

// Function to clear the log
clearButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear the log display? This will not erase data from the file.')) {
        logDiv.innerHTML = '';
        rfidLog = [];
        rfidInput.value = '';
        maintainFocus();
    }
});
