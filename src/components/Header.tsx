import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const user = {
    firstName: 'Іван',
    lastName: 'Петренко',
    email: 'ivan.petrenko@example.com',
  };

  const purchasedTickets = [
    {
      id: 1,
      posterURL: '/img/poster1.jpg',
      movieTitle: 'Інтерстеллар',
      hall: 'Зал 1',
      date: '2025-07-05',
      time: '18:30',
    },
    {
      id: 2,
      posterURL: '/img/poster2.jpg',
      movieTitle: 'Темний Лицар',
      hall: 'Зал 2',
      date: '2025-07-06',
      time: '20:00',
    },
    {
      id: 3,
      posterURL: '/img/poster2.jpg',
      movieTitle: 'Темний Лицар',
      hall: 'Зал 2',
      date: '2025-07-06',
      time: '20:00',
    },
    {
      id: 4,
      posterURL: '/img/poster2.jpg',
      movieTitle: 'Темний Лицар',
      hall: 'Зал 2',
      date: '2025-07-06',
      time: '20:00',
    },
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigate('/');
    e.currentTarget.blur();
  };

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  const handleLogout = () => {
    console.log('Вихід користувача');
    closePanel();
  };

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
          <button className="login-button" onClick={handleLogin} type="button">
            Увійти
          </button>
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
        </div>
      </header>

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
          <p className="user-name">
            {user.firstName} {user.lastName}
          </p>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="panel-content">
          <h3 className="tickets-title">Куплені квитки</h3>
          <div className="ticket-list-container">
            {purchasedTickets.length === 0 ? (
              <p>Квитків немає</p>
            ) : (
              <ul className="ticket-list">
                {purchasedTickets.map((ticket) => (
                  <li key={ticket.id} className="ticket-card">
                    <img
                      src="/img/poster_67d423a91a0a4.jpg"
                      alt={ticket.movieTitle}
                      className="ticket-poster"
                    />
                    <div className="ticket-info">
                      <strong>{ticket.movieTitle}</strong>
                      <div>Зала: {ticket.hall}</div>
                      <div>Дата: {formatDate(ticket.date)}</div>
                      <div>Час: {ticket.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
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
    </>
  );
};

export default Header;
