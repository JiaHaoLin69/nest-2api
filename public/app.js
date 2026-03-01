// Base endpoints route relative to the same host
const API_MOVIES = '/peliculas';
const API_POKEMON = '/pokemon';

// DOM Elements
const moviesTableBody = document.getElementById('movies-table-body');
const pokemonGrid = document.getElementById('pokemon-grid-container');
const toastContainer = document.getElementById('toast-container');

// Tabs logic
const tabs = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.data-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Load data on first tab visit
        if (targetId === 'movies-section' && !moviesTableBody.innerHTML.trim()) {
            loadMovies();
        } else if (targetId === 'pokemon-section' && !pokemonGrid.innerHTML.trim()) {
            loadPokemon();
        }
    });
});

// Utility to show toasts
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}


/* ========================================================
   MOVIES LOGIC
   ======================================================== */

// Fetch movies
async function fetchMovies(url) {
    document.getElementById('movies-loading').style.display = 'block';
    moviesTableBody.innerHTML = '';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener los datos de películas');

        const data = await response.json();
        renderMovies(data);
    } catch (error) {
        showToast('Error cargando películas: ' + error.message, true);
        console.error(error);
    } finally {
        document.getElementById('movies-loading').style.display = 'none';
    }
}

// Render movies into table
function renderMovies(movies) {
    moviesTableBody.innerHTML = '';

    if (!movies || movies.length === 0) {
        moviesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No se encontraron películas con esos criterios.</td></tr>';
        return;
    }

    movies.forEach(movie => {
        const row = document.createElement('tr');

        const date = movie.fechaEstreno ? new Date(movie.fechaEstreno).toLocaleDateString() : 'N/A';

        row.innerHTML = `
            <td>#${movie.id}</td>
            <td style="font-weight: 600;">${movie.titulo}</td>
            <td>${movie.director}</td>
            <td><span class="pkm-type-badge">${movie.genero}</span></td>
            <td>${date}</td>
            <td>${movie.duracion} min</td>
        `;

        moviesTableBody.appendChild(row);
    });
}

// Initial Load
function loadMovies() {
    fetchMovies(API_MOVIES);
}

// Filter Movies Event Listeners
document.getElementById('movies-filter-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('movie-title').value.trim();
    const fromYear = document.getElementById('movie-year-from').value;
    const toYear = document.getElementById('movie-year-to').value;

    let url = API_MOVIES;

    if (fromYear && toYear) {
        // The db takes simple date strings or years sometimes. Assumes YYYY mapped to 'desde' / 'hasta'. 
        // Since the route expects 'fechas/:desde/:hasta', let's format it to a full date string if needed, 
        // or use the exact string depending on backend impl.
        const start = `${fromYear}-01-01`;
        const end = `${toYear}-12-31`;
        url = `${API_MOVIES}/fechas/${start}/${end}`;
    } else if (title) {
        url = `${API_MOVIES}/titulo/${encodeURIComponent(title)}`;
    }

    fetchMovies(url);
});

document.getElementById('reset-movies').addEventListener('click', () => {
    document.getElementById('movies-filter-form').reset();
    loadMovies();
});


/* ========================================================
   POKEMON LOGIC
   ======================================================== */

const POKE_COLORS = {
    fire: '#ef4444',
    water: '#3b82f6',
    grass: '#10b981',
    electric: '#eab308',
    ice: '#0ea5e9',
    fighting: '#c2410c',
    poison: '#7e22ce',
    ground: '#ca8a04',
    flying: '#94a3b8',
    psychic: '#ec4899',
    bug: '#65a30d',
    rock: '#a16207',
    ghost: '#4338ca',
    dragon: '#6366f1',
    dark: '#1e293b',
    steel: '#64748b',
    fairy: '#f472b6',
    normal: '#a8a29e'
};

function getPokemonColor(typeString) {
    if (!typeString) return POKE_COLORS.normal;
    // Get the first type to determine color
    const type = typeString.split(' ')[0].split(',')[0].toLowerCase();
    return POKE_COLORS[type] || POKE_COLORS.normal;
}

// Fetch pokemon
async function fetchPokemon(url) {
    document.getElementById('pokemon-loading').style.display = 'block';
    pokemonGrid.innerHTML = '';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener los datos de Pokémon');

        const data = await response.json();
        renderPokemon(data);
    } catch (error) {
        showToast('Error cargando Pokémon: ' + error.message, true);
        console.error(error);
    } finally {
        document.getElementById('pokemon-loading').style.display = 'none';
    }
}

// Render pokemon into grid
function renderPokemon(pokemonList) {
    pokemonGrid.innerHTML = '';

    if (!pokemonList || pokemonList.length === 0) {
        pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No se encontraron Pokémon con esos criterios.</div>';
        return;
    }

    pokemonList.forEach(pkm => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';

        const primaryColor = getPokemonColor(pkm.tipo);

        // If animated sprites from showdown exist it would be awesome, else fallback to official artwork by name or ID.
        // We will try an animated sprite from showdown since it's the most premium visual. 
        const spriteUrl = `https://play.pokemonshowdown.com/sprites/ani/${pkm.nombre.toLowerCase()}.gif`;
        const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkm.id}.png`;

        card.innerHTML = `
            <div class="pkm-header">
                <span class="pkm-id">#${String(pkm.id).padStart(3, '0')}</span>
                <span class="pkm-type-badge" style="border-color: ${primaryColor}; color: ${primaryColor}">${pkm.tipo}</span>
            </div>
            
            <div class="pkm-image-container">
                <img src="${spriteUrl}" alt="${pkm.nombre}" onerror="this.onerror=null;this.src='${fallbackUrl}';">
            </div>
            
            <div class="pkm-info">
                <h3>${pkm.nombre}</h3>
                <div class="pkm-stats">
                    <!-- HP -->
                    <div class="stat-row">
                        <span class="stat-label">PV</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill hp" style="width: ${Math.min((pkm.hp / 255) * 100, 100)}%"></div></div>
                        <span class="stat-val">${pkm.hp}</span>
                    </div>
                    <!-- Attack -->
                    <div class="stat-row">
                        <span class="stat-label">Ataque</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill atk" style="width: ${Math.min((pkm.ataque / 255) * 100, 100)}%"></div></div>
                        <span class="stat-val">${pkm.ataque}</span>
                    </div>
                    <!-- Defense -->
                    <div class="stat-row">
                        <span class="stat-label">Defensa</span>
                        <div class="stat-bar-bg"><div class="stat-bar-fill def" style="width: ${Math.min((pkm.defensa / 255) * 100, 100)}%"></div></div>
                        <span class="stat-val">${pkm.defensa}</span>
                    </div>
                </div>
            </div>
        `;

        // Add subtle accent to border based on type
        card.style.borderBottom = `4px solid ${primaryColor}`;

        pokemonGrid.appendChild(card);
    });
}


// Filter Pokemon Event Listeners
document.getElementById('pokemon-filter-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('pokemon-name').value.trim();
    const type = document.getElementById('pokemon-type').value.trim();
    const hp = document.getElementById('pokemon-hp').value;

    let url = API_POKEMON;

    // Simple logic prioritizing one filter at a time for this exercise
    if (hp) {
        url = `${API_POKEMON}/hp/${encodeURIComponent(hp)}`;
    } else if (type) {
        url = `${API_POKEMON}/tipo/${encodeURIComponent(type)}`;
    } else if (name) {
        url = `${API_POKEMON}/nombre/${encodeURIComponent(name)}`;
    }

    fetchPokemon(url);
});

document.getElementById('reset-pokemon').addEventListener('click', () => {
    document.getElementById('pokemon-filter-form').reset();
    fetchPokemon(API_POKEMON);
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Start by loading movies (first tab active)
    loadMovies();
});
