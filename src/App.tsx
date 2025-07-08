import { Routes, Route } from 'react-router-dom';
import MovieEditPage from './pages/MovieEditPage';
import BookingPage from './pages/BookingPage';
import AllMovies from './pages/AllMovies';
import Header from './components/Header';
import AddMovies from './pages/AddMovies';
import RegisterModal from './components/RegisterModal';
import { ModalProvider, useModal } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { UserDataProvider } from './context/UserDataContext';
import AdminRoute from './components/AdminRoute';
import StatisticsPage from './pages/StatisticsPage';

const AppContent = () => {
  const { isRegisterModalOpen, closeRegisterModal } = useModal();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<AllMovies />} />
        <Route
          path="/add"
          element={
            <AdminRoute>
              <AddMovies />
            </AdminRoute>
          }
        />
        <Route path="/movie-info/:movieId" element={<MovieEditPage />} />
        <Route
          path="/booking-session/:date/:time/:format/"
          element={<BookingPage />}
        />
        <Route
          path="/statistics"
          element={
            <AdminRoute>
              <StatisticsPage />
            </AdminRoute>
          }
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
      <AdminProvider>
        <UserDataProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </UserDataProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
