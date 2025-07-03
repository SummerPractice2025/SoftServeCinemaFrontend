import { Routes, Route } from 'react-router-dom';
import MovieEditPage from './pages/MovieEditPage';
import BookingPage from './pages/BookingPage';
import AllMovies from './pages/AllMovies';

const App = () => {
  return (
    <Routes>
      {/* Головна сторінка — всі фільми */}
      <Route path="/" element={<AllMovies />} />

      {/* Сторінка редагування фільму, отримує ID з URL */}
      <Route path="/movie-info/:movieId" element={<MovieEditPage />} />

      {/* Сторінка бронювання — як було у твоєму прикладі */}
      <Route
        path="/booking-session/:date/:time/:format/"
        element={<BookingPage />}
      />
    </Routes>

  );
};

export default App;
