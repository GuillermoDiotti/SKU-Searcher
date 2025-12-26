/**
 * Furniture SKU Explorer - Main Logic
 */

// CONFIGURACIÓN (REEMPLACE ESTOS VALORES)
const CONFIG = {
    clientId: 'TU_CLIENT_ID_AQUI', // Pon tu Client ID de Google Cloud aquí
    apiKey: 'TU_API_KEY_AQUI',     // Pon tu API Key aquí
};

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Estado
const STATE = {
    accessToken: null,
    tokenClient: null,
    gapiInited: false,
    gisInited: false
};

// Elementos del DOM
const els = {
    authBtn: document.getElementById('auth-btn'),
    authText: document.getElementById('auth-text'),
    searchBtn: document.getElementById('search-btn'),
    skuInput: document.getElementById('sku-input'),
    resultsSection: document.getElementById('results-section'),
    mediaGrid: document.getElementById('media-grid'),
    loader: document.getElementById('loader'),
    statusMessage: document.getElementById('status-message'),
    statusText: document.getElementById('status-text'),
    resultsTitle: document.getElementById('results-title')
};

// --- Inicialización ---

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: CONFIG.apiKey,
            discoveryDocs: [DISCOVERY_DOC],
        });
        STATE.gapiInited = true;
        maybeEnableAuth();
    } catch (err) {
        showStatus('Error al iniciar: Revisa la API Key en el código.', true);
    }
}

function gisLoaded() {
    STATE.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.clientId,
        scope: SCOPES,
        callback: (tokenResponse) => {
            STATE.accessToken = tokenResponse.access_token;
            handleAuthSuccess();
        },
    });
    STATE.gisInited = true;
    maybeEnableAuth();
}

function maybeEnableAuth() {
    if (STATE.gapiInited && STATE.gisInited) {
        els.authBtn.onclick = handleAuthClick;
        els.authText.textContent = 'Ingresar';
        els.authBtn.disabled = false;
    }
}

// --- Event Listeners ---

els.searchBtn.addEventListener('click', handleSearch);
els.skuInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !els.searchBtn.disabled) handleSearch();
});

// --- Autenticación ---

function handleAuthClick() {
    if (STATE.accessToken) return;
    STATE.tokenClient.requestAccessToken({ prompt: 'consent' });
}

function handleAuthSuccess() {
    els.authBtn.classList.replace('btn-secondary', 'btn-primary');
    els.authBtn.innerHTML = '<i class="fa-solid fa-check"></i> Conectado';
    els.authBtn.disabled = true;

    els.skuInput.disabled = false;
    els.searchBtn.disabled = false;
    els.skuInput.focus();

    showStatus('');
}

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
        // 1. Buscar carpeta
        let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${sku}' and trashed = false`;

        const folderResponse = await gapi.client.drive.files.list({
            'pageSize': 1,
            'fields': "nextPageToken, files(id, name)",
            'q': query
        });

        const folders = folderResponse.result.files;

        if (!folders || folders.length === 0) {
            showStatus(`No se encontró carpeta para: "${sku}"`, true);
            els.loader.classList.add('hidden');
            els.searchBtn.disabled = false;
            return;
        }

        const folderId = folders[0].id;
        const folderName = folders[0].name;

        els.resultsTitle.textContent = `SKU: ${folderName}`;

        // 2. Listar archivos
        const filesInit = await gapi.client.drive.files.list({
            'pageSize': 50,
            'fields': "nextPageToken, files(id, name, mimeType, webContentLink, webViewLink, thumbnailLink)",
            'q': `'${folderId}' in parents and trashed = false`
        });

        const files = filesInit.result.files;
        renderResults(files);

    } catch (err) {
        console.error(err);
        showStatus('Error al buscar. Verifica la consola.', true);
    } finally {
        els.loader.classList.add('hidden');
        els.searchBtn.disabled = false;
    }
}

function renderResults(files) {
    els.resultsSection.classList.remove('hidden');

    if (!files || files.length === 0) {
        showStatus('Carpeta vacía.');
        return;
    }

    let count = 0;
    files.forEach(file => {
        const isImage = file.mimeType.startsWith('image/');
        const isVideo = file.mimeType.startsWith('video/');

        if (isImage || isVideo) {
            count++;
            const card = document.createElement('div');
            card.className = 'media-card';

            // Mejorar calidad del thumbnail
            let thumbUrl = file.thumbnailLink;
            if (thumbUrl && isImage) {
                thumbUrl = thumbUrl.replace('=s220', '=s800');
            }

            card.innerHTML = `
                <img src="${thumbUrl || ''}" alt="${file.name}" class="media-preview" loading="lazy">
                <div class="media-overlay">
                    <a href="${file.webContentLink}" target="_blank" class="btn btn-primary btn-sm" title="Descargar">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
            els.mediaGrid.appendChild(card);
        }
    });

    if (count === 0) showStatus('No hay imágenes ni videos.', true);
}

// --- Utilidades ---

function showStatus(msg, isError = false) {
    els.statusMessage.classList.remove('hidden');
    els.statusText.textContent = msg;
    if (!msg) els.statusMessage.classList.add('hidden');

    if (isError) els.statusText.style.color = '#ff6b6b';
    else els.statusText.style.color = 'var(--text-muted)';
}

// Global scope
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
