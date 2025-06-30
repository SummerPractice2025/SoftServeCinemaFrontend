import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';

const MovieCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardDimensions, setCardDimensions] = useState({ width: 280, height: 420 });

  // Співвідношення сторін постера (ширина:висота = 2:3)
  const POSTER_ASPECT_RATIO = 2 / 3;
  const VISIBLE_ITEMS = 3; // Завжди показуємо 3 картки
  const GAP_SIZE = 16; // Відступ між картками

  // Функція для розрахунку розмірів карток
  useEffect(() => {
    const calculateCardDimensions = () => {
      const viewportWidth = window.innerWidth;
      const containerPadding = Math.max(16, viewportWidth * 0.02); // Адаптивні відступи: мінімум 16px або 2% від ширини
      const totalGaps = (VISIBLE_ITEMS - 1) * GAP_SIZE; // Загальна ширина всіх відступів
      
      // Доступна ширина для всіх карток (використовуємо всю ширину в'юпорта)
      const availableWidth = viewportWidth - (containerPadding * 2) - totalGaps;
      
      // Ширина однієї картки
      const cardWidth = Math.floor(availableWidth / VISIBLE_ITEMS);
      
      // Висота картки на основі співвідношення сторін постера
      const cardHeight = Math.floor(cardWidth / POSTER_ASPECT_RATIO);
      
      // Мінімальні та максимальні розміри для забезпечення якості
      const minWidth = 200;
      const maxWidth = 350;
      const finalWidth = Math.max(minWidth, Math.min(maxWidth, cardWidth));
      const finalHeight = Math.floor(finalWidth / POSTER_ASPECT_RATIO);
      
      setCardDimensions({ 
        width: finalWidth, 
        height: finalHeight 
      });
    };

    // Розраховуємо розміри при завантаженні та зміні розміру вікна
    calculateCardDimensions();
    
    const handleResize = () => {
      calculateCardDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Очищаємо слухач при демонтуванні
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Скидаємо індекс при зміні розмірів
  useEffect(() => {
    setCurrentIndex(0);
  }, [cardDimensions]);

  // Дані фільмів
  const movies = [
    {
      id: 1,
      title: "Дюна: Частина друга",
      genre: "Фантастика, Драма",
      rating: 8.5,
      duration: "2г 46хв",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
      showTimes: ["10:00", "13:30", "17:00", "20:30"]
    },
    {
      id: 2,
      title: "Опенгеймер",
      genre: "Драма, Історичний",
      rating: 9.1,
      duration: "",
      image: "https://images.unsplash.com/photo-1489599088675-e6e8e13b6b1b?w=400&h=600&fit=crop",
      showTimes: ["11:00", "14:30", "18:00", "21:30"]
    },
    {
      id: 3,
      title: "Барбі",
      genre: "Комедія, Фентезі",
      rating: 7.8,
      duration: "1г 54хв",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
      showTimes: ["12:00", "15:30", "19:00", "22:00"]
    },
    {
      id: 4,
      title: "Індіана Джонс 5",
      genre: "Пригоди, Бойовик",
      rating: 7.2,
      duration: "2г 34хв",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
      showTimes: []
    },
    {
      id: 5,
      title: "Трансформери",
      genre: "Бойовик, Фантастика",
      rating: 6.9,
      duration: "2г 7хв",
      image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
      showTimes: ["11:30", "15:00", "18:30", "22:00"]
    },
    {
      id: 6,
      title: "Джон Вік 4",
      genre: "Бойовик, Трилер",
      rating: 8.3,
      duration: "2г 49хв",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
      showTimes: ["12:30", "16:00", "19:30", "23:00"]
    },
    {
      id: 7,
      title: "Аватар 2",
      genre: "Фантастика, Пригоди",
      rating: 8.7,
      duration: "3г 12хв",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
      showTimes: ["10:00", "14:00", "18:00", "21:30"]
    },
    {
      id: 8,
      title: "Топ Ган: Маверік",
      genre: "Бойовик, Драма",
      rating: 8.9,
      duration: "2г 11хв",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
      showTimes: ["11:00", "14:30", "18:00", "21:30"]
    },
    {
      id: 9,
      title: "Людина-павук",
      genre: "Бойовик, Фантастика",
      rating: 8.1,
      duration: "2г 28хв",
      image: "https://images.unsplash.com/photo-1635863138275-d9864d93c5ee?w=400&h=600&fit=crop",
      showTimes: ["09:30", "13:00", "16:30", "20:00"]
    },
    {
      id: 10,
      title: "Матриця 4",
      genre: "Фантастика, Бойовик",
      rating: 7.4,
      duration: "2г 28хв",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=600&fit=crop",
      showTimes: ["10:15", "14:15", "18:15", "22:15"]
    }
  ];

  // Максимальний індекс для навігації
  const maxIndex = Math.max(0, movies.length - VISIBLE_ITEMS);

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Розрахунок висоти постера (70% від загальної висоти картки)
  const posterHeight = Math.floor(cardDimensions.height * 0.65);
  const infoHeight = cardDimensions.height - posterHeight;

  const MovieCard = ({ movie }) => {
      const nextShowTime = movie.showTimes.length > 0 
    ? movie.showTimes[0] 
    : 'Немає сеансів';
    return(
    <div 
      className="movie-card flex-shrink-0 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
      style={{ 
        width: `${cardDimensions.width}px`,
        height: `${cardDimensions.height}px`,
        marginRight: `${GAP_SIZE}px`,
        backgroundImage: `url(${movie.image})`,
      }}
    >
      <div className="hover-block w-full group hover:bg-black/40 transition-all duration-300 h-full flex flex-col">
        {/* Постер фільму */}
        <div className="relative group flex-shrink-0" style={{ height: `${posterHeight}px` }}>
          {/* Рейтинг
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md flex items-center text-xs font-semibold bg-black/60 text-yellow-400">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {movie.rating}
          </div> */}
          
          {/* Кнопка відтворення при ховері */}
          <div className="absolute top-[15px] left-[15px] inset-0 group transition-all duration-300">
            <div className="w-15 h-15 gradient-primary 500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 cursor-pointer">
              <div className="w-0 h-0 border-l-[15px] border-l-white border-t-[12px] border-t-transparent border-b-[15px] border-b-transparent opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-pointer"></div>
            </div>
          </div>
        </div>

        {/* Інформація про фільм */}
        <div className="p-3 flex flex-col justify-between flex-grow bg-gray-900/9" style={{ height: `${infoHeight}px` }}>
          <div>
            {/* Назва фільму */}
            <h3 className="font-semibold mb-2 line-clamp-2 leading-tight text-sm text-white">
              {movie.title}
            </h3>
            
            {/* Тривалість
            <div className="flex items-center text-xs mb-2 text-gray-300">
              <Clock className="w-3 h-3 mr-1" />
              <span>{movie.duration}</span>
            </div> */}

            {/* Жанр */}
            <p className="text-xs mb-3 line-clamp-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{movie.genre}</p>
          </div>

          {/* Сеанси */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Сеанси:
            </p>
            <div className="flex flex-wrap gap-1">
                            {/* Найближчий сеанс */}
              <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <p className="text-sm font-medium text-gray-200 mb-1 ">
                  Найближчий сеанс
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-white">
                      {nextShowTime}
                    </span>
                    {/* <span className="text-sm text-gray-300 uppercase">
                      3DH
                    </span> */}
                  </div>
                </div>
              </div>

              {/* Кнопка купити квиток */}
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 opacity-0 group-hover:opacity-100  rounded transition-all duration-200 text-sm uppercase tracking-wide">
                Купити квиток
                <br />
                <span className="text-xs normal-case">від 130 ₴</span>
              </button>
              {/* {movie.showTimes.slice(0, 2).map((time, index) => (
                <button 
                  key={index}
                  className="px-2 py-1 text-xs rounded transition-colors duration-200 border border-gray-600 text-white hover:bg-pink-500 hover:border-pink-500"
                >
                  {time}
                </button>
              ))}
              {movie.showTimes.length > 2 && (
                <button className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                  +{movie.showTimes.length - 2}
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen py-8 w-full">
      <div className="w-full px-4">
        {/* Заголовок секції */}
        <div 
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mx-auto max-w-7xl"
          style={{ paddingLeft: `${Math.max(16, window.innerWidth * 0.02)}px`, paddingRight: `${Math.max(16, window.innerWidth * 0.02)}px` }}
        >
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Зараз у кіно
            </h2>
            {/* <p className="text-sm md:text-base">
              Найпопулярніші фільми цього тижня
            </p> */}
          </div>
          
          {/* Навігаційні кнопки */}
          {movies.length > VISIBLE_ITEMS && (
            <div className="flex space-x-2">
              <button 
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  currentIndex === 0 
                    ? 'cursor-not-allowed' 
                    : ''
                }`}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button 
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  currentIndex >= maxIndex
                    ? 'cursor-not-allowed' 
                    : ''
                }`}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Карусель */}
        <div className="relative flex justify-center w-full">
          <div 
            className="overflow-hidden"
            style={{ 
              width: `${(cardDimensions.width * VISIBLE_ITEMS) + (GAP_SIZE * (VISIBLE_ITEMS - 1))}px`,
              maxWidth: '100vw'
            }}
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (cardDimensions.width + GAP_SIZE)}px)`
              }}
            >
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </div>

        {/* Індикатори прогресу */}
        {movies.length > VISIBLE_ITEMS && (
          <div className="flex justify-center mt-6 space-x-2 w-full">
            {Array.from({ length: Math.ceil(movies.length / VISIBLE_ITEMS) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(Math.min(index * VISIBLE_ITEMS, maxIndex))}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / VISIBLE_ITEMS) === index
                    ? 'w-6'
                    : ''
                }`}
              />
            ))}
          </div>
        )}

        {/* Інформація про відображення
        <div className="text-center mt-6 text-xs w-full">
          Показано фільми {currentIndex + 1}-{Math.min(currentIndex + VISIBLE_ITEMS, movies.length)} з {movies.length}
        </div> */}

        {/* Індикатор поточних налаштувань */}
        {/* <div className="text-center mt-4 text-xs w-full">
          Розміри картки: {cardDimensions.width}×{cardDimensions.height}px | 
          Співвідношення: {(cardDimensions.width / cardDimensions.height).toFixed(2)} | 
          Екран: {window.innerWidth}px
        </div> */}
      </div>
    </div>
  );
};

export default MovieCarousel;