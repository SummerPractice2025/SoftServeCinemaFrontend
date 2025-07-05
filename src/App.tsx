import { Routes, Route } from 'react-router-dom';
import MovieEditPage from './pages/MovieEditPage';
import BookingPage from './pages/BookingPage';
import AllMovies from './pages/AllMovies';
import Header from './components/Header';

const App = () => {
  return (

    <>
      <Header />
      <Routes>
        <Route path="/" element={<AllMovies />} />
        <Route path="/movie-info/:movieId" element={<MovieEditPage />} />
        <Route
          path="/booking-session/:date/:time/:format/"
          element={<BookingPage />}
        />
      </Routes>
    </>

  );
};

export default App;
