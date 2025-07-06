import React, { useState, useEffect, useRef } from 'react';
import '../styles/MovieInfo.css';
import CustomSelectGrey from './CustomSelectGrey';
import { SquarePen } from 'lucide-react';

export interface Movie {
  id?: number;
  title: string;
  year: number;
  ageRate: string;
  rating: number;
  genres: string[];
  actors: string[];
  studios: string[];
  directors: string[];
  duration: string;
  description: string;
  posterUrl?: string;
  trailerUrl?: string;
  priceStandard?: number;
  priceVip?: number;
}

interface MovieInfoProps {
  movie: Movie;
  onChange?: (updatedMovie: Movie) => void;
}

const editableFields = ['ageRate', 'description'] as const;

const ageOptions = [
  { value: '0+', label: '0+ (Без обмежень)' },
  { value: '6+', label: '6+ (Для дітей)' },
  { value: '12+', label: '12+ (З обмеженнями)' },
  { value: '16+', label: '16+ (Для підлітків)' },
  { value: '18+', label: '18+ (Тільки для дорослих)' },
];

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

const arrayToString = (arr: string[]) => arr.join(', ');
const stringToArray = (str: string) =>
  str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, onChange }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const startEditing = (
    field: string,
    currentValue: string | number | string[],
  ) => {
    setEditingField(field);
    if (
      ['genres', 'directors', 'actors', 'studios'].includes(field) &&
      Array.isArray(currentValue)
    ) {
      setTempValue(arrayToString(currentValue));
    } else if (typeof currentValue === 'number') {
      setTempValue(currentValue.toString());
    } else if (typeof currentValue === 'string') {
      setTempValue(currentValue);
    } else {
      setTempValue('');
    }
  };

  const finishEditing = () => {
    if (editingField && onChange) {
      let updatedValue: string | number | string[] = tempValue;

      if (editingField === 'rating' || editingField === 'year') {
        updatedValue = Number(tempValue);
      } else if (
        ['genres', 'directors', 'actors', 'studios'].includes(editingField)
      ) {
        updatedValue = stringToArray(tempValue);
      }

      onChange({ ...movie, [editingField]: updatedValue });
    }
    setEditingField(null);
  };

  const rows: { key: keyof Movie; label: string }[] = [
    { key: 'year', label: 'Рік' },
    { key: 'ageRate', label: 'Вікове обмеження' },
    { key: 'rating', label: 'Оцінка критиків' },
    { key: 'directors', label: 'Режисери' },
    { key: 'genres', label: 'Жанр' },
    { key: 'duration', label: 'Тривалість' },
    { key: 'studios', label: 'Студія' },
    { key: 'actors', label: 'Актори' },
    { key: 'description', label: 'Опис' },
  ];

  const hasIcon = (field: keyof Movie) =>
    editableFields.includes(field as (typeof editableFields)[number]) &&
    field !== 'title' &&
    field !== 'year';

  const currentAgeOption = ageOptions.find(
    (opt) => opt.value === movie.ageRate,
  ) ?? {
    value: movie.ageRate,
    label: movie.ageRate,
  };

  return (
    <div style={{ flex: 1 }}>
      <div className="movie-title-row">
        <div className="movie-title-cell">{movie.title}</div>
      </div>

      <table className="movie-info-table movie-info-admin-table">
        <tbody>
          {rows.map(({ key, label }) => (
            <tr key={key}>
              <td className="category-cell">{label}:</td>
              <td className="value-cell">
                {editingField === key ? (
                  key === 'description' ? (
                    <AutoResizeTextarea
                      value={tempValue}
                      onChange={(val) => setTempValue(val)}
                      onEnter={finishEditing}
                    />
                  ) : key === 'ageRate' ? (
                    <CustomSelectGrey
                      value={currentAgeOption}
                      options={ageOptions}
                      onChange={(option) => {
                        onChange?.({ ...movie, ageRate: option.value });
                        setEditingField(null);
                      }}
                    />
                  ) : ['genres', 'directors', 'actors', 'studios'].includes(
                      key,
                    ) ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      autoFocus
                      className="edit-input"
                      placeholder="Введіть через кому"
                    />
                  ) : (
                    <input
                      type={
                        key === 'rating' || typeof movie[key] === 'number'
                          ? 'number'
                          : 'text'
                      }
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                      autoFocus
                      className="edit-input"
                    />
                  )
                ) : ['genres', 'directors', 'actors', 'studios'].includes(
                    key,
                  ) ? (
                  arrayToString(movie[key] as string[])
                ) : (
                  movie[key]
                )}
              </td>
              <td className="icon-cell">
                {hasIcon(key) && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => startEditing(key, movie[key] ?? '')}
                    aria-label={`Редагувати ${label.toLowerCase()}`}
                  >
                    <SquarePen
                      size={18}
                      strokeWidth={1.8}
                      className="icon-image"
                    />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovieInfo;
