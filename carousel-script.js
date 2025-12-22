// Carousel State
let currentIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// Initialize Carousel
/**
 * Generates the HTML for a single slide based on its content type.
 */
function createSlideHTML(slide) {
    const isTextSlide = slide.bullets && Array.isArray(slide.bullets);
    
    // 1. Logic for Text-Only Slides (Unified look)
    if (isTextSlide) {
        return `
            <div class="text-slide-content">
                <h3>${slide.title || ''}</h3>
                <ul class="bullet-list">
                    ${slide.bullets.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>`;
    }

    // 2. Logic for Media Slides (Embeds, Grids, or Single Images)
    let mediaHTML = '';
    
    if (slide.embed) {
        mediaHTML = `<div class="embed-slide-content">${slide.embed}</div>`;
    } 
    else if (slide.images && slide.images.length > 1) {
        mediaHTML = `
            <div class="image-grid">
                ${slide.images.map(img => `
                    <div class="grid-item">
                        <img src="${img}" class="grid-photo zoomable">
                    </div>`).join('')}
            </div>`;
    } 
    else {
        const imgSrc = slide.image || (slide.images && slide.images[0]);
        mediaHTML = imgSrc ? `<img src="${imgSrc}" class="carousel-image zoomable">` : '';
    }

    // Return media + the standard caption footer
    return `
        ${mediaHTML}
        <div class="slide-caption">
            <h3>${slide.title || ''}</h3>
            <p>${slide.caption || ''}</p> 
        </div>`;
}

/**
 * Main function to build the carousel
 */
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('dotsContainer');
    const totalSlidesEl = document.getElementById('totalSlides');

    if (!track || !dotsContainer) return;

    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    projectSlides.forEach((slide, index) => {
        // Create Slide Element
        const slideEl = document.createElement('div');
        slideEl.className = 'carousel-slide';
        slideEl.innerHTML = createSlideHTML(slide);
        track.appendChild(slideEl);

        // Create Dot Element
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    if (totalSlidesEl) totalSlidesEl.textContent = projectSlides.length;
    updateCarousel();
}
/**
 * Zoom Logic using Event Delegation
 * This listens for clicks on any element with the 'zoomable' class
 */
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('zoomable')) {
        openZoom(e.target.src);
    }
});

function openZoom(src) {
    // Check if an overlay already exists to prevent duplicates
    if (document.getElementById('zoomOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'zoomOverlay';
    overlay.innerHTML = `
        <span class="zoom-close">&times;</span>
        <img src="${src}" class="zoom-img">
    `;
    document.body.appendChild(overlay);
    overlay.style.display = 'flex';

    // Close when clicking the background or the 'X'
    overlay.onclick = function (e) {
        if (e.target.classList.contains('zoom-img')) return; // Don't close if clicking the photo itself
        overlay.remove();
    };
}

function moveSlide(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = projectSlides.length - 1;
    else if (currentIndex >= projectSlides.length) currentIndex = 0;
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.dot');
    const currentSlideEl = document.getElementById('currentSlide');

    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
    currentSlideEl.textContent = currentIndex + 1;
}

// Touch Handlers
function handleTouchStart(e) { 
    touchStartX = e.changedTouches[0].screenX; 
}

function handleTouchEnd(e) { 
    touchEndX = e.changedTouches[0].screenX; 
    handleSwipe(); 
}

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) moveSlide(1);
        else moveSlide(-1);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    
    const track = document.getElementById('carouselTrack');
    track.addEventListener('touchstart', handleTouchStart, false);
    track.addEventListener('touchend', handleTouchEnd, false);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') moveSlide(-1);
        if (e.key === 'ArrowRight') moveSlide(1);
        if (e.key === 'Escape') {
            const overlay = document.getElementById('zoomOverlay');
            if (overlay) overlay.remove();
        }
    });
});