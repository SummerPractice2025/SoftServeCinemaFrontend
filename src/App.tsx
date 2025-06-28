// import { Routes, Route } from 'react-router-dom';
// import MovieEditPage from './pages/MovieEditPage';
// import BookingPage from './pages/BookingPage';
import AddMovies from './pages/AddMovies';

const App = () => {
  return (
    // <Routes>
    //   <Route path="/" element={<MovieEditPage />} />
    //   <Route
    //     path="/booking-session/:date/:time/:format"
    //     element={<BookingPage />}
    //   />
    // </Routes>
    <div style={{ padding: 20 }}>
      <AddMovies />
    </div>
  );
};
export default App;
