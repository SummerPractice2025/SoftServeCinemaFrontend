import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/ScheduleCalendarBlock.css';
import CustomSelectGrey from './CustomSelectGrey';
import { SquarePen } from 'lucide-react';
import CustomAlert from './CustomAlert';
import type { Movie } from './MovieInfoAdmin';
import apiService from '../services/api';
import { useUserData } from '../context/UserDataContext';
import { createPortal } from 'react-dom';

export type Session = {
  id?: number;
  time: string;
  title: string;
  hallId: string;
  formatId: string;
  price: number;
  vipPrice: number;
  is_deleted?: boolean;
};

type Props = {
  movie: Movie | null;
  sessionsByDate: Record<string, Record<string, Session[]>>;
  savedSessionsByDate: Record<string, Record<string, Session[]>>;
  onUpdate: (updated: Record<string, Record<string, Session[]>>) => void;
  onSavedUpdate?: (updated: Record<string, Record<string, Session[]>>) => void;
  basePriceStandard: number;
  basePriceVip: number;
};

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

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

function DeleteSessionModal({
  open,
  bookingCount,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  bookingCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <h2>Ви точно хочете видалити цей сеанс?</h2>
        {bookingCount && bookingCount > 0 ? (
          <p className="booking-warning">
            У цьому сеансі вже {bookingCount} куплених квитків!
          </p>
        ) : bookingCount === 0 ? (
          <p
            style={{
              color: '#4caf50',
              fontSize: '14px',
              margin: '10px 0',
              fontWeight: 'bold',
            }}
          >
            У цьому сеансі немає куплених квитків
          </p>
        ) : null}
        <div className="modal-buttons">
          {(!bookingCount || bookingCount === 0) && (
            <button className="save-btn" onClick={onConfirm}>
              Так, видалити
            </button>
          )}
          <button className="cancel-btn" onClick={onCancel}>
            Скасувати
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ScheduleCalendarBlock({
  movie,
  sessionsByDate,
  savedSessionsByDate,
  onUpdate,
  onSavedUpdate,
  basePriceStandard,
  basePriceVip,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{
    index: number;
    dateKey: string;
    bookingCount?: number;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [editingField, setEditingField] = useState<{
    sessionIndex: number;
    field: keyof Session;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const { refreshUserData } = useUserData();

  const [hallOptions, setHallOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [formatOptions, setFormatOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    async function fetchOptions() {
      const hallsRes = await fetch(`${backendBaseUrl}halls`);
      const halls = await hallsRes.json();
      setHallOptions(
        halls.map((h: { id: number; name: string }) => ({
          value: String(h.id),
          label: h.name,
        })),
      );
      const typesRes = await fetch(`${backendBaseUrl}session/types`);
      const types = await typesRes.json();
      setFormatOptions(
        types.map((t: { id: number; type: string }) => ({
          value: String(t.id),
          label: t.type,
        })),
      );
    }
    fetchOptions();
  }, [backendBaseUrl]);

  const startEditing = (
    sessionIndex: number,
    field: keyof Session,
    currentValue: string | number | undefined,
  ) => {
    setEditingField({ sessionIndex, field });
    if (typeof currentValue === 'number') {
      setTempValue(currentValue.toString());
    } else if (typeof currentValue === 'string') {
      setTempValue(currentValue);
    } else {
      setTempValue('');
    }
  };

  const finishEditing = () => {
    if (editingField && editingField.sessionIndex < currentSessions.length) {
      const session = currentSessions[editingField.sessionIndex];
      let updatedValue: string | number = tempValue;

      if (editingField.field === 'price' || editingField.field === 'vipPrice') {
        updatedValue = Number(tempValue);

        const minPrice = 0.1;
        if (updatedValue < minPrice) {
          const fieldName =
            editingField.field === 'price' ? 'стандартного місця' : 'VIP місця';
          setAlertMessage(
            `Мінімальна ціна для ${fieldName} повинна бути не менше ${minPrice}₴`,
          );
          setEditingField(null);
          setTempValue('');
          return;
        }
      } else if (editingField.field === 'formatId') {
        updatedValue = Number(tempValue);
      }

      const updatedSession = { ...session, [editingField.field]: updatedValue };
      handleSessionChange(editingField.sessionIndex, updatedSession);
    }
    setEditingField(null);
    setTempValue('');
  };

  const dateKey = getLocalDateKey(selectedDate);
  const movieKey = movie?.title || '__unknown__';
  const currentSessions = sessionsByDate[movieKey]?.[dateKey] || [];
  const visibleSessions = currentSessions.filter((s) => !s.is_deleted);

  const handleAddSession = () => {
    if (visibleSessions.length >= 5) return;
    const lastHallId =
      currentSessions.length > 0
        ? currentSessions[currentSessions.length - 1].hallId
        : (hallOptions[0]?.value ?? '1');
    const defaultHallId = lastHallId;
    const defaultFormatId = formatOptions[0]?.value ?? '1';

    const minPrice = 0.1;
    const standardPrice = Math.max(basePriceStandard || 120, minPrice);
    const vipPrice = Math.max(basePriceVip || 180, minPrice);

    const newSession: Session = {
      time: '12:00',
      title: movie?.title || 'Назва',
      hallId: defaultHallId,
      formatId: defaultFormatId,
      price: standardPrice,
      vipPrice: vipPrice,
    };
    const updatedSessions = [...currentSessions, newSession];
    const updatedSessionsByDate = {
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: updatedSessions,
      },
    };
    onUpdate(updatedSessionsByDate);
    onSavedUpdate?.(updatedSessionsByDate);
  };

  const openDeleteModal = async (index: number) => {
    const session = visibleSessions[index];
    const realIndex = currentSessions.findIndex(
      (s) => s.time === session.time && !s.is_deleted,
    );

    let bookingCount = 0;
    if (session.id) {
      try {
        const response = await fetch(`${backendBaseUrl}session/${session.id}`);
        if (response.ok) {
          const data = await response.json();
          bookingCount = data.bookings_count || 0;
        }
      } catch (error) {}
    }
    setSessionToDelete({ index: realIndex, dateKey, bookingCount });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    const updatedSessions = [...currentSessions];
    const session = updatedSessions[sessionToDelete.index];

    if (session?.id) {
      try {
        const response = await fetch(`${backendBaseUrl}session/${session.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiService.getToken()}`,
          },
        });

        if (!response.ok) {
          setAlertMessage('Помилка при видаленні сеансу на сервері');
          return;
        }

        updatedSessions[sessionToDelete.index] = {
          ...session,
          is_deleted: true,
        };
      } catch (error) {
        setAlertMessage('Помилка мережі при видаленні сеансу');
        return;
      }
    } else {
      updatedSessions.splice(sessionToDelete.index, 1);
    }

    const updatedByMovie = {
      ...sessionsByDate[movieKey],
      [dateKey]: updatedSessions,
    };

    const updatedSessionsByDate = {
      ...sessionsByDate,
      [movieKey]: updatedByMovie,
    };

    onUpdate(updatedSessionsByDate);
    onSavedUpdate?.(updatedSessionsByDate);

    setShowDeleteModal(false);
    setSessionToDelete(null);
    refreshUserData();
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

    const minPrice = 0.1;
    if (updatedSession.price !== undefined && updatedSession.price < minPrice) {
      setAlertMessage(
        `Мінімальна ціна для стандартного місця повинна бути не менше ${minPrice}₴`,
      );
      return;
    }
    if (
      updatedSession.vipPrice !== undefined &&
      updatedSession.vipPrice < minPrice
    ) {
      setAlertMessage(
        `Мінімальна ціна для VIP місця повинна бути не менше ${minPrice}₴`,
      );
      return;
    }

    updated[index] = { ...updated[index], ...updatedSession };
    const updatedSessionsByDate = {
      ...sessionsByDate,
      [movieKey]: {
        ...sessionsByDate[movieKey],
        [dateKey]: updated,
      },
    };

    onUpdate(updatedSessionsByDate);
    onSavedUpdate?.(updatedSessionsByDate);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const key = getLocalDateKey(date);
    const isSelected = key === dateKey;
    const sessions = savedSessionsByDate[movieKey]?.[key] || [];
    const activeSessions = sessions.filter((s) => !s.is_deleted);
    const hasSessions = activeSessions.length > 0;
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
      const sessions = savedSessionsByDate[movieKey]?.[key] || [];
      const activeSessions = sessions.filter((s) => !s.is_deleted);
      const count = activeSessions.length;
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

  const getHallLabel = (id: string) =>
    hallOptions.find((h) => h.value === id)?.label || '';
  const getFormatLabel = (id: string) =>
    formatOptions.find((f) => f.value === id)?.label || '';

  return (
    <>
      <DeleteSessionModal
        open={showDeleteModal}
        bookingCount={sessionToDelete?.bookingCount}
        onConfirm={() => confirmDelete()}
        onCancel={() => cancelDelete()}
      />
      <div
        className="calendar-wrapper layout"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          value={selectedDate}
          onChange={(value) => setSelectedDate(value as Date)}
          tileClassName={tileClassName}
          tileContent={tileContent}
          tileDisabled={({ date }) => isDateInPast(date)}
          locale="uk-UA"
        />

        <div className="session-panel" onClick={(e) => e.stopPropagation()}>
          <div className="date-header" onClick={(e) => e.stopPropagation()}>
            <span>Сеанси на {selectedDate.toLocaleDateString('uk-UA')}</span>
            {visibleSessions.length < 5 && !isDateInPast(selectedDate) && (
              <button
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSession();
                }}
              >
                +
              </button>
            )}
          </div>

          {visibleSessions.map((session, index) => (
            <div
              key={`${session.time}-${index}`}
              className="session-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="session-row" onClick={(e) => e.stopPropagation()}>
                <div className="session-row-left">
                  <div className="field-container">
                    {editingField?.sessionIndex === index &&
                    editingField?.field === 'time' ? (
                      <input
                        type="time"
                        className="time-input"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <div className="field-display">
                        <span>{session.time}</span>
                        <button
                          className="edit-icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(index, 'time', session.time);
                          }}
                          title="Редагувати час"
                        >
                          <SquarePen size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="field-container">
                    <div className="field-display">
                      <span>{session.title}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(index);
                  }}
                >
                  <img src="/img/trash-icon.png" alt="Видалити" />
                </button>
              </div>

              <div
                className="session-dropdowns"
                onClick={(e) => e.stopPropagation()}
              >
                <CustomSelectGrey
                  options={hallOptions}
                  value={
                    hallOptions.find(
                      (h) => String(h.value) === String(session.hallId),
                    ) || hallOptions[0]
                  }
                  onChange={(option) =>
                    handleSessionChange(index, { hallId: option.value })
                  }
                />

                <CustomSelectGrey
                  options={formatOptions}
                  value={
                    formatOptions.find((f) => f.value === session.formatId) ||
                    formatOptions[0]
                  }
                  onChange={(option) =>
                    handleSessionChange(index, { formatId: option.value })
                  }
                />
              </div>

              <div className="price-info" onClick={(e) => e.stopPropagation()}>
                <div
                  className="price-field"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="label">Стандарт:</span>
                  {editingField?.sessionIndex === index &&
                  editingField?.field === 'price' ? (
                    <input
                      type="number"
                      className="price-input-calendar"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      onClick={(e) => e.stopPropagation()}
                      min={0.1}
                      step={0.1}
                      autoFocus
                    />
                  ) : (
                    <div className="field-display">
                      <span>{session.price ?? 0}</span>
                      <button
                        className="edit-icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(index, 'price', session.price);
                        }}
                        title="Редагувати ціну"
                      >
                        <SquarePen size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                  <span className="currency-symbol-calendar">₴</span>
                </div>

                <div
                  className="price-field"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="label">VIP:</span>
                  {editingField?.sessionIndex === index &&
                  editingField?.field === 'vipPrice' ? (
                    <input
                      type="number"
                      className="price-input-calendar"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      onClick={(e) => e.stopPropagation()}
                      min={0.1}
                      step={0.1}
                      autoFocus
                    />
                  ) : (
                    <div className="field-display">
                      <span>{session.vipPrice ?? 0}</span>
                      <button
                        className="edit-icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(index, 'vipPrice', session.vipPrice);
                        }}
                        title="Редагувати VIP ціну"
                      >
                        <SquarePen size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                  <span className="currency-symbol-calendar">₴</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </>
  );
}
