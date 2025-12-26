/**
 * Buscador de SKUs - Conexión a Google Apps Script
 * 
 * INSTRUCCIONES:
 * 1. Debes crear un script en Google Drive (ver README).
 * 2. Pega la URL de tu Web App aquí abajo.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzj6o8SNyrLobYKyQZmAwyfJ8R62n37qzwDct7ju-VvnY6_b3v33dp77cA8feJQBfTiUQ/exec';

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

    els.mediaGrid.innerHTML = '';
    els.resultsSection.classList.add('hidden');
    els.loader.classList.remove('hidden');
    els.searchBtn.disabled = true;
    showStatus('');

    try {
        // Primero buscar sin thumbnails (más rápido)
        const response = await fetch(`${APPS_SCRIPT_URL}?sku=${encodeURIComponent(sku)}&thumbs=true`);

        if (!response.ok) {
            throw new Error('Error en la conexión con el servidor.');
        }

        const data = await response.json();
        console.log('Datos recibidos:', data); // AGREGAR ESTA LÍNEA
        console.log('Archivos recibidos:', data.files);
        console.log('Primer archivo:', data.files[0]);


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

        const isVideo = file.type.startsWith('video');
        
        if (isVideo) {
            card.innerHTML = `
                <div class="video-placeholder">
                    <i class="fa-solid fa-circle-play" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">${file.name}</p>
                </div>
                <div class="media-overlay">
                    <a href="${file.viewUrl}" target="_blank" class="btn btn-primary btn-sm" title="Ver Video">
                        <i class="fa-solid fa-play"></i>
                    </a>
                    <a href="${file.downloadUrl}" download class="btn btn-secondary btn-sm" title="Descargar" style="margin-left: 0.5rem;">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
} else {
            // Usar thumbnail base64 si existe, sino placeholder
            const imgSrc = file.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23333" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="white" dy=".3em" font-size="14">Cargando...</text></svg>';
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${file.name}" class="media-preview" loading="lazy">
                <div class="media-overlay">
                    <a href="${file.downloadUrl}" download class="btn btn-primary btn-sm" title="Descargar">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
        }
        
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
