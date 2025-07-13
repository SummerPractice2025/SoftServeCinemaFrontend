import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelectGrey from './CustomSelectGrey';
import ScheduleCalendarBlock from './ScheduleCalendarBlock';
import CustomAlert from './CustomAlert';
import type { Movie } from './MovieInfoAdmin';
import type { Session } from './ScheduleCalendarBlock';
import apiService from '../services/api';
import { useAdmin } from '../context/AdminContext';

const formatConflictMessage = (errorText: string): string => {
  if (errorText.includes('конфліктує з сеансом о')) {
    let formattedText = errorText.replace(
      /(\d{2})\.(\d{4})\.(\d{4})-(\d{2})-(\d{2})/g,
      (match, day, year1, year2, month, day2) => {
        return `${day2}.${month}.${year2}`;
      },
    );

    formattedText = formattedText.replace(
      /(\d{2}):(\d{2}):(\d{2})/g,
      (match, hour, minute) => {
        return `${hour}:${minute}`;
      },
    );

    formattedText = formattedText.replace(/\(Фільм([^)]*)\)/g, 'Фільм$1');

    formattedText = formattedText.trim().replace(/[})]+$/, '');

    return formattedText;
  }

  return errorText.trim().replace(/[})]+$/, '');
};

interface Option {
  value: string;
  label: string;
}

interface ScheduleSession {
  id: number;
  date: string;
  format: string;
  time: string;
}

interface RawSession {
  id: number;
  date: string;
  session_type_id: number;
}

interface ScheduleBlockProps {
  movieId: number;
  isAdminCheck?: boolean;
}
interface CreateSessionPayload {
  movieID: number;
  date: string;
  price: number;
  priceVIP: number;
  hallID: number;
  sessionTypeID: number;
}

const getDateOptions = (): Option[] => {
  const now = new Date();
  const options: Option[] = [];
  const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
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

  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const dayOfWeek = dayNames[date.getDay()];

    let label = '';
    if (i === 0) label = `Сьогодні, ${day} ${month}`;
    else if (i === 1) label = `Завтра, ${day} ${month}`;
    else label = `${dayOfWeek}, ${day} ${month}`;

    options.push({
      value: date.toISOString().split('T')[0],
      label,
    });
  }

  return options;
};

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const fetchSessionsByMovieId = async (
  movieId: number,
  backendBaseUrl: string,
) => {
  try {
    const url = `${backendBaseUrl}session/by-movie/${movieId}`;
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
};

const fetchSessionById = async (sessionId: number, backendBaseUrl: string) => {
  try {
    const url = `${backendBaseUrl}session/${sessionId}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        return null;
      }
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

const ScheduleBlock: React.FC<ScheduleBlockProps> = ({
  movieId,
  isAdminCheck = false,
}) => {
  const { isAdminMode } = useAdmin();
  const navigate = useNavigate();
  const dayOptions = getDateOptions();
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const [selectedDay, setSelectedDay] = useState<Option>(dayOptions[0]);
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [sessionTypeMap, setSessionTypeMap] = useState<Record<number, string>>(
    {},
  );
  const [showEditModal, setShowEditModal] = useState(false);
  // Закривати модальне вікно, якщо вимикається адмін-режим
  useEffect(() => {
    if (!isAdminMode && showEditModal) {
      setShowEditModal(false);
    }
  }, [isAdminMode, showEditModal]);

  const [calendarSessionsByDate, setCalendarSessionsByDate] = useState<
    Record<string, Record<string, Session[]>>
  >({});
  const [savedSessionsByDate, setSavedSessionsByDate] = useState<
    Record<string, Record<string, Session[]>>
  >({});

  const [movieInfo, setMovieInfo] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [conflictError, setConflictError] = useState<string | null>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [hallOptions, setHallOptions] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    async function fetchHalls() {
      try {
        const res = await fetch(`${backendBaseUrl}halls`);
        const halls = await res.json();
        setHallOptions(
          halls.map((h: { id: number; name: string }) => ({
            value: String(h.id),
            label: h.name,
          })),
        );
      } catch {
        setHallOptions([
          { value: '1', label: 'Зала 1' },
          { value: '2', label: 'Зала 2' },
          { value: '3', label: 'Зала 3' },
          { value: '4', label: 'Зала 4' },
          { value: '5', label: 'Зала 5' },
        ]);
      }
    }
    fetchHalls();
  }, [backendBaseUrl]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEditModal) {
        setShowEditModal(false);
      }
    };

    if (showEditModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal]);

  useEffect(() => {
    const fetchMovieInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні фільму');
        const raw = await res.json();

        const transformedMovie: Movie = {
          id: raw.id,
          title: raw.name,
          description: raw.description,
          duration: raw.duration,
          year: raw.year,
          ageRate: raw.ageRate,
          rating: raw.rating,
          directors: raw.directors ?? [],
          actors: raw.actors ?? [],
          genres: raw.genres ?? [],
          studios: raw.studios ?? [],
          posterUrl: raw.posterUrl,
          trailerUrl: raw.trailerUrl,
          priceStandard: raw.priceStandard,
          priceVip: raw.priceVip,
        };

        setMovieInfo(transformedMovie);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieInfo();
  }, [movieId, backendBaseUrl]);

  useEffect(() => {
    if (!movieInfo) return;

    const loadExistingSessions = async () => {
      
        const sessionList = await fetchSessionsByMovieId(
          movieId,
          backendBaseUrl,
        );

        const newSessionMap: Record<string, Session[]> = {};

        for (const session of sessionList) {
          if (!session.id) {
            continue;
          }

          const detailedSession = await fetchSessionById(
            session.id,
            backendBaseUrl,
          );
          if (!detailedSession) continue;

          const dateTimeUtc = new Date(detailedSession.date_time);
          const dateStr = dateTimeUtc.toISOString().split('T')[0];

          const localDateTime = new Date(detailedSession.date_time);
          const localHours = localDateTime
            .getHours()
            .toString()
            .padStart(2, '0');
          const localMinutes = localDateTime
            .getMinutes()
            .toString()
            .padStart(2, '0');
          const timeStr = `${localHours}:${localMinutes}`;

          const sessionType =
            detailedSession.session_type_id === 1 ? '2D' : '3D';

          let hallId = '';
          if (detailedSession.hall_id) {
            hallId = String(detailedSession.hall_id);
          } else if (detailedSession.hall_name) {
            const found = hallOptions.find(
              (h) => h.label === detailedSession.hall_name,
            )?.value;
            hallId = found || '';
          }
          const sessionData: Session = {
            id: detailedSession.id ?? session.id,
            time: timeStr,
            title: movieInfo.title,
            hallId: hallId,
            formatId: String(detailedSession.session_type_id ?? 1),
            price: detailedSession.price ?? movieInfo.priceStandard ?? 120,
            vipPrice: detailedSession.price_VIP ?? movieInfo.priceVip ?? 180,
          };

          if (!newSessionMap[dateStr]) newSessionMap[dateStr] = [];
          newSessionMap[dateStr].push(sessionData);
        }

        const updatedSessionsByDate = { [movieInfo.title]: newSessionMap };

        setCalendarSessionsByDate(updatedSessionsByDate);
        setSavedSessionsByDate(updatedSessionsByDate);
      
    };

    loadExistingSessions();
  }, [movieInfo, movieId, backendBaseUrl]);

  useEffect(() => {
    setCalendarSessionsByDate({});
    setSavedSessionsByDate({});
    return () => {
      setCalendarSessionsByDate({});
      setSavedSessionsByDate({});
    };
  }, [movieId]);

  const checkSessionConflicts = (
    sessionsData: Record<string, Record<string, Session[]>>,
  ): string | null => {
    if (!movieInfo) return null;

    const movieKey = movieInfo.title;
    const currentMovieSessions = sessionsData[movieKey] || {};

    for (const [dateStr, sessions] of Object.entries(currentMovieSessions)) {
      const seen = new Set<string>();
      for (const session of sessions) {
        if (session.is_deleted) continue;
        const key = `${session.time}-${session.hallId}`;
        if (seen.has(key)) {
          const [year, month, day] = dateStr.split('-');
          const formattedDate = `${day}.${month}.${year}`;
          return `Сеанс фільму "${movieInfo.title}" на ${session.time} у залі ${session.hallId} ${formattedDate} вже існує.`;
        }
        seen.add(key);
      }
    }
    return null;
  };

  const saveSessionsToServer = async (
    sessionsData: Record<string, Record<string, Session[]>>,
  ) => {
   
      if (!movieInfo) {
        return;
      }

      if (!movieInfo.id) {
        return;
      }

      const conflict = checkSessionConflicts(sessionsData);
      if (conflict) {
        setConflictError(conflict);
        throw new Error(conflict);
      }

      const minPrice = 0.1;
      const movieKey = movieInfo.title;
      const currentMovieSessions = sessionsData[movieKey] || {};

      for (const [dateStr, sessions] of Object.entries(currentMovieSessions)) {
        for (const session of sessions) {
          if (session.price < minPrice) {
            const errorMessage = `Мінімальна ціна для стандартного місця повинна бути не менше ${minPrice}₴ (сеанс ${session.time} ${dateStr})`;
            setConflictError(errorMessage);
            throw new Error(errorMessage);
          }
          if (session.vipPrice < minPrice) {
            const errorMessage = `Мінімальна ціна для VIP місця повинна бути не менше ${minPrice}₴ (сеанс ${session.time} ${dateStr})`;
            setConflictError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }

      setConflictError(null);

      const newSessions: {
        payload: CreateSessionPayload;
        session: Session;
        dateStr: string;
      }[] = [];
      const existingSessions: { session: Session; dateStr: string }[] = [];

      for (const [dateStr, sessions] of Object.entries(currentMovieSessions)) {
        for (const session of sessions) {
          if (!session.id) {
            const hallID = Number(session.hallId);
            const sessionTypeID = Number(session.formatId);

            const sessionPayload = {
              movieID: Number(movieInfo.id),
              date: `${dateStr}T${session.time}:00`,
              price: Number(session.price),
              priceVIP: Number(session.vipPrice),
              hallID,
              sessionTypeID,
            };

            newSessions.push({
              payload: sessionPayload,
              session: session,
              dateStr: dateStr,
            });
          } else {
            existingSessions.push({
              session: session,
              dateStr: dateStr,
            });
          }
        }
      }

      if (newSessions.length > 0) {
        const sessionsArray = newSessions.map(({ payload }) => payload);

        const response = await fetch(`${backendBaseUrl}session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiService.getToken()}`,
          },
          body: JSON.stringify(sessionsArray),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const formattedError = formatConflictMessage(errorText);
          throw new Error(
            `Помилка при створенні сеансів: ${response.statusText} - ${formattedError}`,
          );
        }

        const responseText = await response.text();

        try {
          const createdSessions: { id: number }[] = JSON.parse(responseText);

          if (Array.isArray(createdSessions)) {
            for (
              let i = 0;
              i < createdSessions.length && i < newSessions.length;
              i++
            ) {
              newSessions[i].session.id = createdSessions[i].id;
            }
          }
        } catch (parseError) {}
      }

      if (existingSessions.length > 0) {
        const updateSessionsArray = existingSessions.map(
          ({ session, dateStr }) => {
            const hallID = Number(session.hallId);
            const sessionTypeID = Number(session.formatId);

            return {
              session_id: Number(session.id),
              date: `${dateStr}T${session.time}:00`,
              price: Number(session.price),
              price_VIP: Number(session.vipPrice),
              hall_id: hallID,
              session_type_id: sessionTypeID,
              is_deleted: session.is_deleted || false,
            };
          },
        );

        const updateResponse = await fetch(`${backendBaseUrl}sessions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiService.getToken()}`,
          },
          body: JSON.stringify(updateSessionsArray),
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          const formattedError = formatConflictMessage(errorText);
        }

        const updateResponseText = await updateResponse.text();
      }

      setSavedSessionsByDate(sessionsData);
    
  };

  useEffect(() => {
    const fetchSessionTypes = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}session/types`);
        const data: { id: number; type: string }[] = await res.json();
        const map: Record<number, string> = {};
        data.forEach((item) => {
          map[item.id] = item.type;
        });
        setSessionTypeMap(map);
      } catch (error) {}
    };

    fetchSessionTypes();
  }, [backendBaseUrl]);

  useEffect(() => {
    if (Object.keys(sessionTypeMap).length === 0) return;

    const fetchSessions = async () => {
      try {
        const startDate = `${selectedDay.value}T00:00:00`;
        const endDate = `${selectedDay.value}T23:59:59`;
        const res = await fetch(
          `${backendBaseUrl}session/by-movie/${movieId}?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`,
        );
        const data: RawSession[] = await res.json();

        const formattedSessions: ScheduleSession[] = data
          .map((s) => ({
            id: s.id,
            date: s.date,
            time: s.date.slice(11, 16),
            format: sessionTypeMap[s.session_type_id] || '2D',
          }))
          .filter((session) => {
            const selectedDate = new Date(selectedDay.value);
            const now = new Date();
            const isToday = selectedDate.toDateString() === now.toDateString();
            if (isToday) {
              const [hours, minutes] = session.time.split(':').map(Number);
              const sessionDateTime = new Date(selectedDate);
              sessionDateTime.setHours(hours, minutes, 0, 0);
              return sessionDateTime > now;
            }
            return true;
          })
          .sort((a, b) => a.time.localeCompare(b.time));

        setSessions(formattedSessions);
      } catch (error) {}
    };

    fetchSessions();
  }, [selectedDay, movieId, sessionTypeMap, backendBaseUrl]);

  const sessions2D = sessions.filter((s) => s.format === '2D');
  const sessions3D = sessions.filter((s) => s.format === '3D');
  const rows2D = chunkArray(sessions2D, 4);
  const rows3D = chunkArray(sessions3D, 4);

  if (loading) {
    return (
      <div className="schedule-block">
        <div className="schedule-header">
          <h3>Розклад сеансів</h3>
        </div>
        <div className="schedule-middle">
          <div>Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-block">
        <div className="schedule-header">
          <h3>Розклад сеансів</h3>
        </div>
        <div className="schedule-middle">
          <div>Помилка: {error}</div>
        </div>
      </div>
    );
  }

  if (!movieInfo) {
    return (
      <div className="schedule-block">
        <div className="schedule-header">
          <h3>Розклад сеансів</h3>
        </div>
        <div className="schedule-middle">
          <div>Фільм не знайдено</div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-block">
      <div className="schedule-header">
        <h3>Розклад сеансів</h3>
        <CustomSelectGrey
          options={dayOptions}
          value={selectedDay}
          onChange={setSelectedDay}
        />
      </div>

      <div className="schedule-middle">
        {rows2D.length === 0 && rows3D.length === 0 ? (
          <div className="no-sessions">В цей день сеансів більше немає</div>
        ) : (
          <>
            {rows2D.map((row, i) => (
              <div key={`2d-row-${i}`} className="schedule-row">
                {row.map(({ id, time, format }, j) => (
                  <div key={`2d-${i}-${j}`} className="schedule-time-wrapper">
                    <button
                      className="schedule-time-button"
                      onClick={() => {
                        if (!apiService.isAuthenticated()) {
                          setAlertMessage(
                            'Щоб купити квитки спочатку треба авторизуватися',
                          );
                          return;
                        }
                        navigate(
                          `/booking-session/${selectedDay.value}/${time}/${format}`,
                          {
                            state: { movieId, format, sessionId: id },
                          },
                        );
                      }}
                    >
                      {time}
                    </button>
                    <div className="schedule-format">{format}</div>
                  </div>
                ))}
              </div>
            ))}

            {rows3D.map((row, i) => (
              <div key={`3d-row-${i}`} className="schedule-row">
                {row.map(({ id, time, format }, j) => (
                  <div key={`3d-${i}-${j}`} className="schedule-time-wrapper">
                    <button
                      className="schedule-time-button"
                      onClick={() => {
                        if (!apiService.isAuthenticated()) {
                          setAlertMessage(
                            'Ви не можете перейти на цю сторінку, поки не авторизуєтесь',
                          );
                          return;
                        }
                        navigate(
                          `/booking-session/${selectedDay.value}/${time}/${format}`,
                          {
                            state: { movieId, format, sessionId: id },
                          },
                        );
                      }}
                    >
                      {time}
                    </button>
                    <div className="schedule-format">{format}</div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {isAdminCheck && (
        <div className="schedule-footer">
          <button
            className="redact-button"
            onClick={() => {
              setShowEditModal(true);
              setConflictError(null);
              setAlertMessage(null);
            }}
          >
            Редагувати розклад
          </button>
        </div>
      )}

      {showEditModal && (
        <>
          <div
            className="schedule-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
                setConflictError(null);
                setAlertMessage(null);
              }
            }}
          />

          <div className="schedule-modal">
            <button
              className="schedule-modal-close-button"
              onClick={() => {
                setShowEditModal(false);
                setConflictError(null);
                setAlertMessage(null);
              }}
              title="Закрити вікно"
            >
              ×
            </button>
            <div
              className="schedule-modal-content"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <ScheduleCalendarBlock
                movie={movieInfo}
                sessionsByDate={calendarSessionsByDate}
                savedSessionsByDate={savedSessionsByDate}
                onUpdate={(updated) => {
                  setCalendarSessionsByDate(updated);
                }}
                onSavedUpdate={(updated) => {
                  setSavedSessionsByDate(updated);
                }}
                basePriceStandard={movieInfo.priceStandard || 120}
                basePriceVip={movieInfo.priceVip || 180}
              />

              {conflictError && (
                <div className="conflict-error-message">{conflictError}</div>
              )}

              <div className="schedule-modal-actions">
                <button
                  className="schedule-save-button"
                  onClick={async () => {
                    try {
                      await saveSessionsToServer(calendarSessionsByDate);
                      setShowEditModal(false);
                      setConflictError(null);
                      setAlertMessage(null);
                      window.location.reload();
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error ? error.message : String(error);
                      let extractedMessage = '';
                      try {
                        const match = errorMessage.match(
                          /\{"message":"([^"]+)"/,
                        );
                        if (match && match[1]) {
                          extractedMessage = match[1];
                        } else {
                          const parsed = JSON.parse(errorMessage);
                          if (parsed && parsed.message) {
                            extractedMessage = parsed.message;
                          }
                        }
                      } catch (e) {}
                      if (
                        !extractedMessage &&
                        errorMessage.includes('Сеанс фільму') &&
                        errorMessage.includes('вже існує')
                      ) {
                        extractedMessage = errorMessage.replace(
                          /^Error:\s*/,
                          '',
                        );
                      }
                      if (extractedMessage) {
                        setConflictError(
                          formatConflictMessage(extractedMessage),
                        );
                        setAlertMessage(null);
                      } else {
                        setAlertMessage(
                          'Помилка при збереженні сеансів. Спробуйте ще раз.',
                        );
                        setConflictError(null);
                      }
                    }
                  }}
                >
                  Зберегти
                </button>
                <button
                  className="schedule-cancel-button"
                  onClick={() => {
                    const cleanedSessionsByDate = { ...calendarSessionsByDate };
                    const movieKey = movieInfo?.title || '__unknown__';

                    if (cleanedSessionsByDate[movieKey]) {
                      Object.keys(cleanedSessionsByDate[movieKey]).forEach(
                        (dateKey) => {
                          cleanedSessionsByDate[movieKey][dateKey] =
                            cleanedSessionsByDate[movieKey][dateKey].filter(
                              (session) => session.id !== undefined,
                            );
                        },
                      );
                    }

                    setCalendarSessionsByDate(cleanedSessionsByDate);

                    setShowEditModal(false);
                    setConflictError(null);
                    setAlertMessage(null);
                  }}
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default ScheduleBlock;
