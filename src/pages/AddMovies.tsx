import React, { useState, useRef, useEffect } from 'react';
import CustomSelectGrey from '../components/CustomSelectGrey';
import MovieInfo from '../components/MovieInfoAdmin';
import type { Movie } from '../components/MovieInfoAdmin';
import TrailerPlayer from '../components/TrailerPlayer';
import PriceBlock from '../components/PriceBlock';
import '../styles/AddMovies.css';
import ScheduleCalendarBlock from '../components/ScheduleCalendarBlock';
import type { Session } from '../components/ScheduleCalendarBlock';
import ActionButtons from '../components/ActionButtons';

interface SessionForPayload {
  date: string;
  time: string;
  price: number;
  priceVIP: number;
  hall: string;
  sessionType: '2D' | '3D';
}

interface MoviePayload {
  name: string;
  description: string;
  duration: number;
  year: number;
  age_rate_id: number;
  rating: number;
  poster_url?: string;
  trailer_url?: string;
  directors: string[];
  actors: string[];
  genres: string[];
  studios: string[];
  sessions: {
    date: string;
    price: number;
    priceVIP: number;
    hallID: number;
    sessionTypeID: number;
  }[];
}

const getLastYears = (count: number): { value: string; label: string }[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const year = currentYear - i;
    return { value: String(year), label: String(year) };
  });
};

const fetchMovie = async (name: string, year: string) => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    const url = new URL(`${baseURL}movie`);
    url.searchParams.append('name', name);
    url.searchParams.append('year', year);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error('Помилка при отриманні фільму:', response.statusText);
      return null;
    }
    const data = await response.json();

    console.log('fetchMovie response:', data);
    return data;
  } catch (error) {
    console.error('Помилка при отриманні фільму:', error);
    return null;
  }
};

const fetchMovieIdByName = async (name: string): Promise<number | null> => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    const url = new URL(`${baseURL}movies`);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(
        'Помилка при отриманні списку фільмів:',
        response.statusText,
      );
      return null;
    }

    const movies: {
      id: number;
      name: string;
      posterURL: string;
      isPremiere: boolean;
      genreIDs: number[];
      session: object;
    }[] = await response.json();

    const movie = movies.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );

    if (!movie) {
      console.warn('Фільм не знайдено у списку /movies:', name);
      return null;
    }

    return movie.id;
  } catch (error) {
    console.error('Помилка при отриманні id фільму:', error);
    return null;
  }
};

const fetchSessionsByMovieId = async (movieId: number) => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    const url = `${baseURL}session/by-movie/${movieId}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Помилка отримання сеансів:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error sessions:', error);
    return [];
  }
};

const fetchSessionById = async (sessionId: number) => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    const url = `${baseURL}session/${sessionId}`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        console.warn(`Session ${sessionId} not found or bad request.`);
        return null;
      }
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching session by id:', error);
    return null;
  }
};

const getAgeRateId = (ageRateStr: string): number => {
  const map: Record<string, number> = {
    '0+': 1,
    '6+': 2,
    '12+': 3,
    '16+': 4,
    '18+': 5,
  };
  return map[ageRateStr] ?? 1;
};

const buildMoviePayload = (
  movie: Movie,
  sessions: SessionForPayload[],
): MoviePayload => {
  const directors = movie.directors.map((d) => d.trim());
  const actors = movie.actors.map((a) => a.trim());
  const genres = [...new Set(movie.genres.map((g) => g.trim()))];
  const studios = movie.studios.map((s) => s.trim());

  return {
    name: movie.title || '',
    description: movie.description || '',
    duration: Number(movie.duration),
    year: Number(movie.year),
    age_rate_id: getAgeRateId(movie.ageRate),
    rating: movie.rating,
    poster_url: movie.posterUrl,
    trailer_url: movie.trailerUrl,
    directors,
    actors,
    genres,
    studios,
    sessions: sessions.map((session) => ({
      date: `${session.date}T${
        session.time.length === 5 ? session.time + ':00' : session.time
      }`,
      price: session.price,
      priceVIP: session.priceVIP,
      hallID: parseInt(session.hall.replace(/\D/g, ''), 10) || 1,
      sessionTypeID: session.sessionType === '2D' ? 1 : 2,
    })),
  };
};

const ADMIN_BEARER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJpYXQiOjE3NTA2MTMxMzQsImV4cCI6MTc1MzIwNTEzNH0.__wtsnfhC2WIVeIVssF_UK_5IyfYHvFu-703CX5EGVA';

const AddMovies: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [searchText, setSearchText] = useState('');
  const [filteredMovie, setFilteredMovie] = useState<
    (Movie & { id?: number }) | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [sessionsByDate, setSessionsByDate] = useState<
    Record<string, Record<string, Session[]>>
  >({});
  const [savedSessionsByDate, setSavedSessionsByDate] = useState<
    Record<string, Record<string, Session[]>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filteredMovie) return;
    const movieKey = filteredMovie.title;
    const currentSessionsByDate = sessionsByDate[movieKey];
    if (!currentSessionsByDate) return;

    let didChange = false;
    const updatedSessionsByDate: Record<string, Session[]> = {};

    for (const [date, sessions] of Object.entries(currentSessionsByDate)) {
      updatedSessionsByDate[date] = sessions.map((session) => {
        if (
          session.price !== (filteredMovie.priceStandard ?? session.price) ||
          session.vipPrice !== (filteredMovie.priceVip ?? session.vipPrice)
        ) {
          didChange = true;
          return {
            ...session,
            price: filteredMovie.priceStandard ?? session.price,
            vipPrice: filteredMovie.priceVip ?? session.vipPrice,
          };
        }
        return session;
      });
    }

    if (didChange) {
      const updated = {
        ...sessionsByDate,
        [movieKey]: updatedSessionsByDate,
      };
      console.log('useEffect - оновлені sessionsByDate:', updated);
      setSessionsByDate(updated);
    }
  }, [filteredMovie?.priceStandard, filteredMovie?.priceVip]);

  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    const result = await fetchMovie(searchText, selectedYear);
    if (result) {
      const movieObj = {
        title: result.name,
        description: result.description,
        duration: result.duration,
        year: result.year,
        ageRate: result.ageRate,
        rating: result.rating,
        posterUrl: result.posterUrl,
        trailerUrl: result.trailerUrl,
        directors: Array.isArray(result.directors) ? result.directors : [],
        genres: Array.isArray(result.genres)
          ? result.genres
              .join(', ')
              .split(',')
              .map((g: string) => g.trim())
          : [],
        actors: Array.isArray(result.actors)
          ? result.actors
              .join(', ')
              .split(',')
              .map((a: string) => a.trim())
          : [],
        studios: Array.isArray(result.studios)
          ? result.studios
              .join(', ')
              .split(',')
              .map((s: string) => s.trim())
          : [],
        priceStandard: Number(result.priceStandard),
        priceVip: Number(result.priceVip),
        id: result.id ? Number(result.id) : undefined,
      };

      setFilteredMovie(movieObj);

      if (movieObj.title) {
        const movieId = await fetchMovieIdByName(movieObj.title);
        if (!movieId) {
          setSessionsByDate({});
          setSavedSessionsByDate({});
        } else {
          const sessionList = await fetchSessionsByMovieId(movieId);
          console.log(
            'handleSearch - Сеанси, отримані після пошуку:',
            sessionList,
          );

          const newSessionMap: Record<string, Session[]> = {};

          for (const session of sessionList) {
            if (!session.id) {
              console.warn(
                'handleSearch - У сеанса нет id, пропускаем:',
                session,
              );
              continue;
            }

            const detailedSession = await fetchSessionById(session.id);
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

            const sessionData: Session = {
              id: detailedSession.id ?? session.id,
              time: timeStr,
              title: movieObj.title,
              hall: detailedSession.hall_name || 'Зала1',
              format: sessionType,
              price: detailedSession.price ?? movieObj.priceStandard ?? 120,
              vipPrice: detailedSession.price_VIP ?? movieObj.priceVip ?? 180,
            };

            if (!newSessionMap[dateStr]) newSessionMap[dateStr] = [];
            newSessionMap[dateStr].push(sessionData);
          }

          const updatedSessionsByDate = { [movieObj.title]: newSessionMap };
          console.log(
            'handleSearch - Встановлюємо sessionsByDate:',
            updatedSessionsByDate,
          );

          setSessionsByDate(updatedSessionsByDate);
          setSavedSessionsByDate(updatedSessionsByDate);
        }
      }
    } else {
      setFilteredMovie(null);
      setSessionsByDate({});
      setSavedSessionsByDate({});
      setErrorMessage('Фільм не знайдено');
    }
    setShowPlayer(false);
    setLoading(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const joinUrl = (base: string, path: string) => {
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return base + path;
  };

  const handleSave = async () => {
    if (!filteredMovie) return;

    const movieKey = filteredMovie.title;
    const currentMovieSessions = sessionsByDate[movieKey] || {};

    for (const [, sessions] of Object.entries(currentMovieSessions)) {
      const seen = new Set<string>();
      for (const session of sessions) {
        const key = `${session.time}-${session.hall}`;
        if (seen.has(key)) {
          const message = `Сеанс на ${session.time} у ${session.hall} вже існує.`;
          setErrorMessage(message);
          setTimeout(() => {
            errorRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }, 0);
          return;
        }
        seen.add(key);
      }
    }

    const allRawSessions: SessionForPayload[] = Object.entries(
      currentMovieSessions,
    ).flatMap(([date, sessions]) =>
      sessions.map((session) => ({
        date,
        time: session.time,
        price: session.price,
        priceVIP: session.vipPrice,
        hall: session.hall,
        sessionType: session.format,
      })),
    );

    const payload = buildMoviePayload(filteredMovie, allRawSessions);
    console.log('handleSave - Payload JSON:', JSON.stringify(payload, null, 2));

    try {
      const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
      console.log('handleSave - Base URL from env:', baseURL);
      const url = joinUrl(baseURL, 'movie');
      console.log('handleSave - Full POST URL:', url);

      console.log('handleSave - Отправляю POST запрос на:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ADMIN_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        alert('Фільм створено успішно!');
        setErrorMessage(null);

        const movieId = await fetchMovieIdByName(movieKey);
        if (movieId) {
          const sessionList = await fetchSessionsByMovieId(movieId);
          const newSessionMap: Record<string, Session[]> = {};

          for (const session of sessionList) {
            if (!session.id) {
              console.warn(
                'handleSave - У сеанса нет id, пропускаем:',
                session,
              );
              continue;
            }

            const detailedSession = await fetchSessionById(session.id);
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

            const sessionData: Session = {
              id: detailedSession.id ?? session.id,
              time: timeStr,
              title: movieKey,
              hall: detailedSession.hall_name || 'Зала1',
              format: sessionType,
              price:
                detailedSession.price ?? filteredMovie.priceStandard ?? 120,
              vipPrice:
                detailedSession.price_VIP ?? filteredMovie.priceVip ?? 180,
            };

            if (!newSessionMap[dateStr]) newSessionMap[dateStr] = [];
            newSessionMap[dateStr].push(sessionData);
          }

          console.log(
            'handleSave - Оновлені sessionsByDate після збереження:',
            { [movieKey]: newSessionMap },
          );

          setSessionsByDate({ [movieKey]: newSessionMap });
          setSavedSessionsByDate({ [movieKey]: newSessionMap });
        }
      } else {
        let msg = 'Помилка при створенні фільму.';
        try {
          const errorData = await response.json().catch(() => null);
          if (
            errorData &&
            typeof errorData === 'object' &&
            'message' in errorData
          ) {
            msg = errorData.message;
          } else {
            msg = JSON.stringify(errorData);
          }
        } catch {
          msg = response.statusText || msg;
        }
        setErrorMessage(msg);
      }
    } catch (error) {
      console.error('=== Fetch error ===', error);
      setErrorMessage('Невідома помилка при збереженні.');
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (filteredMovie) {
      const movieKey = filteredMovie.title;
      const restoredSessions = savedSessionsByDate[movieKey] || {};
      console.log(
        'confirmCancel - Відновлюємо sessionsByDate:',
        restoredSessions,
      );
      setSessionsByDate({ ...sessionsByDate, [movieKey]: restoredSessions });
    }
    setFilteredMovie(null);
    setErrorMessage(null);
    setShowPlayer(false);
    setShowCancelModal(false);
  };

  return (
    <div className="search-filter-container">
      <div className="search-filter-row">
        <CustomSelectGrey
          options={getLastYears(15)}
          value={{ value: selectedYear, label: selectedYear }}
          onChange={(option) => {
            setSelectedYear(option.value);
            setFilteredMovie(null);
            setShowPlayer(false);
          }}
          classNamePrefix="year-select"
        />

        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Введіть назву фільму..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            className="search-button"
            onClick={handleSearch}
            aria-label="Search"
            disabled={loading}
          >
            <img src="/img/search-icon.png" alt="Search" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          ref={errorRef}
          style={{
            background: 'linear-gradient(135deg, #ff3366 0%, #ff6b99 100%)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '10px',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="no-movie-message">Завантаження...</p>
      ) : filteredMovie ? (
        <div className="movie-details-container">
          <div className="poster-block">
            {filteredMovie.posterUrl && (
              <img
                src={filteredMovie.posterUrl}
                alt={`${filteredMovie.title} poster`}
              />
            )}

            {filteredMovie.trailerUrl && (
              <>
                <button
                  className="trailer-button"
                  onClick={() => setShowPlayer(true)}
                >
                  ▶ Дивитись трейлер
                </button>
                {showPlayer && (
                  <TrailerPlayer
                    videoUrl={filteredMovie.trailerUrl}
                    onClose={() => setShowPlayer(false)}
                  />
                )}
              </>
            )}
          </div>

          <MovieInfo movie={filteredMovie} onChange={setFilteredMovie} />

          <PriceBlock
            priceStandard={filteredMovie?.priceStandard}
            priceVip={filteredMovie?.priceVip}
            onPriceChange={(priceStandard, priceVip) =>
              setFilteredMovie((prev) =>
                prev ? { ...prev, priceStandard, priceVip } : prev,
              )
            }
          />
        </div>
      ) : (
        <p className="no-movie-message">Фільм не знайдено або не вибрано.</p>
      )}

      {filteredMovie && (
        <div className="fade-in">
          <ScheduleCalendarBlock
            movie={filteredMovie}
            sessionsByDate={sessionsByDate}
            savedSessionsByDate={savedSessionsByDate}
            onUpdate={(updated) => {
              console.log('ScheduleCalendarBlock onUpdate:', updated);

              // Для додаткової безпеки можна логувати, що в сесіях щодо id:
              Object.entries(updated).forEach(([movieTitle, dateSessions]) => {
                Object.entries(dateSessions).forEach(([date, sessions]) => {
                  sessions.forEach((session, idx) => {
                    if (!session.id) {
                      console.warn(
                        `Session без id у onUpdate [${movieTitle}][${date}][${idx}]:`,
                        session,
                      );
                    }
                  });
                });
              });

              setSessionsByDate(updated);
            }}
            basePriceStandard={filteredMovie.priceStandard ?? 0}
            basePriceVip={filteredMovie.priceVip ?? 0}
          />

          <ActionButtons onSave={handleSave} onCancel={handleCancel} />

          {showCancelModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Ви впевнені, що хочете скасувати всі зміни?</h2>
                <div className="modal-buttons">
                  <button className="save-btn" onClick={confirmCancel}>
                    Так, скасувати
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Ні, повернутись
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddMovies;
