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

        const isVideo = file.type.startsWith('video');
        
        // Usar diferentes URLs según el tipo
        const directUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        const proxyUrl = `https://drive.usercontent.google.com/download?id=${file.id}&export=view`;
        
        if (isVideo) {
            // Para videos, mostrar un botón de play y abrir en nueva pestaña
            card.innerHTML = `
                <div class="video-placeholder">
                    <i class="fa-solid fa-circle-play" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">${file.name}</p>
                </div>
                <div class="media-overlay">
                    <a href="https://drive.google.com/file/d/${file.id}/view" target="_blank" class="btn btn-primary btn-sm" title="Ver Video">
                        <i class="fa-solid fa-play"></i>
                    </a>
                    <a href="${directUrl}" class="btn btn-secondary btn-sm" title="Descargar" style="margin-left: 0.5rem;">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
        } else {
            // Para imágenes, intentar con el proxy de Google
            card.innerHTML = `
                <img src="${proxyUrl}" alt="${file.name}" class="media-preview" loading="lazy"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'image-error\\'><i class=\\'fa-solid fa-image\\' style=\\'font-size:2rem;color:#666\\'></i><p>${file.name}</p></div>';">
                <div class="media-overlay">
                    <a href="https://drive.google.com/file/d/${file.id}/view" target="_blank" class="btn btn-primary btn-sm" title="Ver">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="${directUrl}" class="btn btn-secondary btn-sm" title="Descargar" style="margin-left: 0.5rem;">
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
