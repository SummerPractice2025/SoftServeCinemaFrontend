import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/ScheduleCalendarBlock.css';
import CustomSelectGrey from './CustomSelectGrey';
import type { Movie } from './MovieInfoAdmin';

export type Session = {
  id?: number;
  time: string;
  title: string;
  hall: string;
  format: '2D' | '3D';
  price: number;
  vipPrice: number;
  is_deleted?: boolean;
};

type Props = {
  movie: Movie | null;
  sessionsByDate: Record<string, Record<string, Session[]>>;
  savedSessionsByDate: Record<string, Record<string, Session[]>>;
  onUpdate: (updated: Record<string, Record<string, Session[]>>) => void;
  basePriceStandard: number;
  basePriceVip: number;
};
const ADMIN_BEARER_TOKEN = '';

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{
    index: number;
    dateKey: string;
  } | null>(null);

  const dateKey = getLocalDateKey(selectedDate);
  const movieKey = movie?.title || '__unknown__';
  const currentSessions = sessionsByDate[movieKey]?.[dateKey] || [];

  console.log('currentSessions при рендері:', currentSessions);

  const visibleSessions = currentSessions.filter((s) => !s.is_deleted);

  const handleAddSession = () => {
    if (visibleSessions.length >= 5) return;

    const newSession: Session = {
      time: '12:00',
      title: movie?.title || 'Назва',
      hall: 'Зала1',
      format: '2D',
      price: basePriceStandard || 120,
      vipPrice: basePriceVip || 180,
    };

    const updatedSessions = [...currentSessions, newSession];
    console.log('Додаємо нову сесію, оновлений список:', updatedSessions);

    onUpdate({
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: updatedSessions,
      },
    });
  };

  const openDeleteModal = (index: number) => {
    const session = visibleSessions[index];
    const realIndex = currentSessions.findIndex(
      (s) => s.time === session.time && !s.is_deleted,
    );

    console.log('openDeleteModal - session для видалення:', session);
    console.log('openDeleteModal - realIndex у currentSessions:', realIndex);

    setSessionToDelete({ index: realIndex, dateKey });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    const updatedSessions = [...currentSessions];
    const session = updatedSessions[sessionToDelete.index];

    console.log('confirmDelete - сесія, яку видаляємо:', session);

    if (!session?.id) {
      console.error('Сеанс не має ID для видалення!');
      return;
    }

    try {
      const response = await fetch(`${backendBaseUrl}session/${session.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ADMIN_BEARER_TOKEN}`,
        },
      });

      if (!response.ok) {
        console.error('Помилка при видаленні сеансу на сервері');
        return;
      }

      updatedSessions[sessionToDelete.index] = {
        ...session,
        is_deleted: true,
      };

      const updatedByMovie = {
        ...sessionsByDate[movieKey],
        [dateKey]: updatedSessions,
      };

      console.log(
        'confirmDelete - оновлені сесії після видалення:',
        updatedByMovie[dateKey],
      );

      onUpdate({
        ...sessionsByDate,
        [movieKey]: updatedByMovie,
      });
    } catch (error) {
      console.error('Помилка при запиті до сервера:', error);
    }

    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const handleSessionChange = (
    index: number,
    updatedSession: Partial<Session>,
  ) => {
    const updated = [...currentSessions];
    updated[index] = { ...updated[index], ...updatedSession };
    console.log('handleSessionChange - оновлені сесії:', updated);
    onUpdate({
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: updated,
      },
    });
  };

  // ...далі без змін (Calendar, рендер сесій, модалки)

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
          {visibleSessions.length < 5 && !isDateInPast(selectedDate) && (
            <button className="add-btn" onClick={handleAddSession}>
              +
            </button>
          )}
        </div>

        {visibleSessions.map((session, index) => (
          <div key={`${session.time}-${index}`} className="session-card">
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
                onClick={() => openDeleteModal(index)}
              >
                <img src="/img/trash-icon.png" alt="Видалити" />
              </button>
            </div>

            <div className="price-info">
              <div className="price-field">
                <span className="label">Стандарт:</span>
                <input
                  type="number"
                  className="price-input-calendar"
                  value={session.price ?? 0}
                  onChange={(e) =>
                    handleSessionChange(index, {
                      price: Number(e.target.value),
                    })
                  }
                  min={0}
                />
                <span className="currency-symbol-calendar">₴</span>
              </div>
              <div className="price-field">
                <span className="label">VIP:</span>
                <input
                  type="number"
                  className="price-input-calendar"
                  value={session.vipPrice ?? 0}
                  onChange={(e) =>
                    handleSessionChange(index, {
                      vipPrice: Number(e.target.value),
                    })
                  }
                  min={0}
                />
                <span className="currency-symbol-calendar">₴</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Ви точно хочете видалити цей сеанс?</h2>
            <div className="modal-buttons">
              <button className="save-btn" onClick={confirmDelete}>
                Так, видалити
              </button>
              <button className="cancel-btn" onClick={cancelDelete}>
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
