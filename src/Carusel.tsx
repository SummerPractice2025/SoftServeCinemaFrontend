import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';

const MovieCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Дані фільмів (імітація даних з API)
  const movies = [
    {
      id: 1,
      title: "Дюна: Частина друга",
      genre: "Фантастика, Драма",
      rating: 8.5,
      duration: "2г 46хв",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
      showTimes: ["10:00", "13:30", "17:00", "20:30"]
    },
    {
      id: 2,
      title: "Опенгеймер",
      genre: "Драма, Історичний",
      rating: 9.1,
      duration: "3г 0хв",
      image: "https://images.unsplash.com/photo-1489599088675-e6e8e13b6b1b?w=300&h=400&fit=crop",
      showTimes: ["11:00", "14:30", "18:00", "21:30"]
    },
    {
      id: 3,
      title: "Барбі",
      genre: "Комедія, Фентезі",
      rating: 7.8,
      duration: "1г 54хв",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop",
      showTimes: ["12:00", "15:30", "19:00", "22:00"]
    },
    {
      id: 4,
      title: "Індіана Джонс 5",
      genre: "Пригоди, Бойовик",
      rating: 7.2,
      duration: "2г 34хв",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop",
      showTimes: ["10:30", "14:00", "17:30", "21:00"]
    },
    {
      id: 5,
      title: "Трансформери",
      genre: "Бойовик, Фантастика",
      rating: 6.9,
      duration: "2г 7хв",
      image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=400&fit=crop",
      showTimes: ["11:30", "15:00", "18:30", "22:00"]
    },
    {
      id: 6,
      title: "Джон Вік 4",
      genre: "Бойовик, Трилер",
      rating: 8.3,
      duration: "2г 49хв",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=400&fit=crop",
      showTimes: ["12:30", "16:00", "19:30", "23:00"]
    },
    {
      id: 7,
      title: "Аватар 2",
      genre: "Фантастика, Пригоди",
      rating: 8.7,
      duration: "3г 12хв",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      showTimes: ["10:00", "14:00", "18:00", "21:30"]
    },
    {
      id: 8,
      title: "Топ Ган: Маверік",
      genre: "Бойовик, Драма",
      rating: 8.9,
      duration: "2г 11хв",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=400&fit=crop",
      showTimes: ["11:00", "14:30", "18:00", "21:30"]
    }
  ];

  const itemWidth = 280; // Ширина картки + відступ
  const visibleItems = 4; // Кількість видимих карток на десктопі

  const nextSlide = () => {
    if (currentIndex < movies.length - visibleItems) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const MovieCard = ({ movie }) => (
    <div className="flex-shrink-0 w-64 bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 mr-4">
      {/* Постер фільму */}
      <div className="relative group">
        <img 
          src={movie.image} 
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
        {/* Оверлей з рейтингом */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-80 text-yellow-400 px-2 py-1 rounded-md flex items-center text-sm font-semibold">
          <Star className="w-4 h-4 mr-1 fill-current" />
          {movie.rating}
        </div>
        {/* Кнопка відтворення при ховері */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 cursor-pointer">
            <div className="w-0 h-0 border-l-6 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
          </div>
        </div>
      </div>

      {/* Інформація про фільм */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 leading-tight">
          {movie.title}
        </h3>
        
        <div className="flex items-center text-gray-400 text-sm mb-3">
          <Clock className="w-4 h-4 mr-1" />
          <span>{movie.duration}</span>
        </div>

        <p className="text-gray-300 text-sm mb-4">{movie.genre}</p>

        {/* Сеанси */}
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Сеанси сьогодні:</p>
          <div className="flex flex-wrap gap-2">
            {movie.showTimes.slice(0, 3).map((time, index) => (
              <button 
                key={index}
                className="px-3 py-1 bg-gray-800 hover:bg-pink-600 text-white text-xs rounded-md transition-colors duration-200 border border-gray-700 hover:border-pink-600"
              >
                {time}
              </button>
            ))}
            {movie.showTimes.length > 3 && (
              <button className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">P
                +{movie.showTimes.length - 3}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок секції */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Зараз у кіно</h2>
            <p className="text-gray-400">Найпопулярніші фільми цього тижня</p>
          </div>
          
          {/* Навігаційні кнопки */}
          <div className="flex space-x-2">
            <button 
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentIndex === 0 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-pink-600 text-white'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextSlide}
              disabled={currentIndex >= movies.length - visibleItems}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentIndex >= movies.length - visibleItems
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-pink-600 text-white'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Карусель */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * itemWidth}px)`
              }}
            >
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </div>

        {/* Індикатори прогресу */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(movies.length / visibleItems) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * visibleItems)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                Math.floor(currentIndex / visibleItems) === index
                  ? 'bg-pink-600 w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Додаткова інформація */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          Показано фільми {currentIndex + 1}-{Math.min(currentIndex + visibleItems, movies.length)} з {movies.length}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;