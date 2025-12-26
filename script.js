/**
 * Buscador de SKUs - Conexión a Google Apps Script
 * 
 * INSTRUCCIONES:
 * 1. Debes crear un script en Google Drive (ver README).
 * 2. Pega la URL de tu Web App aquí abajo.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiuvZWamXcn0gDnHDwTi7mvMUA59I7MRfYo2JPbpU4Ec2IocOQNgFKDSxaJ7tbQPv3RA/exec';

// Elementos del DOM
const els = {
    searchBtn: document.getElementById('search-btn'),
    skuInput: document.getElementById('sku-input'),
    resultsSection: document.getElementById('results-section'),
    mediaGrid: document.getElementById('media-grid'),
    loader: document.getElementById('loader'),
    statusMessage: document.getElementById('status-message'),
    statusText: document.getElementById('status-text'),
    resultsTitle: document.getElementById('results-title')
};

// Check if URL is set
if (APPS_SCRIPT_URL.includes('PEGAR_TU_URL')) {
    showStatus('Error: Configura la URL del Script en script.js', true);
    els.skuInput.disabled = true;
} else {
    els.skuInput.disabled = false;
    els.searchBtn.disabled = false;
}

// --- Event Listeners ---

els.searchBtn.addEventListener('click', handleSearch);
els.skuInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !els.searchBtn.disabled) handleSearch();
});

// --- Búsqueda ---

async function handleSearch() {
    const sku = els.skuInput.value.trim();
    if (!sku) return;

    // Resetear UI
    els.mediaGrid.innerHTML = '';
    els.resultsSection.classList.add('hidden');
    els.loader.classList.remove('hidden');
    els.searchBtn.disabled = true;
    showStatus('');

    try {
        // Fetch to Google Apps Script
        // Mode 'cors' is important
        const response = await fetch(`${APPS_SCRIPT_URL}?sku=${encodeURIComponent(sku)}`);

        if (!response.ok) {
            throw new Error('Error en la conexión con el servidor.');
        }

        const data = await response.json();

        if (data.status === 'error') {
            showStatus(data.message, true);
        } else if (data.files.length === 0) {
            showStatus(`No se encontraron archivos para: "${sku}"`, true);
        } else {
            els.resultsTitle.textContent = `Resultados para "${data.folderName}"`;
            renderResults(data.files);
        }

    } catch (err) {
        console.error(err);
        showStatus('Error al buscar. Verifica la URL del script y tu conexión.', true);
    } finally {
        els.loader.classList.add('hidden');
        els.searchBtn.disabled = false;
    }
}

function renderResults(files) {
    els.resultsSection.classList.remove('hidden');

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'media-card';

        const isImage = file.type.startsWith('image');

        // Google Drive Thumbnail Logic
        // Usually ends in =s220. We want bigger.
        let thumbUrl = file.thumbnail;
        if (isImage && thumbUrl) {
            thumbUrl = thumbUrl.replace('=s220', '=s600');
        }

        card.innerHTML = `
            <img src="${thumbUrl}" alt="Archivo" class="media-preview" loading="lazy">
            <div class="media-overlay">
                <a href="${file.url}" target="_blank" class="btn btn-primary btn-sm" title="Descargar / Ver">
                    <i class="fa-solid fa-download"></i>
                </a>
            </div>
        `;
        els.mediaGrid.appendChild(card);
    });
}

// --- Utilidades ---

function showStatus(msg, isError = false) {
    els.statusMessage.classList.remove('hidden');
    els.statusText.textContent = msg;
    if (!msg) els.statusMessage.classList.add('hidden');

    if (isError) els.statusText.style.color = '#ff6b6b';
    else els.statusText.style.color = 'var(--text-muted)';
}
