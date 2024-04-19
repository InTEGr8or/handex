// Initialize a shell prompt variable with colored clock and time
var shellPrompt = () => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const coloredTime = '\x1b[33m🕐[' + time + ']\x1b[0m'; // Magenta color
    return coloredTime + '> ';
};

function startTerminalElement(term) {
    let inputBuffer = '';
    let promptString = shellPrompt();

    function refreshInput() {
        term.write('\r' + promptString); // Return cursor to the start of the line
        term.write(inputBuffer); // Write the current input buffer
    }

    term.onKey(e => {
        const ev = e.domEvent;
        const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
        console.log("inputBuffer.length:", inputBuffer.length);
        if (ev.keyCode === 13) {
            term.write('\r\n'); // New line
            processCommand(term, inputBuffer);
            inputBuffer = ''; // Clear the buffer
            promptString = shellPrompt(); // Refresh the prompt with new time
            term.write(promptString);
        } else if (ev.keyCode === 8) {
            // Backspace was hit
            if (inputBuffer.length > 0) {
                inputBuffer = inputBuffer.slice(0, -1); // Remove last character from buffer
                refreshInput();
                term.write(' '); // Overwrite the last character with space
                refreshInput();
            }
        } else if (ev.keyCode === 38) { // Up arrow
            if (historyIndex > 0) {
                historyIndex--;
                inputBuffer = commandHistory[historyIndex];
                refreshInput();
            }
        } else if (ev.keyCode === 40) { // Down arrow
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                inputBuffer = commandHistory[historyIndex];
                refreshInput();
            } else if (historyIndex < commandHistory.length) {
                historyIndex++;
                inputBuffer = '';
                refreshInput();
            }
        } else if (printable) {
            inputBuffer += e.key; // Add to input buffer
            term.write(e.key); // Write the key
        }
    });
}

function processCommand(term, input) {
    const command = input.trim().toLowerCase();
    if (command === 'start') {
        term.writeln('Starting the game...');
        // Start game logic
    } else if (command === 'help') {
        term.writeln('Commands:');
        term.writeln('  start - Start the game');
        term.writeln('  help - Show this help message');
        // Add more commands and help text as needed
    } else {
        term.writeln('Unknown command: ' + command);
    }
}
// Create a function to display the image in the terminal
function showImageInTerminal(imageAddon, imageUrl) {
    // Use the imageAddon to display the image
    imageAddon.showImage(imageUrl, {
        width: '100px',
        height: '100px'
    }).catch((error) => {
        console.error('Failed to load image:', error);
    });
}

document.addEventListener("DOMContentLoaded", () => {

    var term = new window.Terminal({
        cursorBlink: true,
        cursorStyle: 'underline',
        fontSize: 14,
        prompt: '>',
        fontFamily: '"Fira Code", "DejaVu Sans Mono", "Lucida Console", monospace'
    });

    const fitAddon = new FitAddon.FitAddon();
    const imageAddon = new ImageAddon.ImageAddon({
        enableSizeReports: true,
        pixelLimit: 16777216,
        sixelSupport: true,
        sixelScrolling: true,
        sixelPaletteLimit: 512,  // set to 512 to get example image working
        sixelSizeLimit: 25000000,
        storageLimit: 128,
        showPlaceholder: true,
        iipSupport: true,
        iipSizeLimit: 20000000
      }); // Create a new instance of the ImageAddon

    term.loadAddon(fitAddon);
    term.loadAddon(imageAddon);
    // Attach the terminal to the DOM element with the ID 'terminal'
    const terminalDiv = document.getElementById('terminal');
    term.open(terminalDiv);
    fitAddon.fit();
    term.write(shellPrompt())
    // Initialize the terminal game when the DOM is ready
    startTerminalElement(term);
    let imageUrl = '/images/svgs/1C.svg';
})