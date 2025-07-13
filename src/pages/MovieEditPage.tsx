import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieInfo, { type Movie } from '../components/MovieInfo';
import ScheduleBlock from '../components/ScheduleBlock';
import TrailerPlayer from '../components/TrailerPlayer';
import CustomAlert from '../components/CustomAlert';
import { useAdmin } from '../context/AdminContext';
import apiService from '../services/api';
import '../styles/MovieEditPage.css';
import '../styles/ScheduleBlock.css';

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

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
  const { isAdminMode } = useAdmin();

  const [posterUrl, setPosterUrl] = useState<string>('');
  const [trailerUrl, setTrailerUrl] = useState<string>('');
  const [showPlayer, setShowPlayer] = useState(false);
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
            Authorization: `Bearer ${apiService.getToken()}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch movie details');
        const data = await res.json();

        setPosterUrl(data.posterUrl ?? '');
        setTrailerUrl(data.trailerUrl ?? '');
      } catch (error) {
        setPosterUrl('');
        setTrailerUrl('');
        setCustomAlertMessage('Не вдалося завантажити деталі фільму');
      }
    };

    fetchMovieDetails();
  }, [movieId, movieIdNum]);

  const handleConfirm = async () => {
    if (!updatedMovie) {
      setCustomAlertMessage('Немає оновлених даних для збереження');
      return;
    }

    const payload = {
      name: updatedMovie.name,
      age_rate_id: ageRateIdMap[updatedMovie.ageRate],
      description: updatedMovie.description,
    };

    const url = `${backendBaseUrl}movie/${movieIdNum}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiService.getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setCustomAlertMessage('Помилка при збереженні змін');
        throw new Error('Помилка при збереженні змін');
      }

      const data = await res.json();
      setCustomAlertMessage('Зміни збережено успішно!');
    } catch (error) {
      setCustomAlertMessage('Не вдалося зберегти зміни');
    }
  };

  return (
    <div className="movie-edit-page">
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
        {isAdminMode && (
          <button className="confirm-button" onClick={handleConfirm}>
            Підтвердити
          </button>
        )}
      </div>

      <div className="info-block">
        <MovieInfo
          movieId={movieIdNum}
          readonly={!isAdminMode}
          onChange={(movie) => setUpdatedMovie(movie)}
        />
      </div>

      <div className="schedule-container">
        <ScheduleBlock isAdminCheck={isAdminMode} movieId={movieIdNum} />
      </div>
    </div>
  );
};

export default MovieEdit;
