import { useState } from 'react';
import MovieInfo, { type Movie } from './MovieInfo';
import ScheduleBlock from './ScheduleBlock';
import './MovieEdit.css';
import './ScheduleBlock.css';
import TrailerPlayer from './TrailerPlayer';

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
    screenplay: 'Сенін Сон',
    actors: 'Дакота Джонсон, Педро Паскаль Дакота Джонсон, Педро Паскаль...',
    description: 'Це короткий опис сюжету або деталей фільму...',
  });

  const [showPlayer, setShowPlayer] = useState(false);

  const handleMovieChange = (updatedMovie: Movie) => {
    setMovie(updatedMovie);
  };

  return (
    <div className="page">
      <div className="poster-block">
        <img src="/img/poster_67d423a91a0a4.jpg" alt="Постер фільму" />

        <button className="trailer-button" onClick={() => setShowPlayer(true)}>
          Дивитись трейлер
        </button>

        {showPlayer && (
          <TrailerPlayer
            videoUrl="https://www.youtube.com/watch?v=CT2_P2DZBR0"
            onClose={() => setShowPlayer(false)}
          />
        )}

        <button className="confirm-button">Підтвердити</button>
      </div>

      <div className="info-block">
        <MovieInfo movie={movie} onChange={handleMovieChange} />
      </div>

      <ScheduleBlock />
    </div>
  );
};

export default MovieEdit;
