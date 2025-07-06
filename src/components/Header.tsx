import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useUserData } from '../context/UserDataContext';
import '../styles/Header.css';
import LoginModal from './LoginModal';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { isAdminMode, setIsAdminMode } = useAdmin();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { openRegisterModal } = useModal();
  const { isAuthenticated, login, logout } = useAuth();

  const { userData, refreshTrigger, refreshUserData } = useUserData();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData && !userData.user.is_admin && isAdminMode) {
      setIsAdminMode(false);
    }
  }, [userData, isAdminMode, setIsAdminMode]);

  useEffect(() => {
    if (isPanelOpen) {
      setLoading(true);
      setTimeout(() => setLoading(false), 300);
    }
  }, [isPanelOpen, refreshTrigger]);

  const isUserAuthenticated = apiService.isAuthenticated();

  const handleHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigate('/');
    e.currentTarget.blur();
  };

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogout = async () => {
    try {
      await apiService.signOut();
      logout();
      console.log('Вихід користувача');
      closePanel();
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  const handleAddMovie = () => {
    navigate('/add');
  };

  const isOnAddPage = location.pathname === '/add';

  const shouldHideAdminElements =
    !isUserAuthenticated || !userData?.user.is_admin || !isAdminMode;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const daysShort = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const months = [
      'січня',
      'лютого',
      'березня',
      'квітня',
      'травня',
      'червня',
      'липня',
      'серпня',
      'вересня',
      'жовтня',
      'листопада',
      'грудня',
    ];

    const dayOfWeek = daysShort[date.getDay()];
    const dayOfMonth = date.getDate();
    const monthName = months[date.getMonth()];

    return `${dayOfWeek}, ${dayOfMonth} ${monthName}`;
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button
            className="site-name"
            onClick={handleHome}
            type="button"
            aria-label="На головну"
          >
            <span className="gradient">Softserve</span>Cinema
          </button>
        </div>
        <div className="header-right">
          {!isAuthenticated ? (
            <button
              className="login-button"
              onClick={openLoginModal}
              type="button"
            >
              Вхід
            </button>
          ) : (
            <button
              className="user-button"
              onClick={openPanel}
              type="button"
              aria-label="Панель користувача"
            >
              <img
                src="/img/user.png"
                alt="Іконка користувача"
                className="user-icon"
              />
            </button>
          )}
        </div>
      </header>

      {isLoginModalOpen && <div className="header-dark-overlay" />}

      <div className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
        <button
          className="close-button"
          onClick={closePanel}
          type="button"
          aria-label="Закрити панель"
        >
          &times;
        </button>

        <div className="panel-header">
          {loading ? (
            <p>Завантаження...</p>
          ) : userData ? (
            <>
              <p className="user-name">
                {userData.user.first_name} {userData.user.last_name}
              </p>
              <p className="user-email">{userData.user.email}</p>
              {isUserAuthenticated && userData.user.is_admin && (
                <button
                  className="mode-toggle-button"
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  type="button"
                >
                  {isAdminMode ? 'Режим клієнта' : 'Режим адміністратора'}
                </button>
              )}
            </>
          ) : (
            <p>Дані користувача не знайдено</p>
          )}
        </div>

        <div className="panel-content">
          <h3 className="tickets-title">Куплені квитки</h3>
          <div className="ticket-list-container">
            {loading ? (
              <p>Завантаження квитків...</p>
            ) : userData?.bookings.length === 0 ? (
              <p>Квитків немає</p>
            ) : userData?.bookings ? (
              <ul className="ticket-list">
                {userData.bookings.map((booking, index) => (
                  <li key={index} className="ticket-card">
                    <img
                      src={
                        booking.moviePosterUrl ||
                        '/img/poster_67d423a91a0a4.jpg'
                      }
                      alt={booking.movieName}
                      className="ticket-poster"
                    />
                    <div className="ticket-info">
                      <strong>{booking.movieName}</strong>
                      <div>{booking.description}</div>
                      <div>Дата: {formatDate(booking.date)}</div>
                      <div>Час: {booking.date.slice(11, 16)}</div>
                      <div>
                        Місце: Ряд {booking.seatRow}, Місце {booking.seatCol}{' '}
                        <span
                          className={`vip-status ${booking.isVIP ? 'vip' : 'regular'}`}
                        >
                          {booking.isVIP ? 'VIP' : 'Стандарт'}
                        </span>
                      </div>
                      <div>Зала: {booking.hallID + 1}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Дані про квитки не знайдено</p>
            )}
          </div>
        </div>

        <div className="panel-footer">
          <button
            className="logout-button"
            onClick={handleLogout}
            type="button"
          >
            Вийти
          </button>
        </div>
      </div>

      {isUserAuthenticated && userData?.user.is_admin && (
        <button
          className={`add-button ${isOnAddPage || shouldHideAdminElements ? 'hidden' : ''} ${isPanelOpen ? 'moved' : ''}`}
          onClick={handleAddMovie}
          type="button"
          aria-label="Додати фільм"
        >
          +
        </button>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onRegisterClick={openRegisterModal}
        onLoginSuccess={() => {
          login();
          refreshUserData();
        }}
      />
    </>
  );
};

export default Header;
