import React, { useState, useEffect, useRef } from 'react';
import '../styles/MovieInfo.css';
import CustomSelectGrey from './CustomSelectGrey';
import { SquarePen } from 'lucide-react';

export interface Movie {
  id: number;
  name: string;
  description: string;
  duration: number;
  year: number;
  ageRate: string;
  rating: number;
  directors: string[];
  actors: string[];
  genres: string[];
  studios: string[];
}

interface MovieInfoProps {
  movieId: number;
  onChange?: (updatedMovie: Movie) => void;
  readonly?: boolean;
}

const editableFields = ['ageRate', 'description'] as const;

const AutoResizeTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}> = ({ value, onChange, onEnter }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onEnter?.();
        }
      }}
      className="auto-resize-textarea"
    />
  );
};

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const MovieInfo: React.FC<MovieInfoProps> = ({
  movieId,
  onChange,
  readonly,
}) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof Movie | null>(null);
  const [tempValue, setTempValue] = useState<string | number>('');
  const [ageOptions, setAgeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${backendBaseUrl}movie/${movieId}`);
        if (!res.ok) throw new Error('Помилка при завантаженні фільму');
        const raw = await res.json();

        const transformedMovie: Movie = {
          id: raw.id,
          name: raw.name,
          description: raw.description,
          duration: raw.duration,
          year: raw.year,
          ageRate: raw.ageRate,
          rating: raw.rating,
          directors: raw.directors ?? [],
          actors: raw.actors ?? [],
          genres: raw.genres ?? [],
          studios: raw.studios ?? [],
        };

        setMovie(transformedMovie);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  useEffect(() => {
    async function fetchAgeOptions() {
      const res = await fetch(`${backendBaseUrl}age-rates`);
      const data = await res.json();
      setAgeOptions(
        data.map((item: { age_rate: string }) => ({
          value: item.age_rate,
          label: item.age_rate,
        })),
      );
    }
    fetchAgeOptions();
  }, []);

  const startEditing = (field: keyof Movie, currentValue: string | number) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const finishEditing = () => {
    if (editingField && movie && onChange) {
      let updatedValue: string | number;

      if (
        editingField === 'year' ||
        editingField === 'duration' ||
        editingField === 'rating'
      ) {
        updatedValue = Number(tempValue);
      } else {
        updatedValue = String(tempValue);
      }

      const updatedMovie: Movie = {
        ...movie,
        [editingField]: updatedValue,
      };

      setMovie(updatedMovie);
      onChange(updatedMovie);
    }
    setEditingField(null);
  };

  const renderValue = (key: keyof Movie) => {
    const value = movie![key];
    return Array.isArray(value) ? value.join(', ') : value;
  };

  const rows: { key: keyof Movie; label: string }[] = [
    { key: 'year', label: 'Рік' },
    { key: 'ageRate', label: 'Вікове обмеження' },
    { key: 'directors', label: 'Режисери' },
    { key: 'rating', label: 'Оцінка критиків' },
    { key: 'genres', label: 'Жанри' },
    { key: 'duration', label: 'Тривалість (хв)' },
    { key: 'studios', label: 'Студії' },
    { key: 'actors', label: 'Актори' },
    { key: 'description', label: 'Опис' },
  ];

  if (loading) return <div>Завантаження фільму...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!movie) return <div>Фільм не знайдено</div>;

  return (
    <div>
      <div className="movie-title-row">
        {editingField === 'name' ? (
          <input
            type="text"
            value={tempValue as string}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
            autoFocus
            className="edit-input movie-title-input"
          />
        ) : (
          <div className="movie-title-cell">{movie.name}</div>
        )}
      </div>

      <table className="movie-info-table">
        <tbody>
          {rows.map(({ key, label }) => {
            const showEditButton =
              !readonly &&
              editableFields.includes(key as (typeof editableFields)[number]) &&
              key !== 'name' &&
              key !== 'year';

            return (
              <tr key={key}>
                <td className="category-cell">{label}:</td>
                <td className="value-cell">
                  {editingField === key ? (
                    key === 'description' ? (
                      <AutoResizeTextarea
                        value={tempValue as string}
                        onChange={(val) => setTempValue(val)}
                        onEnter={finishEditing}
                      />
                    ) : key === 'ageRate' ? (
                      <CustomSelectGrey
                        value={
                          ageOptions.find(
                            (opt) => opt.value === movie.ageRate,
                          ) || { value: movie.ageRate, label: movie.ageRate }
                        }
                        options={ageOptions}
                        onChange={(option) => {
                          const updatedMovie = {
                            ...movie,
                            ageRate: option.value,
                          };
                          setMovie(updatedMovie);
                          onChange?.(updatedMovie);
                          setEditingField(null);
                        }}
                      />
                    ) : (
                      <input
                        type={
                          typeof movie[key] === 'number' ? 'number' : 'text'
                        }
                        value={tempValue}
                        onChange={(e) =>
                          setTempValue(
                            typeof movie[key] === 'number'
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        autoFocus
                        className="edit-input"
                      />
                    )
                  ) : (
                    renderValue(key)
                  )}
                </td>
                {showEditButton && (
                  <td className="icon-cell">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => {
                        const value = movie[key];
                        const valToEdit = Array.isArray(value)
                          ? value.join(', ')
                          : value;
                        startEditing(key, valToEdit);
                      }}
                      aria-label={`Редагувати ${label.toLowerCase()}`}
                    >
                      <SquarePen
                        size={18}
                        strokeWidth={1.8}
                        className="icon-image"
                      />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MovieInfo;
