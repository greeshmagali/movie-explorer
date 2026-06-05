var API_KEY = "6d2941629287d24de3a286c28abbe7f7";
var IMG_PATH = "https://image.tmdb.org/t/p/w500";
var searchBox = document.getElementById("searchBox");
var moviesContainer = document.getElementById("moviesContainer");
var homeBtn = document.getElementById("homeBtn");
var watchlistBtn = document.getElementById("watchlistBtn");
var trendingMovies = [];
var watchlist = JSON.parse(localStorage.getItem("watchlist")) || []; // if nothing exists yet,watchlist becomes an empty array

function toggleWatchlist(movie) {
    var index = -1;
    for (var i = 0; i < watchlist.length; i++) {
        if (watchlist[i].id === movie.id) {
            index = i;
            break;
        }
    }
    if (index === -1) {
        watchlist.push(movie);
        alert(movie.title + " added to Watchlist!");
    } else {
        watchlist.splice(index, 1);
        alert(movie.title + " removed from Watchlist!");
    }
    localStorage.setItem("watchlist", JSON.stringify(watchlist));

}


function displayMovies(movies) {
    moviesContainer.innerHTML = "";
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        var col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

        var inWatchlist = false;
        for (var j = 0; j < watchlist.length; j++) {
            if (watchlist[j].id === movie.id) {
                inWatchlist = true;
                break;
            }
        }
        var heart = inWatchlist ? "❌" : "❤️";
         function getStars(vote) {
            var stars = Math.round(vote / 2);
            return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        }

        var releaseDate = movie.release_date || 'N/A';

        col.innerHTML =`
            <div class="movie-card">
                <img src="${movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/500x750'}" alt="${movie.title}">
                <div class="movie-info">
                    <strong>${movie.title}</strong><br>
                    ${getStars(movie.vote_average)} | 📅 ${releaseDate}
                <button class="save-btn">${heart}</button>
                <div class="movie-description" style="display:none;">${movie.overview || "No description available"}</div>
            
        `; 
        var btn = col.querySelector(".save-btn");

        btn.addEventListener("click", function(evt) {
            evt.stopPropagation();
            toggleWatchlist(movie);
            this.textContent = watchlist.some(function(m) {
                return m.id === movie.id;
            }) ? "❌" : "❤️";

            if (movies === watchlist) {
                displayMovies(watchlist);
            }
        });

        col.addEventListener("click", function(e) {
            if (e.target.classList && e.target.classList.contains("save-btn")) return;
            var desc = this.querySelector(".movie-description");
            if (desc.style.display === "none") {
                desc.style.display = "block";
            } else {
                desc.style.display = "none";
            }
        });
        moviesContainer.appendChild(col);
    }
}
homeBtn.addEventListener("click", function() {
    displayMovies(trendingMovies);
});

watchlistBtn.addEventListener("click", function() {
    if (watchlist.length === 0) alert("Your watchlist is empty!");
    else {
        displayMovies(watchlist);
    }
});

function getMovies(url, isTrending) {
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (isTrending) {
                trendingMovies = data.results;
            }
            displayMovies(data.results);
        })
        .catch(function(error) {
            console.error("Error fetching movies:", error);
        });
}

getMovies("https://api.themoviedb.org/3/trending/movie/week?api_key=" + API_KEY, true);

searchBox.addEventListener("keyup", function(e) {
    if (e.key === "Enter") {
        var query = searchBox.value.trim();
        if (query) {
            var searchURL = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=" + encodeURIComponent(query);
            getMovies(searchURL, false);
        }
    }
});