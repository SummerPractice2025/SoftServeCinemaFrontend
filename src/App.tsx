// import { Routes, Route } from 'react-router-dom';
// import MovieEditPage from './pages/MovieEditPage';
// import BookingPage from './pages/BookingPage';

// const App = () => {
  // return (
    // <Routes>
    //   <Route path="/" element={<MovieEditPage />} />
    //   <Route
    //     path="/booking-session/:date/:time/:format"
    //     element={<BookingPage />}
    //   />
    // </Routes>
    
//   );
// };

import './styles/globals.css';
// import Header from  './components/Header'
import MovieCarousel from './components/Carusel';

function App() {
  return (

    // <Routes>
    //   <Route path="/" element={<MovieEditPage />} />
    //   <Route
    //     path="/booking-session/:date/:time/:format"
    //     element={<BookingPage />}
    //   />
    // </Routes>
    <div className="min-h-screen">
      {/* <Header/> */}
      <MovieCarousel/>
    </div>
  );
}

export default App;
