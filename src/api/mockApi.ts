// src/api/mockApi.ts

import type { Movie } from '../components/MovieInfoAdmin';

const movies: Movie[] = [
  {
    title: 'Початок',
    year: 2011,
    ageRating: '16+',
    director: 'Christopher Nolan',
    criticRating: '8.8',
    genre: 'Sci-Fi',
    duration: '148 min',
    studio: 'Warner Bros.',
    actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    posterUrl: 'public/img/inception-poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  },
  {
    title: 'Інтерстеллар',
    year: 2014,
    ageRating: '12+',
    director: 'Christopher Nolan',
    criticRating: '8.6',
    genre: 'Sci-Fi',
    duration: '169 min',
    studio: 'Paramount Pictures',
    actors: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    description:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
    posterUrl: 'public/img/Interstellar_film_poster2.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=I9fucTH5xWw',
  },
];

export const fetchMovies = (title: string, year: string): Promise<Movie[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = movies.filter(
        (m) =>
          m.title.toLowerCase().includes(title.toLowerCase()) &&
          String(m.year) === year,
      );
      resolve(filtered);
    }, 500);
  });
};
