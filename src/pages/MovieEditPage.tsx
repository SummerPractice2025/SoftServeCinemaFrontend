import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieInfo, { type Movie } from '../components/MovieInfo';
import ScheduleBlock from '../components/ScheduleBlock';
import TrailerPlayer from '../components/TrailerPlayer';
import CustomAlert from '../components/CustomAlert';
import '../styles/MovieEditPage.css';
import '../styles/ScheduleBlock.css';

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

const ageRateIdMap: Record<string, number> = {
  '0+': 1,
  '6+': 2,
  '12+': 3,
  '16+': 4,
  '18+': 5,
};

const MovieEdit = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const movieIdNum = movieId ? Number(movieId) : NaN;

  const [posterUrl, setPosterUrl] = useState<string>('');
  const [trailerUrl, setTrailerUrl] = useState<string>('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [isAdminCheck, setIsAdminCheck] = useState(true);
  const [updatedMovie, setUpdatedMovie] = useState<Movie | null>(null);
  const [customAlertMessage, setCustomAlertMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!movieId || isNaN(movieIdNum)) return;

    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieIdNum}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch movie details');
        const data = await res.json();

        setPosterUrl(data.posterUrl ?? '');
        setTrailerUrl(data.trailerUrl ?? '');
      } catch (error) {
        console.error(error);
        setPosterUrl('');
        setTrailerUrl('');
        setCustomAlertMessage('Не вдалося завантажити деталі фільму');
      }
    };

    fetchMovieDetails();
  }, [movieId, movieIdNum]);

  const handleConfirm = async () => {
    if (!updatedMovie) {
      console.error('Немає оновлених даних для збереження');
      setCustomAlertMessage('Немає оновлених даних для збереження');
      return;
    }

    const payload = {
      name: updatedMovie.name,
      age_rate_id: ageRateIdMap[updatedMovie.ageRate],
      description: updatedMovie.description,
    };

    const url = `${backendBaseUrl}movie/${movieIdNum}`;
    console.log('Відправка PUT на:', url);
    console.log('Payload:', payload);

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Помилка відповіді:', errorData);
        setCustomAlertMessage('Помилка при збереженні змін');
        throw new Error('Помилка при збереженні змін');
      }

      const data = await res.json();
      console.log('Успішно оновлено:', data);
      setCustomAlertMessage('Зміни збережено успішно!');
    } catch (error) {
      console.error(error);
      setCustomAlertMessage('Не вдалося зберегти зміни');
    }
  };

  return (
    <div className="page">
      {customAlertMessage && (
        <CustomAlert
          message={customAlertMessage}
          onClose={() => setCustomAlertMessage(null)}
        />
      )}

      <div className="poster-block">
        {posterUrl && <img src={posterUrl} alt="Постер фільму" />}
        <button
          className="trailer-button"
          onClick={() => setShowPlayer(true)}
          disabled={!trailerUrl}
        >
          ▶ Дивитись трейлер
        </button>
        {showPlayer && trailerUrl && (
          <TrailerPlayer
            videoUrl={trailerUrl}
            onClose={() => setShowPlayer(false)}
          />
        )}
        {isAdminCheck && (
          <button className="confirm-button" onClick={handleConfirm}>
            Підтвердити
          </button>
        )}
      </div>

      <div className="info-block">
        <MovieInfo
          movieId={movieIdNum}
          readonly={!isAdminCheck}
          onChange={(movie) => setUpdatedMovie(movie)}
        />
      </div>

      <div className="schedule-container">
        <button
          className="mode-toggle-small"
          onClick={() => setIsAdminCheck((prev) => !prev)}
        >
          {isAdminCheck ? 'Режим клієнта' : 'Режим адміністратора'}
        </button>

        <ScheduleBlock isAdminCheck={isAdminCheck} movieId={movieIdNum} />
      </div>
    </div>
  );
};

export default MovieEdit;
