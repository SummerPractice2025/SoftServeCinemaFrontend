// ScheduleCalendarBlock.tsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/ScheduleCalendarBlock.css';
import CustomSelectGrey from './CustomSelectGrey';
import type { Movie } from './MovieInfoAdmin';

export type Session = {
  time: string;
  title: string;
  hall: string;
  format: '2D' | '3D';
  price: number;
  vipPrice: number;
};

type Props = {
  movie: Movie | null;
  sessionsByDate: Record<string, Record<string, Session[]>>;
  savedSessionsByDate: Record<string, Record<string, Session[]>>;
  onUpdate: (updated: Record<string, Record<string, Session[]>>) => void;
  basePriceStandard: number;
  basePriceVip: number;
};

const hallOptions = ['Зала1', 'Зала2', 'Зала3', 'Зала4', 'Зала5'].map((h) => ({
  value: h,
  label: h,
}));
const formatOptions = ['2D', '3D'].map((f) => ({ value: f, label: f }));

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isDateInPast = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

export default function ScheduleCalendarBlock({
  movie,
  sessionsByDate,
  savedSessionsByDate,
  onUpdate,
  basePriceStandard,
  basePriceVip,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateKey = getLocalDateKey(selectedDate);
  const movieKey = movie?.title || '__unknown__';
  const currentSessions = sessionsByDate[movieKey]?.[dateKey] || [];

  const handleAddSession = () => {
    if (currentSessions.length >= 5) return;

    const newSession: Session = {
      time: '12:00',
      title: movie?.title || 'Назва',
      hall: 'Зала1',
      format: '2D',
      price: basePriceStandard || 120,
      vipPrice: basePriceVip || 180,
    };

    onUpdate({
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: [...currentSessions, newSession],
      },
    });
  };

  const handleDeleteSession = (index: number) => {
    const updated = [...currentSessions];
    updated.splice(index, 1);
    onUpdate({
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: updated,
      },
    });
  };

  const handleSessionChange = (
    index: number,
    updatedSession: Partial<Session>,
  ) => {
    const updated = [...currentSessions];
    updated[index] = { ...updated[index], ...updatedSession };
    onUpdate({
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: updated,
      },
    });
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const key = getLocalDateKey(date);
    const isSelected = key === dateKey;
    const hasSessions = savedSessionsByDate[movieKey]?.[key]?.length > 0;
    const disabled = isDateInPast(date);
    return [
      isSelected ? 'active-day' : '',
      hasSessions ? 'has-sessions' : '',
      disabled ? 'disabled-day' : '',
    ].join(' ');
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const key = getLocalDateKey(date);
      const count = savedSessionsByDate[movieKey]?.[key]?.length || 0;
      const dotsCount = Math.min(count, 5);
      if (dotsCount > 0) {
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 2,
              gap: 3,
            }}
          >
            {[...Array(dotsCount)].map((_, i) => (
              <span
                key={i}
                style={{
                  height: 6,
                  width: 6,
                  borderRadius: '50%',
                  background: '#4caf50',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="calendar-wrapper layout">
      <Calendar
        value={selectedDate}
        onChange={(value) => setSelectedDate(value as Date)}
        tileClassName={tileClassName}
        tileContent={tileContent}
        tileDisabled={({ date }) => isDateInPast(date)}
        locale="uk-UA"
      />

      <div className="session-panel">
        <div className="date-header">
          <span>Сеанси на {selectedDate.toLocaleDateString('uk-UA')}</span>
          {currentSessions.length < 5 && !isDateInPast(selectedDate) && (
            <button className="add-btn" onClick={handleAddSession}>
              +
            </button>
          )}
        </div>

        {currentSessions.map((session, index) => (
          <div key={index} className="session-card">
            <div className="session-row">
              <input
                type="time"
                className="time-input"
                value={session.time}
                onChange={(e) =>
                  handleSessionChange(index, { time: e.target.value })
                }
              />

              <input
                type="text"
                className="movie-title-input"
                value={session.title}
                onChange={(e) =>
                  handleSessionChange(index, { title: e.target.value })
                }
              />

              <CustomSelectGrey
                options={hallOptions}
                value={{ value: session.hall, label: session.hall }}
                onChange={(option) =>
                  handleSessionChange(index, { hall: option.value })
                }
              />

              <CustomSelectGrey
                options={formatOptions}
                value={{ value: session.format, label: session.format }}
                onChange={(option) =>
                  handleSessionChange(index, {
                    format: option.value as '2D' | '3D',
                  })
                }
              />

              <button
                className="delete-btn"
                onClick={() => handleDeleteSession(index)}
                aria-label="Удалити сеанс"
              >
                <img src="/img/trash-icon.png" alt="Удалити" />
              </button>
            </div>

            <div className="price-info">
              <div>
                <span className="label">Стандарт:</span> {session.price}₴
              </div>
              <div>
                <span className="label">VIP:</span> {session.vipPrice}₴
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
