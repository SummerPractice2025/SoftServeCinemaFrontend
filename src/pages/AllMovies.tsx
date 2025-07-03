import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AllMovies.css';
import CustomSelectGradient from '../components/CustomSelectGradient';
import TrailerPlayer from '../components/TrailerPlayer';
import CustomAlert from '../components/CustomAlert';

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

interface MovieFromBackend {
  id: number;
  name: string;
  posterURL: string;
  isPremiere: boolean;
  genreIDs: number[];
  session?: {
    id?: number | null;
    date?: string | null;
    type?: string | null;
  } | null;
}

interface Genre {
  id: number;
  name: string;
}

interface Option {
  value: string | number;
  label: string;
}

function formatSessionDate(sessionDateStr: string): string {
  const sessionDate = new Date(sessionDateStr);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfSessionDay = new Date(
    sessionDate.getFullYear(),
    sessionDate.getMonth(),
    sessionDate.getDate(),
  );

  const diffDays = Math.floor(
    (startOfSessionDay.getTime() - startOfToday.getTime()) /
      (1000 * 60 * 60 * 24),
  );

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

  if (diffDays === 0) return 'Сьогодні';
  if (diffDays === 1) return 'Завтра';

  const dayOfWeek = dayNames[sessionDate.getDay()];
  const day = sessionDate.getDate();
  const month = monthNames[sessionDate.getMonth()];

  return `${dayOfWeek}, ${day} ${month}`;
}

export default function AllMovies() {
  const [movies, setMovies] = useState<MovieFromBackend[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreOption, setSelectedGenreOption] = useState<Option>({
    value: 'all',
    label: 'Всі жанри',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const [customAlertMessage, setCustomAlertMessage] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMoviesAndGenres() {
      try {
        const [moviesResponse, genresResponse] = await Promise.all([
          fetch(`${backendBaseUrl}movies`),
          fetch(`${backendBaseUrl}genres`),
        ]);

        if (!moviesResponse.ok)
          throw new Error(
            `Помилка завантаження фільмів: ${moviesResponse.statusText}`,
          );
        if (!genresResponse.ok)
          throw new Error(
            `Помилка завантаження жанрів: ${genresResponse.statusText}`,
          );

        const moviesData: MovieFromBackend[] = await moviesResponse.json();
        const genresData: Genre[] = await genresResponse.json();

        setMovies(moviesData);
        setGenres(genresData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || 'Помилка при завантаженні даних');
        } else {
          console.error(error);
          setError('Сталася невідома помилка');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMoviesAndGenres();
  }, []);

  const genreOptions: Option[] = [
    { value: 'all', label: 'Всі жанри' },
    ...genres.map((g) => ({ value: g.id, label: g.name })),
  ];

  const filteredMovies =
    selectedGenreOption.value === 'all'
      ? movies
      : movies.filter((movie) =>
          movie.genreIDs.includes(Number(selectedGenreOption.value)),
        );

  const handleTrailerClick = async (movieId: number) => {
    try {
      const res = await fetch(`${backendBaseUrl}movie/${movieId}`);
      if (!res.ok) throw new Error('Не вдалося завантажити трейлер');
      const data = await res.json();
      if (!data.trailerUrl) throw new Error('Трейлер не знайдено');

      setTrailerUrl(data.trailerUrl);
      setShowPlayer(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        setCustomAlertMessage(error.message || 'Помилка завантаження трейлера');
      } else {
        console.error(error);
        setCustomAlertMessage('Сталася невідома помилка');
      }
    }
  };

  const handleBuyTicket = (
    movieId: number,
    session: { id: number; date: string; type: string },
  ) => {
    const dateObj = new Date(session.date);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const timeStr = dateObj.toTimeString().slice(0, 5);
    const format = session.type;

    navigate(`/booking-session/${dateStr}/${timeStr}/${format}`, {
      state: {
        sessionId: session.id,
        movieId: movieId,
      },
    });
  };

  const handleCardClick = (movieId: number) => {
    navigate(`/movie-info/${movieId}`);
  };

  if (loading) {
    return <div className="page">Завантаження...</div>;
  }

  if (error) {
    return <div className="page">Сталася помилка: {error}</div>;
  }

  return (
    <div className="page">
      <div className="content-container">
        <div className="filter-bar">
          <CustomSelectGradient
            options={genreOptions}
            value={selectedGenreOption}
            onChange={setSelectedGenreOption}
            className="narrow-select"
          />
        </div>

        <div className="grid">
          {filteredMovies.map((movie) => {
            const session = movie.session ?? {};

            const sessionId = session.id ?? null;
            const sessionDate = session.date ?? null;
            const sessionType = session.type ?? null;

            const isSessionValid =
              typeof sessionId === 'number' &&
              sessionId > 0 &&
              typeof sessionDate === 'string' &&
              sessionDate.trim() !== '' &&
              !isNaN(new Date(sessionDate).getTime()) &&
              typeof sessionType === 'string' &&
              sessionType.trim() !== '';

            return (
              <div
                key={movie.id}
                className="card"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  handleCardClick(movie.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="poster-wrapper">
                  <img
                    src={movie.posterURL}
                    alt={movie.name}
                    className="poster"
                  />
                  <div className="overlay">
                    <button
                      className="trailer-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrailerClick(movie.id);
                      }}
                      aria-label="Переглянути трейлер"
                    >
                      <span className="icon">▶</span>
                    </button>

                    {isSessionValid ? (
                      <div className="session-info">
                        <p className="nextSession">
                          Найближчий сеанс: {formatSessionDate(sessionDate!)}
                        </p>
                        <p className="sessionTime">
                          {new Date(sessionDate!).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <button
                          className="buy-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyTicket(movie.id, {
                              id: sessionId!,
                              date: sessionDate!,
                              type: sessionType!,
                            });
                          }}
                        >
                          Купити квиток
                        </button>
                      </div>
                    ) : (
                      <div className="session-info">
                        <p className="no-sessions">Сеансів немає</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="title">{movie.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {showPlayer && trailerUrl && (
        <TrailerPlayer
          videoUrl={trailerUrl}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {customAlertMessage && (
        <CustomAlert
          message={customAlertMessage}
          onClose={() => setCustomAlertMessage(null)}
        />
      )}
    </div>
  );
}
