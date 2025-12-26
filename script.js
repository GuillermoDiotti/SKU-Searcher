function renderResults(files) {
    els.resultsSection.classList.remove('hidden');

    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'media-card';

        const isVideo = file.type.startsWith('video');
        const directDownload = `https://drive.google.com/uc?export=download&id=${file.id}`;
        const imageUrl = `https://drive.usercontent.google.com/download?id=${file.id}&export=view`;
        
        if (isVideo) {
            card.innerHTML = `
                <div class="video-placeholder">
                    <i class="fa-solid fa-circle-play" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">${file.name}</p>
                </div>
                <div class="media-overlay">
                    <a href="https://drive.google.com/file/d/${file.id}/view" target="_blank" class="btn btn-primary btn-sm" title="Ver Video">
                        <i class="fa-solid fa-play"></i>
                    </a>
                    <a href="${directDownload}" download class="btn btn-secondary btn-sm" title="Descargar" style="margin-left: 0.5rem;">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
        } else {
            card.innerHTML = `
                <img src="${imageUrl}" alt="${file.name}" class="media-preview" loading="lazy"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-error" style="display: none;">
                    <i class="fa-solid fa-image" style="font-size:2rem;color:#666"></i>
                    <p style="margin-top: 0.5rem;">${file.name}</p>
                </div>
                <div class="media-overlay">
                    <a href="https://drive.google.com/file/d/${file.id}/view" target="_blank" class="btn btn-primary btn-sm" title="Ver">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="${directDownload}" download class="btn btn-secondary btn-sm" title="Descargar" style="margin-left: 0.5rem;">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
        }
        
        els.mediaGrid.appendChild(card);
    });
}
