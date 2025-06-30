import React, { useState, useEffect } from 'react';
import MovieInfo, { type Movie } from '../components/MovieInfo';
import ScheduleBlock from '../components/ScheduleBlock';
import TrailerPlayer from '../components/TrailerPlayer';
import '../styles/MovieEditPage.css';
import '../styles/ScheduleBlock.css';

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// Тут встав свій тестовий токен адміна
const ADMIN_BEARER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJpYXQiOjE3NTA2MTMxMzQsImV4cCI6MTc1MzIwNTEzNH0.__wtsnfhC2WIVeIVssF_UK_5IyfYHvFu-703CX5EGVA'; // заміни на свій токен

// Мапа текстових значень у ID
const ageRateIdMap: Record<string, number> = {
  '0+': 1,
  '6+': 2,
  '12+': 3,
  '16+': 4,
  '18+': 5,
};

const MovieEdit = () => {
  const [movieId] = useState<number>(9);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [trailerUrl, setTrailerUrl] = useState<string>('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [isAdminCheck, setIsAdminCheck] = useState(true);
  const [updatedMovie, setUpdatedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieId}`, {
          headers: {
            Authorization: `Bearer ${ADMIN_BEARER_TOKEN}`,
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
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const handleConfirm = async () => {
    if (!updatedMovie) {
      console.error('Немає оновлених даних для збереження');
      return;
    }

    const payload = {
      name: updatedMovie.name,
      age_rate_id: ageRateIdMap[updatedMovie.ageRate], // конвертуємо ageRate -> ID
      description: updatedMovie.description,
    };

    const url = `${backendBaseUrl}movie/${movieId}`;
    console.log('Відправка PUT на:', url);
    console.log('Payload:', payload);

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ADMIN_BEARER_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Помилка відповіді:', errorData);
        throw new Error('Помилка при збереженні змін');
      }

      const data = await res.json();
      console.log('Успішно оновлено:', data);
      alert('Зміни збережено успішно!');
    } catch (error) {
      console.error(error);
      alert('Не вдалося зберегти зміни');
    }
  };

  return (
    <div className="page">
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
          movieId={movieId}
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

        <ScheduleBlock isAdminCheck={isAdminCheck} movieId={movieId} />
      </div>
    </div>
  );
};

export default MovieEdit;
