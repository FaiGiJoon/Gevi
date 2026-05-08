async function apiCall(command, data = {}) {
    const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, ...data })
    });
    return await response.json();
}

const logArea = document.getElementById('output-log');
function log(message) {
    if (typeof message === 'object') message = JSON.stringify(message, null, 2);
    logArea.textContent = `[${new Date().toLocaleTimeString()}] ${message}\n` + logArea.textContent;
}

async function checkStatus() {
    const res = await apiCall('GET_STATUS');
    log(res);
}

async function loadPalettes() {
    const res = await apiCall('GET_PALETTES');
    const select = document.getElementById('palette-select');
    select.innerHTML = '';
    res.palettes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });
    updatePalettePreview();
}

async function changePalette() {
    const name = document.getElementById('palette-select').value;
    const res = await apiCall('SET_PALETTE', { paletteName: name });
    log(`Palette changed to: ${name}`);
    updatePalettePreview(res.palette.colors);
}

function updatePalettePreview(colors) {
    const preview = document.getElementById('palette-preview');
    preview.innerHTML = '';
    if (!colors) {
        // Just a placeholder or fetch current
        colors = ["#9bbc0f", "#8bab0f", "#306230", "#0f380f"]; // default
    }
    colors.forEach(c => {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = c;
        preview.appendChild(box);
    });
}

async function getTiles() {
    const res = await apiCall('GET_TILES', { bank: 0 });
    log(res);
}

async function inspectMemory() {
    const res = await apiCall('INSPECT_MEMORY', { address: 0x8000, length: 16 });
    log(res);
}

// Initial load
loadPalettes();
checkStatus();
