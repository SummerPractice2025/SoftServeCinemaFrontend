import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelectGrey from '../components/CustomSelectGrey';
import MovieInfo from '../components/MovieInfoAdmin';
import type { Movie } from '../components/MovieInfoAdmin';
import TrailerPlayer from '../components/TrailerPlayer';
import PriceBlock from '../components/PriceBlock';
import CustomAlert from '../components/CustomAlert';
import apiService from '../services/api';
import '../styles/AddMovies.css';
import ScheduleCalendarBlock from '../components/ScheduleCalendarBlock';
import type { Session } from '../components/ScheduleCalendarBlock';
import ActionButtons from '../components/ActionButtons';

interface SessionForPayload {
  date: string;
  time: string;
  price: number;
  priceVIP: number;
  hallId: string;
  formatId: string;
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
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

const fetchMovieIdByName = async (name: string): Promise<number | null> => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    const url = new URL(`${baseURL}movies`);

    const response = await fetch(url.toString());
    if (!response.ok) {
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
      return null;
    }

    return movie.id;
  } catch (error) {
    return null;
  }
};

const fetchSessionsByMovieId = async (movieId: number) => {
  try {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    const url = `${baseURL}session/by-movie/${movieId}`;

    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
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

const formatConflictMessage = (
  errorText: string,
  movieTitle?: string,
): string => {
  let formattedText = errorText;
  if (formattedText.includes('конфліктує з сеансом о')) {
    formattedText = formattedText.replace(
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
    formattedText = formattedText.replace(
      /Фільм\s+'([^']+)';\s+хронометраж:\s+\d+\s+хв\\.\}\)/g,
      (match, movieName) => {
        return `Фільм ${movieName}`;
      },
    );
    formattedText = formattedText.replace(/[(){}]+$/g, '').trim();
    formattedText = formattedText.replace(/[()]/g, '');
  }
  return formattedText;
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
      hallID: Number(session.hallId) || 1,
      sessionTypeID: Number(session.formatId) || 1,
    })),
  };
};

const AddMovies: React.FC = () => {
  const navigate = useNavigate();
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hallOptions, setHallOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

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
      setSessionsByDate(updated);
    }
  }, [filteredMovie?.priceStandard, filteredMovie?.priceVip]);

  useEffect(() => {
    async function fetchHalls() {
      try {
        const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
        const res = await fetch(`${baseURL}halls`);
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
  }, []);

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
          const newSessionMap: Record<string, Session[]> = {};

          for (const session of sessionList) {
            if (!session.id) {
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
              title: movieObj.title,
              hallId: hallId,
              formatId: String(detailedSession.session_type_id ?? 1),
              price: detailedSession.price ?? movieObj.priceStandard ?? 120,
              vipPrice: detailedSession.price_VIP ?? movieObj.priceVip ?? 180,
            };

            if (!newSessionMap[dateStr]) newSessionMap[dateStr] = [];
            newSessionMap[dateStr].push(sessionData);
          }

          const updatedSessionsByDate = { [movieObj.title]: newSessionMap };
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

    const minPrice = 0.1;
    const allRawSessions: SessionForPayload[] = Object.entries(
      currentMovieSessions,
    ).flatMap(([date, sessions]) =>
      sessions.map((session) => ({
        date,
        time: session.time,
        price: session.price,
        priceVIP: session.vipPrice,
        hallId: session.hallId,
        formatId: session.formatId,
      })),
    );

    for (const session of allRawSessions) {
      if (session.price < minPrice) {
        setErrorMessage(
          `Мінімальна ціна для стандартного місця повинна бути не менше ${minPrice}₴`,
        );
        return;
      }
      if (session.priceVIP < minPrice) {
        setErrorMessage(
          `Мінімальна ціна для VIP місця повинна бути не менше ${minPrice}₴`,
        );
        return;
      }
    }

    const allSessions: { date: string; time: string; hallId: string }[] = [];

    for (const [date, sessions] of Object.entries(currentMovieSessions)) {
      for (const session of sessions) {
        allSessions.push({
          date,
          time: session.time,
          hallId: session.hallId,
        });
      }
    }

    const seen = new Set<string>();
    for (const session of allSessions) {
      const key = `${session.date}-${session.time}-${session.hallId}`;
      if (seen.has(key)) {
        const [year, month, day] = session.date.split('-');
        const formattedDate = `${day}.${month}.${year}`;
        const hallLabel =
          hallOptions.find((h) => h.value === session.hallId)?.label ||
          `Зала ${session.hallId}`;
        const message = `Сеанс фільму "${filteredMovie.title}" на ${session.time} у ${hallLabel} ${formattedDate} вже існує.`;
        setErrorMessage(message);
        return;
      }
      seen.add(key);
    }

    const payload = buildMoviePayload(filteredMovie, allRawSessions);
    try {
      const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
      const url = joinUrl(baseURL, 'movie');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiService.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        setShowSuccessModal(true);

        const movieId = await fetchMovieIdByName(movieKey);
        if (movieId) {
          const sessionList = await fetchSessionsByMovieId(movieId);
          const newSessionMap: Record<string, Session[]> = {};

          for (const session of sessionList) {
            if (!session.id) {
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
              title: movieKey,
              hallId: hallId,
              formatId: String(detailedSession.session_type_id ?? 1),
              price:
                detailedSession.price ?? filteredMovie.priceStandard ?? 120,
              vipPrice:
                detailedSession.price_VIP ?? filteredMovie.priceVip ?? 180,
            };

            if (!newSessionMap[dateStr]) newSessionMap[dateStr] = [];
            newSessionMap[dateStr].push(sessionData);
          }
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
            msg = formatConflictMessage(errorData.message, filteredMovie.title);
          } else {
            msg = formatConflictMessage(
              JSON.stringify(errorData),
              filteredMovie.title,
            );
          }
        } catch {
          msg = formatConflictMessage(
            response.statusText || msg,
            filteredMovie.title,
          );
        }
        setErrorMessage(msg);
      }
    } catch (error) {
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
      setSessionsByDate({ ...sessionsByDate, [movieKey]: restoredSessions });
    }
    setFilteredMovie(null);
    setErrorMessage(null);
    setShowPlayer(false);
    setShowCancelModal(false);
  };

  const handleAddAnotherMovie = () => {
    setFilteredMovie(null);
    setSearchText('');
    setSessionsByDate({});
    setSavedSessionsByDate({});
    setErrorMessage(null);
    setShowPlayer(false);
    setShowSuccessModal(false);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleGoToAllMovies = () => {
    navigate('/');
  };

  return (
    <>
      {errorMessage && (
        <CustomAlert
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Фільм створено успішно!</h2>
            <p>Ви хочете додати ще фільм?</p>
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleAddAnotherMovie}>
                Так, додати ще
              </button>
              <button className="cancel-btn" onClick={handleGoToAllMovies}>
                Ні
              </button>
            </div>
          </div>
        </div>
      )}

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
              onError={(message) => setErrorMessage(message)}
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
                Object.entries(updated).forEach(
                  ([movieTitle, dateSessions]) => {
                    Object.entries(dateSessions).forEach(([date, sessions]) => {
                      sessions.forEach((session, idx) => {
                        if (!session.id) {
                        }
                      });
                    });
                  },
                );

                setSessionsByDate(updated);
              }}
              onSavedUpdate={(updated) => {
                setSavedSessionsByDate(updated);
              }}
              basePriceStandard={filteredMovie.priceStandard ?? 0}
              basePriceVip={filteredMovie.priceVip ?? 0}
            />

            <ActionButtons onSave={handleSave} onCancel={handleCancel} />
          </div>
        )}
      </div>
    </>
  );
};

export default AddMovies;
