import { Routes, Route } from 'react-router-dom';
import MovieEditPage from './pages/MovieEditPage';
import BookingPage from './pages/BookingPage';
import AllMovies from './pages/AllMovies';
import Header from './components/Header';
import AddMovies from './pages/AddMovies';
import RegisterModal from './components/RegisterModal';
import { ModalProvider, useModal } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';

const AppContent = () => {
  const { isRegisterModalOpen, closeRegisterModal } = useModal();

  return (
    <>
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
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
      />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
