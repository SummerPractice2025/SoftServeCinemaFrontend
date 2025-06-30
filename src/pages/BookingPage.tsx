import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  genres?: string[];
}

interface SessionSummary {
  id: number;
  date: string;
  session_type_id: number;
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

const ADMIN_BEARER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJpYXQiOjE3NTA2MTMxMzQsImV4cCI6MTc1MzIwNTEzNH0.__wtsnfhC2WIVeIVssF_UK_5IyfYHvFu-703CX5EGVA';

const rows = 10;
const seatsPerRow = 10;

const sessionTypeMap: Record<number, string> = {
  1: '2D',
  2: '3D',
  3: 'IMAX',
};

const BookingPage: React.FC = () => {
  const { date, time, format } = useParams<{
    date: string;
    time: string;
    format: string;
  }>();
  const location = useLocation();
  const state = location.state as { movieId?: number; format?: string } | null;
  const movieId = state?.movieId ?? null;
  const sessionFormat = format || state?.format || '2D';
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const [movieInfo, setMovieInfo] = useState<Movie | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [prices, setPrices] = useState({ standard: 60, vip: 120 });

  const normalizeFormat = (fmt: string) =>
    fmt.toLowerCase().replace(/[^a-z0-9]/gi, '');

  useEffect(() => {
    if (!movieId || !backendBaseUrl) return;

    const fetchMovie = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні фільму');
        const data = await res.json();
        console.log('Завантажено дані фільму:', data);
        setMovieInfo(data);
      } catch (err) {
        console.error('Помилка завантаження фільму:', err);
        setMovieInfo(null);
      }
    };

    fetchMovie();
  }, [movieId, backendBaseUrl]);

  useEffect(() => {
    if (!movieId || !date || !time || !sessionFormat || !backendBaseUrl) return;

    const fetchSessions = async () => {
      const startDate = `${date}T00:00:00`;
      const endDate = `${date}T23:59:59`;

      try {
        const res = await fetch(
          `${backendBaseUrl}session/by-movie/${movieId}?start_date=${startDate}&end_date=${endDate}`,
        );
        if (!res.ok) throw new Error('Помилка при завантаженні сесій');
        const data: SessionSummary[] = await res.json();

        console.log('Сирі дані сеансів:', data);

        const foundSession = data.find((s) => {
          const sessionTime = new Date(s.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const sessionType = sessionTypeMap[s.session_type_id] || '2D';

          console.log(
            `Перевірка сесії id=${s.id}:`,
            `sessionTime=${sessionTime} === time=${time}?`,
            sessionTime === time,
            `sessionType=${sessionType} === sessionFormat=${sessionFormat}?`,
            normalizeFormat(sessionType) === normalizeFormat(sessionFormat),
          );

          return (
            sessionTime === time &&
            normalizeFormat(sessionType) === normalizeFormat(sessionFormat)
          );
        });

        console.log('Знайдений сеанс:', foundSession);

        if (foundSession) {
          setSessionId(foundSession.id);
        } else {
          console.warn('Сеанс не знайдено');
        }
      } catch (err) {
        console.error('Помилка при отриманні сеансів:', err);
      }
    };

    fetchSessions();
  }, [movieId, date, time, sessionFormat, backendBaseUrl]);

  useEffect(() => {
    if (!sessionId || !backendBaseUrl) return;

    const fetchSessionDetails = async () => {
      console.log('Отримання деталей сеансу для sessionId:', sessionId);
      try {
        const res = await fetch(`${backendBaseUrl}session/${sessionId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні сеансу');
        const data: SessionDetails = await res.json();
        console.log('Деталі сеансу:', data);
        setSession(data);
        setPrices({ standard: data.price, vip: data.price_VIP });

        const booked = data.seats
          .filter((seat) => seat.is_booked)
          .map((seat) => `R${seat.row}S${seat.col}`);
        setBookedSeats(booked);
      } catch (err) {
        console.error('Помилка при завантаженні сеансу:', err);
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

  const handleBooking = async () => {
    if (!sessionId || !backendBaseUrl) {
      console.error('Сеанс або BACKEND_BASE_URL не визначено');
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Оберіть хоча б одне місце для бронювання');
      return;
    }
    console.log('sessionId перед бронюванням:', sessionId, typeof sessionId);
    const bookingData = selectedSeats.map((seat) => ({
      sessionID: sessionId,
      seatRow: seat.row,
      seatCol: seat.number,
      isVIP: seat.type === 'vip',
    }));

    console.log('Дані для бронювання:', JSON.stringify(bookingData, null, 2));
    try {
      const res = await fetch(`${backendBaseUrl}session/booking`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${ADMIN_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Відповідь при помилці бронювання:', errText);
        throw new Error(`Помилка бронювання: ${errText}`);
      }

      alert('Місця успішно заброньовано!');
      setBookedSeats((prev) => [
        ...prev,
        ...selectedSeats.map((seat) => seat.id),
      ]);
      setSelectedSeats([]);
    } catch (err) {
      console.error('Помилка бронювання:', err);
      alert('Не вдалося забронювати місця. Спробуйте ще раз.');
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="booking-page">
      <div className="main-section">
        <div className="top-block">
          <img
            className="poster"
            src={movieInfo?.posterUrl || '/img/poster_67d423a91a0a4.jpg'}
            alt="Постер"
          />
          <div className="movie-details">
            <h2>{movieInfo?.name || 'Фільм'}</h2>
            <p>Жанр: {movieInfo?.genres?.join(', ') || 'Невідомий'}</p>
            <p>Формат: {sessionFormat}</p>
            <p>Зала: {session?.hall_name || 'Невідома'}</p>
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
                  <div>
                    Ряд {seat.row}, Місце {seat.number}
                  </div>
                  <div className="seat-info">
                    <span className={seat.type === 'vip' ? 'gradient-vip' : ''}>
                      {seat.type === 'vip' ? 'VIP' : 'Стандарт'}
                    </span>
                    <span>{seat.price}₴</span>
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
