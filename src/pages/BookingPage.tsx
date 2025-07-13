import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import CustomAlert from '../components/CustomAlert';
import { useUserData } from '../context/UserDataContext';
import apiService from '../services/api';
import '../styles/BookingPage.css';

interface Seat {
  row: number;
  number: number;
  id: string;
  type: 'standard' | 'vip';
  price: number;
}

interface Movie {
  id: number;
  name: string;
  posterUrl?: string;
  description?: string;
  duration?: number;
  year?: number;
  ageRate?: string;
  rating?: number;
  directors?: string[];
  actors?: string[];
  genres?: string[];
  studios?: string[];
}

interface SeatInfo {
  is_VIP: boolean;
  is_booked: boolean;
  row: number;
  col: number;
}

interface SessionDetails {
  id: number;
  hall_name: string;
  date_time: string;
  price: number;
  price_VIP: number;
  session_type_id: number;
  is_deleted: boolean;
  seats: SeatInfo[];
}

const rows = 10;
const seatsPerRow = 10;

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData } = useUserData();
  const state = location.state as {
    movieId?: number;
    sessionId?: number;
    format?: string;
  } | null;
  const params = useParams<{ format?: string }>();

  const movieId = state?.movieId ?? null;
  const sessionId = state?.sessionId ?? null;
  const sessionFormat = state?.format ?? params.format ?? '';

  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const [movieInfo, setMovieInfo] = useState<Movie | null>(null);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [prices, setPrices] = useState<{ standard: number; vip: number }>({
    standard: 60,
    vip: 120,
  });

  const [customAlert, setCustomAlert] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    if (!movieId || !backendBaseUrl) return;

    const fetchMovie = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні фільму');
        const data = await res.json();
        setMovieInfo({
          id: data.id,
          name: data.name,
          posterUrl: data.posterUrl,
          description: data.description,
          duration: data.duration,
          year: data.year,
          ageRate: data.ageRate,
          rating: data.rating,
          directors: data.directors ?? [],
          actors: data.actors ?? [],
          genres: data.genres ?? [],
          studios: data.studios ?? [],
        });
      } catch (err) {
        setMovieInfo(null);
        setCustomAlert({
          message: 'Не вдалося завантажити фільм',
          type: 'error',
        });
      }
    };

    fetchMovie();
  }, [movieId, backendBaseUrl]);

  useEffect(() => {
    if (!sessionId || !backendBaseUrl) return;

    const fetchSessionDetails = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}session/${sessionId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні сеансу');
        const data: SessionDetails = await res.json();
        setSession(data);

        const booked = data.seats
          .filter((seat) => seat.is_booked)
          .map((seat) => `R${seat.row}S${seat.col}`);
        setBookedSeats(booked);

        setPrices({ standard: data.price, vip: data.price_VIP });
      } catch (err) {
        setCustomAlert({
          message: 'Не вдалося завантажити сеанс',
          type: 'error',
        });
      }
    };

    fetchSessionDetails();
  }, [sessionId, backendBaseUrl]);

  useEffect(() => {
    if (!session) {
      setAllSeats([]);
      return;
    }

    const seats: Seat[] = [];
    const vipRow = rows;

    for (let row = 1; row <= rows; row++) {
      for (let number = 1; number <= seatsPerRow; number++) {
        const id = `R${row}S${number}`;
        const isVip = row === vipRow;
        seats.push({
          row,
          number,
          id,
          type: isVip ? 'vip' : 'standard',
          price: isVip ? prices.vip : prices.standard,
        });
      }
    }

    setAllSeats(seats);
  }, [session, prices]);

  const toggleSeat = (seat: Seat) => {
    if (bookedSeats.includes(seat.id)) return;
    setSelectedSeats((prev) =>
      prev.find((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    );
  };

  const formatDateUkrainian = (isoDate: string): string => {
    const dateObj = new Date(isoDate);
    const dayNames = [
      'неділя',
      'понеділок',
      'вівторок',
      'середа',
      'четвер',
      'пʼятниця',
      'субота',
    ];
    const monthNames = [
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

    const dayName =
      dayNames[dateObj.getDay()].charAt(0).toUpperCase() +
      dayNames[dateObj.getDay()].slice(1);
    const day = dateObj.getDate();
    const monthName = monthNames[dateObj.getMonth()];

    return `${dayName}, ${day} ${monthName}`;
  };

  const handleBooking = async () => {
    if (!sessionId || !session || !backendBaseUrl) {
      setCustomAlert({
        message: 'Недостатньо даних для бронювання',
        type: 'error',
      });
      return;
    }
    if (selectedSeats.length === 0) {
      setCustomAlert({
        message: 'Оберіть хоча б одне місце для бронювання',
        type: 'error',
      });
      return;
    }

    const bookingData = selectedSeats.map((seat) => ({
      sessionID: sessionId,
      seatRow: seat.row,
      seatCol: seat.number,
      isVIP: seat.type === 'vip',
    }));

    try {
      const res = await fetch(`${backendBaseUrl}booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiService.getToken()}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Помилка бронювання: ${errText}`);
      }

      setCustomAlert({
        message: 'Місця успішно заброньовано!',
        type: 'success',
      });

      refreshUserData();

      setBookedSeats((prev) => [
        ...prev,
        ...selectedSeats.map((seat) => seat.id),
      ]);
      setSelectedSeats([]);
    } catch (err) {
      setCustomAlert({
        message: 'Не вдалося забронювати місця. Спробуйте ще раз.',
        type: 'error',
      });
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const displayDate = session?.date_time
    ? formatDateUkrainian(session.date_time)
    : '';
  const displayTime = session?.date_time ? session.date_time.slice(11, 16) : '';

  return (
    <div className="booking-page">
      {customAlert && (
        <CustomAlert
          message={customAlert.message}
          onClose={() => {
            setCustomAlert(null);
            if (customAlert.type === 'success') {
              navigate('/');
            }
          }}
        />
      )}

      <div className="main-section">
        <div className="top-block">
          <img
            className="poster"
            src={movieInfo?.posterUrl || '/img/poster_67d423a91a0a4.jpg'}
            alt="Постер"
            style={{ width: '160px', height: '160px', objectFit: 'cover' }}
          />
          <div className="movie-details">
            <h2>{movieInfo?.name || 'Фільм'}</h2>
            <p>Жанр: {movieInfo?.genres?.join(', ') || 'Невідомий'}</p>
            <p>Формат: {sessionFormat}</p>
            <p>Зала: {session?.hall_name || 'Невідома'}</p>
            <p>
              Сеанс: {displayDate}, о {displayTime}
            </p>
          </div>
        </div>

        <div
          className="seat-section"
          style={{ '--seats-per-row': seatsPerRow } as React.CSSProperties}
        >
          <div className="screen">Екран</div>
          <div className="seat-grid">
            {allSeats.map((seat) => {
              const isBooked = bookedSeats.includes(seat.id);
              return (
                <button
                  key={seat.id}
                  disabled={isBooked}
                  className={`seat-button ${
                    selectedSeats.find((s) => s.id === seat.id)
                      ? 'selected'
                      : ''
                  } ${seat.type === 'vip' ? 'vip' : ''} ${isBooked ? 'booked' : ''}`}
                  onClick={() => toggleSeat(seat)}
                >
                  {isBooked ? '✖' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="order-section">
        <h3>Замовлення</h3>
        <div className="ticket-list-container">
          {selectedSeats.length === 0 ? (
            <p>Місця не обрано</p>
          ) : (
            <ul className="ticket-list">
              {selectedSeats.map((seat) => (
                <li key={seat.id} className="ticket-card">
                  <div className="seat-location">
                    Ряд {seat.row}, Місце {seat.number}
                  </div>
                  <div className="seat-type-price">
                    <span
                      className={`seat-type ${seat.type === 'vip' ? 'gradient-vip' : ''}`}
                    >
                      {seat.type === 'vip' ? 'VIP' : 'Стандарт'}
                    </span>
                    <span className="seat-price">{seat.price}₴</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-actions">
          <button className="continue-button" onClick={handleBooking}>
            Продовжити
          </button>
          <div className="total-price">{totalPrice}₴</div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
