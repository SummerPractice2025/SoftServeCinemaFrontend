import { useState, useEffect } from 'react';
import MovieInfo from '../components/MovieInfo';
import ScheduleBlock from '../components/ScheduleBlock';
import TrailerPlayer from '../components/TrailerPlayer';
import '../styles/MovieEditPage.css';
import '../styles/ScheduleBlock.css';

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const MovieEdit = () => {
  const [movieId] = useState<number>(2);

  const [posterUrl, setPosterUrl] = useState<string>('');
  const [trailerUrl, setTrailerUrl] = useState<string>('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [isAdminCheck, setIsAdminCheck] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieId}`);
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
          <button className="confirm-button">Підтвердити</button>
        )}
      </div>

      <div className="info-block">
        <MovieInfo movieId={movieId} readonly={!isAdminCheck} />
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
