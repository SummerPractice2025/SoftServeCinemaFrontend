import { Routes, Route } from 'react-router-dom';
import MovieEditPage from './pages/MovieEditPage';
import BookingPage from './pages/BookingPage';
import AllMovies from './pages/AllMovies';
import Header from './components/Header';
import AddMovies from './pages/AddMovies';
import { AdminProvider } from './contexts/AdminContext';

const App = () => {
  return (
    <AdminProvider>
      <Header />
      <Routes>
        <Route path="/" element={<AllMovies />} />
        <Route path="/add" element={<AddMovies />} />
        <Route path="/movie-info/:movieId" element={<MovieEditPage />} />
        <Route
          path="/booking-session/:date/:time/:format/"
          element={<BookingPage />}
        />
      </Routes>
    </AdminProvider>
  );
};

export default App;
