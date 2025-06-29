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

interface SessionSummary {
  id: number;
  date: string;
  sessionType?: { type: string };
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
  seats: SeatInfo[];
}

const rows = 10;
const seatsPerRow = 10;

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

  console.log('REACT_APP_BACKEND_BASE_URL:', backendBaseUrl);

  const [movieInfo, setMovieInfo] = useState<Movie | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [session, setSession] = useState<SessionDetails | null>(null);

  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [prices, setPrices] = useState<{ standard: number; vip: number }>({
    standard: 60,
    vip: 120,
  });

  useEffect(() => {
    if (!movieId) return;
    if (!backendBaseUrl) {
      console.error('BACKEND_BASE_URL не визначено');
      return;
    }

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
        console.error('Помилка завантаження фільму:', err);
        setMovieInfo(null);
      }
    };

    fetchMovie();
  }, [movieId, backendBaseUrl]);

  useEffect(() => {
    if (!movieId || !date || !time || !sessionFormat) return;
    if (!backendBaseUrl) {
      console.error('BACKEND_BASE_URL не визначено');
      return;
    }

    const fetchSessions = async () => {
      const startDate = `${date}T00:00:00`;
      const endDate = `${date}T23:59:59`;

      try {
        const res = await fetch(
          `${backendBaseUrl}session/by-movie/${movieId}?start_date=${startDate}&end_date=${endDate}`,
        );
        if (!res.ok) throw new Error('Помилка при завантаженні сесій');
        const data: SessionSummary[] = await res.json();

        console.log('Сесії для фільму:', data);
        console.log('time з URL:', time);
        console.log('format з URL:', sessionFormat);

        const foundSession = data.find((s: SessionSummary, index: number) => {
          const sessionTime = s.date.slice(11, 16);
          const sessionType = s.sessionType?.type || '2D';

          console.log(`Сеанс ${index}:`, {
            originalDate: s.date,
            sessionTime,
            sessionFormatFromServer: sessionType,
            порівняння:
              sessionTime === time &&
              sessionType.toLowerCase() === sessionFormat.toLowerCase(),
          });

          return (
            sessionTime === time &&
            sessionType.toLowerCase() === sessionFormat.toLowerCase()
          );
        });

        if (foundSession) {
          console.log('Знайдений сеанс:', foundSession);
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
    if (!sessionId) return;
    if (!backendBaseUrl) {
      console.error('BACKEND_BASE_URL не визначено');
      return;
    }

    const fetchSessionDetails = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}session/${sessionId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні сеансу');
        const data: SessionDetails = await res.json();

        setSession(data);

        const booked = data.seats
          .filter((seat: SeatInfo) => seat.is_booked)
          .map((seat: SeatInfo) => `R${seat.row + 1}S${seat.col + 1}`);
        setBookedSeats(booked);

        setPrices({
          standard: data.price,
          vip: data.price_VIP,
        });
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

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

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

    const dayName = capitalize(dayNames[dateObj.getDay()]);
    const day = dateObj.getDate();
    const monthName = monthNames[dateObj.getMonth()];

    return `${dayName}, ${day} ${monthName}`;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const displayDate = session?.date_time
    ? formatDateUkrainian(session.date_time)
    : date
      ? formatDateUkrainian(date)
      : '';
  const displayTime = session?.date_time
    ? session.date_time.slice(11, 16)
    : time || '';

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
                  } ${seat.type === 'vip' ? 'vip' : ''} ${
                    isBooked ? 'booked' : ''
                  }`}
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
          <button className="continue-button">Продовжити</button>
          <div className="total-price">{totalPrice}₴</div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
