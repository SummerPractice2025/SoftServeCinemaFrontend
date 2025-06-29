// AddMovies.tsx
import React, { useState, useRef } from 'react';
import CustomSelectGrey from '../components/CustomSelectGrey';
import MovieInfo from '../components/MovieInfoAdmin';
import type { Movie } from '../components/MovieInfoAdmin';
import TrailerPlayer from '../components/TrailerPlayer';
import PriceBlock from '../components/PriceBlock';
import '../styles/AddMovies.css';
import { fetchMovies } from '../api/mockApi';
import ScheduleCalendarBlock from '../components/ScheduleCalendarBlock';
import type { Session } from '../components/ScheduleCalendarBlock';
import ActionButtons from '../components/ActionButtons';

const getLastYears = (count: number): { value: string; label: string }[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const year = currentYear - i;
    return { value: String(year), label: String(year) };
  });
};

const AddMovies: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [searchText, setSearchText] = useState('');
  const [filteredMovie, setFilteredMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [sessionsByDate, setSessionsByDate] = useState<
    Record<string, Record<string, Session[]>>
  >({});
  const [savedSessionsByDate, setSavedSessionsByDate] = useState<
    Record<string, Record<string, Session[]>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    const results = await fetchMovies(searchText, selectedYear);
    setFilteredMovie(results.length > 0 ? results[0] : null);
    setShowPlayer(false);
    setErrorMessage(null);
    setLoading(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSave = () => {
    if (!filteredMovie) return;
    const movieKey = filteredMovie.title;
    const currentMovieSessions = sessionsByDate[movieKey] || {};

    for (const [dateKey, sessions] of Object.entries(currentMovieSessions)) {
      const seen = new Set<string>();
      for (const session of sessions) {
        const key = `${session.time}-${session.hall}`;
        if (seen.has(key)) {
          const message = `Сеанс на ${session.time} у ${session.hall} вже існує.`;
          setErrorMessage(message);
          setTimeout(() => {
            if (errorRef.current) {
              errorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }, 0);
          return;
        }
        seen.add(key);

        for (const [otherMovie, otherMovieDates] of Object.entries(
          savedSessionsByDate,
        )) {
          if (otherMovie === movieKey) continue;
          const otherSessions = otherMovieDates[dateKey] || [];
          for (const other of otherSessions) {
            if (other.time === session.time && other.hall === session.hall) {
              const message = `Сеанс на ${session.time} у ${session.hall} вже зайнятий фільмом "${otherMovie}".`;
              setErrorMessage(message);
              setTimeout(() => {
                if (errorRef.current) {
                  errorRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }
              }, 0);
              return;
            }
          }
        }
      }
    }

    setSavedSessionsByDate({
      ...savedSessionsByDate,
      [movieKey]: currentMovieSessions,
    });
    setErrorMessage(null);
    console.log('Сеанси збережено:', currentMovieSessions);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (filteredMovie) {
      const movieKey = filteredMovie.title;
      const restoredSessions = savedSessionsByDate[movieKey] || {};
      setSessionsByDate({
        ...sessionsByDate,
        [movieKey]: restoredSessions,
      });
    }
    setFilteredMovie(null);
    setErrorMessage(null);
    setShowPlayer(false);
    setShowCancelModal(false);
    console.log('Усі зміни скасовано, пошук і рік збережені.');
  };

  return (
    <div className="search-filter-container">
      <div className="search-filter-row">
        <CustomSelectGrey
          options={getLastYears(15)}
          value={{ value: selectedYear, label: selectedYear }}
          onChange={(option) => {
            setSelectedYear(option.value);
            setFilteredMovie(null);
            setShowPlayer(false);
          }}
          classNamePrefix="year-select"
        />

        <div className="search-input-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Введіть назву фільму..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            className="search-button"
            onClick={handleSearch}
            aria-label="Search"
            disabled={loading}
          >
            <img src="/img/search-icon.png" alt="Search" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          ref={errorRef}
          style={{
            background: 'linear-gradient(135deg, #ff3366 0%, #ff6b99 100%)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '10px',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="no-movie-message">Завантаження...</p>
      ) : filteredMovie ? (
        <div className="movie-details-container">
          <div className="poster-block">
            {filteredMovie.posterUrl && (
              <img
                src={filteredMovie.posterUrl}
                alt={`${filteredMovie.title} poster`}
              />
            )}

            {filteredMovie.trailerUrl && (
              <>
                <button
                  className="trailer-button"
                  onClick={() => setShowPlayer(true)}
                >
                  ▶ Дивитись трейлер
                </button>
                {showPlayer && (
                  <TrailerPlayer
                    videoUrl={filteredMovie.trailerUrl}
                    onClose={() => setShowPlayer(false)}
                  />
                )}
              </>
            )}
          </div>

          <MovieInfo movie={filteredMovie} onChange={setFilteredMovie} />

          <PriceBlock
            priceStandard={filteredMovie?.priceStandard}
            priceVip={filteredMovie?.priceVip}
            onPriceChange={(priceStandard, priceVip) =>
              setFilteredMovie((prev) =>
                prev ? { ...prev, priceStandard, priceVip } : prev,
              )
            }
          />
        </div>
      ) : (
        <p className="no-movie-message">Фільм не знайдено або не вибрано.</p>
      )}

      {filteredMovie && (
        <div className="fade-in">
          <ScheduleCalendarBlock
            movie={filteredMovie}
            sessionsByDate={sessionsByDate}
            savedSessionsByDate={savedSessionsByDate}
            onUpdate={setSessionsByDate}
            basePriceStandard={filteredMovie.priceStandard ?? 0}
            basePriceVip={filteredMovie.priceVip ?? 0}
          />

          <ActionButtons onSave={handleSave} onCancel={handleCancel} />

          {showCancelModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Ви впевнені, що хочете скасувати всі зміни?</h2>
                <div className="modal-buttons">
                  <button className="save-btn" onClick={confirmCancel}>
                    Так, скасувати
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Ні, залишити
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddMovies;
