// BELLASTREAM - Main Application JavaScript
// ©2026 | Powered by Rodgers

// API Configuration
const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const VIDSRC_PRO = 'https://vidsrc.pro/embed';

// State Management
let favorites = JSON.parse(localStorage.getItem('bellastream_favorites')) || [];
let currentMovie = null;
let currentQuality = '1080p';
let searchTimeout = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 BELLASTREAM Initializing...');
    fetchTrending();
    fetchPopular();
    fetchTopRated();
    fetchUpcoming();
    fetchGenres();
    updateFavoritesDisplay();
    setupEventListeners();
    console.log('✅ BELLASTREAM Ready!');
});

// Event Listeners Setup
function setupEventListeners() {
    window.addEventListener('scroll', handleScroll);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeContactModal();
        if (e.target.classList.contains('player-modal')) closePlayer();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayer();
            closeContactModal();
        }
    });
}

// Header Scroll Effect
function handleScroll() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Contact Modal Functions
function openContactModal() {
    document.getElementById('contactModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    document.getElementById('contactModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openWhatsApp(type) {
    let url;
    const message = encodeURIComponent('Hello! I found BELLASTREAM and would like to get in touch.');
    
    switch(type) {
        case 'manager':
            url = `https://wa.me/254755660053?text=${message}`;
            break;
        case 'ceo':
            url = `https://wa.me/923440242439?text=${message}`;
            break;
        case 'channel':
            url = 'https://whatsapp.com/channel/0029VbBR3ib3LdQQlEG3vd1x';
            break;
    }
    
    window.open(url, '_blank');
    closeContactModal();
}

// Random Viewer Count Generator
function getRandomViewers() {
    return Math.floor(Math.random() * 50000) + 1000;
}

// API Fetch Functions
async function fetchTrending() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=1`);
        const data = await response.json();
        displayMovies(data.results.slice(0, 12), 'trendingGrid', true);
    } catch (error) {
        console.error('Error fetching trending:', error);
        showError('trendingGrid', 'Failed to load trending movies');
    }
}

async function fetchPopular() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
        const data = await response.json();
        displayMovies(data.results.slice(0, 12), 'popularGrid');
    } catch (error) {
        console.error('Error fetching popular:', error);
    }
}

async function fetchTopRated() {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`);
        const data = await response.json();
        displayMovies(data.results.slice(0, 12), 'topratedGrid');
    } catch (error) {
        console.error('Error fetching top rated:', error);
    }
}

async function fetchUpcoming() {
    try {
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=1`);
        const data = await response.json();
        displayMovies(data.results.slice(0, 12), 'upcomingGrid');
    } catch (error) {
        console.error('Error fetching upcoming:', error);
    }
}

async function fetchGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
        const data = await response.json();
        displayGenreTabs(data.genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

async function fetchByGenre(genreId, element) {
    try {
        if (element) {
            document.querySelectorAll('.genre-tab').forEach(tab => tab.classList.remove('active'));
            element.classList.add('active');
        }

        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=1`);
        const data = await response.json();
        displayMovies(data.results.slice(0, 12), 'genreGrid');
    } catch (error) {
        console.error('Error fetching by genre:', error);
    }
}

// Search Functionality
function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        showHome();
        return;
    }
    
    searchTimeout = setTimeout(() => performSearch(query), 500);
}

async function performSearch(query) {
    try {
        document.getElementById('popular').style.display = 'none';
        document.getElementById('toprated').style.display = 'none';
        document.getElementById('upcoming').style.display = 'none';
        document.getElementById('genres').style.display = 'none';
        
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await response.json();
        
        const trendingSection = document.getElementById('trending');
        const header = trendingSection.querySelector('.section-title');
        header.innerHTML = `Search Results for "${query}"`;
        
        if (data.results.length > 0) {
            displayMovies(data.results, 'trendingGrid');
        } else {
            document.getElementById('trendingGrid').innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 64px; margin-bottom: 20px;">🔍</div>
                    <h3>No results found</h3>
                    <p>Try searching with different keywords</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error searching:', error);
    }
}

// Display Functions
function displayGenreTabs(genres) {
    const container = document.getElementById('genreTabs');
    container.innerHTML = genres.slice(0, 12).map((genre, index) => `
        <div class="genre-tab ${index === 0 ? 'active' : ''}" onclick="fetchByGenre(${genre.id}, this)">
            ${genre.name}
        </div>
    `).join('');
    
    if (genres.length > 0) fetchByGenre(genres[0].id);
}

function displayMovies(movies, containerId, showViewers = false) {
    const container = document.getElementById(containerId);
    
    if (!movies || movies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 20px;">🎬</div>
                <h3>No movies available</h3>
                <p>Check back later for updates</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = movies.map(movie => {
        const isFavorite = favorites.some(fav => fav.id === movie.id);
        const viewers = showViewers ? getRandomViewers() : null;
        const posterUrl = movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/200x300/1a1a1a/ffffff?text=No+Image';
        
        return `
            <div class="movie-card" onclick="openPlayer(${movie.id})">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite(${movie.id})" 
                        data-movie-id="${movie.id}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <div class="movie-info">
                    <div class="movie-title" title="${movie.title}">${movie.title}</div>
                    <div class="movie-meta">
                        <span class="rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        ${showViewers ? `<span class="viewers">👁️ ${viewers.toLocaleString()}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Favorites Management
async function toggleFavorite(movieId) {
    const index = favorites.findIndex(fav => fav.id === movieId);
    const btns = document.querySelectorAll(`[data-movie-id="${movieId}"]`);
    
    if (index > -1) {
        favorites.splice(index, 1);
        btns.forEach(btn => {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        });
    } else {
        try {
            const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
            const movie = await response.json();
            favorites.push(movie);
            btns.forEach(btn => {
                btn.classList.add('active');
                btn.innerHTML = '❤️';
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return;
        }
    }
    
    localStorage.setItem('bellastream_favorites', JSON.stringify(favorites));
    updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
    const container = document.getElementById('favoritesGrid');
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 20px;">❤️</div>
                <h3>No favorites yet!</h3>
                <p>Click the heart icon on any movie to add it here.</p>
            </div>
        `;
    } else {
        displayMovies(favorites, 'favoritesGrid');
    }
}

// Player Functions
async function openPlayer(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
        const movie = await response.json();
        currentMovie = movie;
        
        document.getElementById('playerTitle').textContent = movie.title;
        document.getElementById('playerDescription').textContent = movie.overview || 'No description available.';
        document.getElementById('playerRating').textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        document.getElementById('playerYear').textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        document.getElementById('playerViewers').textContent = getRandomViewers().toLocaleString();
        
        const isFavorite = favorites.some(fav => fav.id === movieId);
        document.getElementById('playerFavoriteIcon').textContent = isFavorite ? '❤️' : '🤍';
        document.getElementById('favoriteText').textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        
        loadVideo(movie);
        
        document.getElementById('playerModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error opening player:', error);
        alert('Failed to load movie. Please try again.');
    }
}

function loadVideo(movie) {
    const videoFrame = document.getElementById('videoFrame');
    const streamUrl = `${VIDSRC_PRO}/movie/${movie.id}`;
    videoFrame.src = streamUrl;
}

function closePlayer() {
    document.getElementById('playerModal').classList.remove('active');
    document.getElementById('videoFrame').src = '';
    document.body.style.overflow = 'auto';
    currentMovie = null;
}

function changeQuality(quality) {
    currentQuality = quality;
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.quality === quality) btn.classList.add('active');
    });
    showNotification(`Quality set to ${quality}`);
}

function toggleFavoriteFromPlayer() {
    if (currentMovie) {
        toggleFavorite(currentMovie.id);
        const isFavorite = favorites.some(fav => fav.id === currentMovie.id);
        document.getElementById('playerFavoriteIcon').textContent = isFavorite ? '❤️' : '🤍';
        document.getElementById('favoriteText').textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    }
}

// Navigation Functions
function showHome() {
    document.getElementById('searchInput').value = '';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('favoritesSection').style.display = 'none';
    document.getElementById('popular').style.display = 'block';
    document.getElementById('toprated').style.display = 'block';
    document.getElementById('upcoming').style.display = 'block';
    document.getElementById('genres').style.display = 'block';
    
    const trendingSection = document.getElementById('trending');
    const header = trendingSection.querySelector('.section-title');
    header.innerHTML = '<span class="trending-badge">🔥 Trending Now</span>';
    
    fetchTrending();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFavorites() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('favoritesSection').style.display = 'block';
    updateFavoritesDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Utility Functions
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
            <h3>Oops!</h3>
            <p>${message}</p>
        </div>
    `;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(229, 9, 20, 0.95);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function shareMovie() {
    if (currentMovie) {
        const shareData = {
            title: currentMovie.title,
            text: `Watch ${currentMovie.title} on BELLASTREAM!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(err => console.log('Share failed:', err));
        } else {
            navigator.clipboard.writeText(window.location.href);
            showNotification('Link copied to clipboard!');
        }
    }
}

function reportIssue() {
    const message = currentMovie ? `I want to report an issue with: ${currentMovie.title}` : 'I want to report an issue';
    const url = `https://wa.me/254755660053?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Console Branding
console.log('%c🎬 BELLASTREAM', 'color: #e50914; font-size: 24px; font-weight: bold;');
console.log('%c©2026 | Powered by Rodgers', 'color: #ffd700; font-size: 14px;');
