import { useState } from 'react';
import MovieInfo, { type Movie } from '../components/MovieInfo';
import ScheduleBlock from '../components/ScheduleBlock';
import '../styles/MovieEditPage.css';
import '../styles/ScheduleBlock.css';
import TrailerPlayer from '../components/TrailerPlayer';

const MovieEdit = () => {
  const [movie, setMovie] = useState<Movie>({
    title: 'Формула1',
    year: 2025,
    ageRating: '16+',
    director: 'Сенін Сон',
    criticRating: '86%',
    genre: 'Романтика, Комедія',
    duration: '1:56',
    studio: 'Sony Pictures',
    actors: 'Дакота Джонсон, Педро Паскаль Дакота Джонсон, Педро Паскаль...',
    description: 'Це короткий опис сюжету або деталей фільму...',
  });

  const [showPlayer, setShowPlayer] = useState(false);
  const [isAdminCheck, setIsAdminCheck] = useState(true);

  const handleMovieChange = (updatedMovie: Movie) => {
    setMovie(updatedMovie);
  };

  return (
    <div className="page">
      <div className="poster-block">
        <img src="/img/poster_67d423a91a0a4.jpg" alt="Постер фільму" />

        <button className="trailer-button" onClick={() => setShowPlayer(true)}>
          ▶ Дивитись трейлер
        </button>

        {showPlayer && (
          <TrailerPlayer
            videoUrl="https://www.youtube.com/watch?v=CT2_P2DZBR0"
            onClose={() => setShowPlayer(false)}
          />
        )}

        {isAdminCheck && (
          <button className="confirm-button">Підтвердити</button>
        )}
      </div>

      <div className="info-block">
        <MovieInfo
          movie={movie}
          onChange={handleMovieChange}
          readonly={!isAdminCheck}
        />
      </div>

      <div className="schedule-container">
        <button
          className="mode-toggle-small"
          onClick={() => setIsAdminCheck((prev) => !prev)}
        >
          {isAdminCheck ? 'Режим клієнта' : 'Режим адміністратора'}
        </button>

        <ScheduleBlock isAdminCheck={isAdminCheck} />
      </div>
    </div>
  );
};

export default MovieEdit;
