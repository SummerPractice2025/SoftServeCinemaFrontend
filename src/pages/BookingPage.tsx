import { useParams } from 'react-router-dom';
import { useState } from 'react';
import '../styles/BookingPage.css';

interface Seat {
  row: number;
  number: number;
  id: string;
  type: 'standard' | 'vip';
  price: number;
}

const rows = 12;
const seatsPerRow = 12;

const generateSeats = (): Seat[] => {
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
        price: isVip ? 120 : 60,
      });
    }
  }

  return seats;
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const formatDateUkrainian = (isoDate: string): string => {
  const date = new Date(isoDate);

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

  const dayName = capitalize(dayNames[date.getDay()]);
  const day = date.getDate();
  const monthName = monthNames[date.getMonth()];

  return `${dayName}, ${day} ${monthName}`;
};

const BookingPage = () => {
  const { date, time, format } = useParams();
  const allSeats = generateSeats();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const toggleSeat = (seat: Seat) => {
    setSelectedSeats((prev) =>
      prev.find((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    );
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const formattedDate = date ? formatDateUkrainian(date) : '';

  return (
    <div className="booking-page">
      <div className="main-section">
        <div className="top-block">
          <img
            className="poster"
            src="/img/poster_67d423a91a0a4.jpg"
            alt="Постер"
          />
          <div className="movie-details">
            <h2>Формула1</h2>
            <p>Жанр: Романтика, Комедія</p>
            <p>Формат: {format}</p>
            <p>Зала 1</p>
            <p>
              Сеанс: {formattedDate}, о {time}
            </p>
          </div>
        </div>

        <div
          className="seat-section"
          style={{ '--seats-per-row': seatsPerRow } as React.CSSProperties}
        >
          <div className="screen">Екран</div>
          <div className="seat-grid">
            {allSeats.map((seat) => (
              <button
                key={seat.id}
                className={`seat-button ${selectedSeats.find((s) => s.id === seat.id) ? 'selected' : ''} ${seat.type === 'vip' ? 'vip' : ''}`}
                onClick={() => toggleSeat(seat)}
              />
            ))}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      marginTop: '4px',
                    }}
                  >
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
