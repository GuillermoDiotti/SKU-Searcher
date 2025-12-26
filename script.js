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
                <div class="video-placeholder" onclick="openVideoModal('${file.id}', '${file.name}')">
                    <i class="fa-solid fa-circle-play" style="font-size: 3rem; color: var(--primary-color); cursor: pointer;"></i>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">${file.name}</p>
                </div>
                <div class="media-overlay">
                    <a href="${file.downloadUrl}" download class="btn btn-primary btn-sm" title="Descargar">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `; 
        }
        else {
            // Usar thumbnail base64 si existe, sino placeholder
            const imgSrc = file.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23333" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="white" dy=".3em" font-size="14">Cargando...</text></svg>';
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${file.name}" class="media-preview" loading="lazy" 
                     onclick="openImageModal('${imgSrc}')" style="cursor: zoom-in;">
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


function openVideoModal(fileId, fileName) {
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    window.open(viewUrl, '_blank');
}

function openImageModal(imgSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    modalImg.src = imgSrc;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('image-modal').classList.add('hidden');
}

// Tree Explorer - Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    const loadTreeBtn = document.getElementById('load-tree-btn');
    
    if (loadTreeBtn) {
        loadTreeBtn.addEventListener('click', async function() {
            const btn = this;
            const container = document.getElementById('tree-container');
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando...';
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Cargando estructura...</p>';
            
            try {
                const response = await fetch(`${APPS_SCRIPT_URL}?tree=true`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    container.innerHTML = '';
                    const tree = data.tree;
                    
                    const rootDiv = document.createElement('div');
                    rootDiv.className = 'tree-item tree-level-0';
                    rootDiv.innerHTML = `<i class="fa-solid fa-folder-open"></i> ${tree.name}`;
                    container.appendChild(rootDiv);
                    
                    tree.children.forEach(category => {
                        const categoryDiv = document.createElement('div');
                        categoryDiv.className = 'tree-item tree-level-1';
                        categoryDiv.innerHTML = `<i class="fa-solid fa-folder"></i> ${category.name} <span style="color:var(--text-muted);font-size:0.85rem;">(${category.children.length})</span>`;
                        
                        const skusContainer = document.createElement('div');
                        skusContainer.className = 'tree-collapsed';
                        
                        category.children.forEach(sku => {
                            const skuDiv = document.createElement('div');
                            skuDiv.className = 'tree-item tree-level-2';
                            skuDiv.innerHTML = `<i class="fa-solid fa-cube"></i> ${sku.name}`;
                            
                            skuDiv.addEventListener('click', (e) => {
                                e.stopPropagation();
                                els.skuInput.value = sku.name;
                                handleSearch();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            });
                            
                            skusContainer.appendChild(skuDiv);
                        });
                        
                        categoryDiv.addEventListener('click', () => {
                            skusContainer.classList.toggle('tree-collapsed');
                            const icon = categoryDiv.querySelector('i');
                            icon.className = skusContainer.classList.contains('tree-collapsed') 
                                ? 'fa-solid fa-folder' 
                                : 'fa-solid fa-folder-open';
                        });
                        
                        container.appendChild(categoryDiv);
                        container.appendChild(skusContainer);
                    });
                }
            } catch (error) {
                container.innerHTML = '<p style="color:#ff6b6b;">Error de conexión</p>';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-sync"></i> Recargar';
            }
        });
    }
});

// --- Análisis de SKUs ---

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.createElement('button');
    analyzeBtn.id = 'analyze-btn';
    analyzeBtn.className = 'btn btn-secondary btn-sm';
    analyzeBtn.innerHTML = '<i class="fa-solid fa-chart-simple"></i> Analizar SKUs';
    analyzeBtn.style.marginLeft = '0.5rem';

    const sectionHeader = document.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.appendChild(analyzeBtn);
    }

    analyzeBtn.addEventListener('click', async () => {
        const btn = analyzeBtn;
        const container = document.getElementById('tree-container');
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analizando...';
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Analizando SKUs...</p>';
        
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?analyze=true`);
            const data = await response.json();
            
            if (data.status === 'success') {
                renderAnalysisResults(data.incomplete, container);
            }
        } catch (error) {
            container.innerHTML = '<p style="color:#ff6b6b;">Error en análisis</p>';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-chart-simple"></i> Analizar SKUs';
        }
    });
});

function renderAnalysisResults(incomplete, container) {
    container.innerHTML = '';
    
    if (incomplete.length === 0) {
        container.innerHTML = '<p style="color:#00b894;text-align:center;">✓ Todos los SKUs completos</p>';
        return;
    }
    
    const title = document.createElement('div');
    title.className = 'tree-item tree-level-0';
    title.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> SKUs Incompletos (${incomplete.length})`;
    container.appendChild(title);
    
    incomplete.forEach(sku => {
        const skuDiv = document.createElement('div');
        skuDiv.className = 'tree-item tree-level-2';
        
        const issues = [];
        if (!sku.hasVideo) issues.push('Sin video');
        if (sku.fileCount < 6) issues.push(`${sku.fileCount} archivos`);
        
        skuDiv.innerHTML = `
            <i class="fa-solid fa-exclamation-circle" style="color:#ff6b6b;"></i> 
            ${sku.name} 
            <span style="color:#ff6b6b;font-size:0.85rem;margin-left:0.5rem;">
                (${issues.join(', ')})
            </span>
        `;
        
        skuDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            els.skuInput.value = sku.name;
            handleSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        container.appendChild(skuDiv);
    });
}
