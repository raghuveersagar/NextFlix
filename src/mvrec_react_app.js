import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, Play, Heart } from 'lucide-react';


const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const API_BASE = "http://ec2-3-138-181-227.us-east-2.compute.amazonaws.com:3000/api/movies";

export default function MvRecApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/trending`);
      console.log(response);
      const data = await response.json();
      setTrending(data.results || []);
      setActiveTab('trending');
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
    setLoading(false);
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setMovies(data.results || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching movies:', error);
    }
    setLoading(false);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMovies();
    }
  };

  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    try {
      const [detailsRes, recsRes] = await Promise.all([
        fetch(`${API_BASE}/movies/${movieId}`),
        fetch(`${API_BASE}/movies/${movieId}/recommendations`)
      ]);
      const details = await detailsRes.json();
      const recs = await recsRes.json();
      
      setSelectedMovie(details);
      setRecommendations(recs.results || []);
      setActiveTab('details');
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
    setLoading(false);
  };

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === movie.id);
      if (exists) {
        return prev.filter(f => f.id !== movie.id);
      }
      return [...prev, movie];
    });
  };

  const isFavorite = (movieId) => favorites.some(f => f.id === movieId);

  const MovieCard = ({ movie, onClick }) => (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
      onClick={() => onClick(movie.id)}
    >
      <div className="relative">
        <img 
          src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(movie);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite(movie.id) ? 'bg-red-500' : 'bg-black/50'
          } hover:bg-red-600 transition-colors`}
        >
          <Heart size={20} fill={isFavorite(movie.id) ? 'white' : 'none'} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{movie.release_date?.split('-')[0]}</span>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" fill="currentColor" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const MovieDetails = () => (
    <div className="space-y-8">
      <button
        onClick={() => setActiveTab('trending')}
        className="text-purple-400 hover:text-purple-300 mb-4"
      >
        ← Back to Movies
      </button>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <img 
            src={selectedMovie.poster_path ? `${TMDB_IMAGE_BASE}${selectedMovie.poster_path}` : 'https://via.placeholder.com/500x750'}
            alt={selectedMovie.title}
            className="w-full rounded-lg shadow-2xl"
          />
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{selectedMovie.title}</h1>
            <p className="text-gray-400">{selectedMovie.tagline}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400" fill="currentColor" />
              <span className="text-2xl font-bold">{selectedMovie.vote_average?.toFixed(1)}</span>
              <span className="text-gray-400">/ 10</span>
            </div>
            <span className="text-gray-400">{selectedMovie.release_date?.split('-')[0]}</span>
            <span className="text-gray-400">{selectedMovie.runtime} min</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedMovie.genres?.map(genre => (
              <span key={genre.id} className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                {genre.name}
              </span>
            ))}
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">Overview</h2>
            <p className="text-gray-300 leading-relaxed">{selectedMovie.overview}</p>
          </div>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
              <Play size={20} />
              Watch Trailer
            </button>
            <button 
              onClick={() => toggleFavorite(selectedMovie)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isFavorite(selectedMovie.id) 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Heart size={20} fill={isFavorite(selectedMovie.id) ? 'white' : 'none'} />
              {isFavorite(selectedMovie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
      
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.slice(0, 10).map(movie => (
              <MovieCard key={movie.id} movie={movie} onClick={fetchMovieDetails} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎬</div>
              <h1 className="text-3xl font-bold">MvRec</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('favorites')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Heart size={20} />
                <span>Favorites ({favorites.length})</span>
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search for movies..."
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-300"
              />
            </div>
            <button
              onClick={searchMovies}
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={fetchTrending}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'trending' 
                  ? 'border-purple-500 text-purple-400' 
                  : 'border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                Trending
              </div>
            </button>
            {activeTab === 'search' && (
              <button
                className="py-4 px-2 border-b-2 border-purple-500 text-purple-400"
              >
                Search Results
              </button>
            )}
            {activeTab === 'favorites' && (
              <button
                className="py-4 px-2 border-b-2 border-purple-500 text-purple-400"
              >
                My Favorites
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : activeTab === 'details' && selectedMovie ? (
          <MovieDetails />
        ) : activeTab === 'favorites' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Favorites</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Heart size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">No favorites yet</p>
                <p>Start adding movies to your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {favorites.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onClick={fetchMovieDetails} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {activeTab === 'search' ? 'Search Results' : 'Trending Movies'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {(activeTab === 'search' ? movies : trending).map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={fetchMovieDetails} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">
          <p>MvRec - Discover Your Next Favorite Movie</p>
          <p className="text-sm mt-2">Powered by The Movie Database (TMDB)</p>
        </div>
      </footer>
    </div>
  );
}