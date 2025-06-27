export interface Movie {
  id: number;
  title: string;
  poster: string;
  sessionTime: string;
  additionalInfo?: string;
  rating?: number;
  genre?: string;
  duration?: string;
}

export const featuredMovies: Movie[] = [
  {
    id: 1,
    title: "Назва фільму",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=900&fit=crop",
    sessionTime: "15:00",
    additionalInfo: "Додаткова інформація про фільм",
    rating: 8.5,
    genre: "Драма",
    duration: "180 хв"
  },
  {
    id: 2,
    title: "Назва фільму",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=900&fit=crop",
    sessionTime: "15:00",
    additionalInfo: "Додаткова інформація про фільм",
    rating: 8.9,
    genre: "Фантастика",
    duration: "166 хв"
  },
  {
    id: 3,
    title: "Назва фільму",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&h=900&fit=crop",
    sessionTime: "15:00",
    additionalInfo: "Додаткова інформація про фільм",
    rating: 7.8,
    genre: "Комедія",
    duration: "114 хв"
  }
];

// Для сумісності з попереднім кодом
export const featuredMovie = featuredMovies[0];
export const movies = featuredMovies;