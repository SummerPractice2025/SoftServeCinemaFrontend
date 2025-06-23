import React, { useState, useEffect, useRef } from 'react';
import './MovieInfo.css';
import CustomSelectGrey from './CustomSelectGrey';

export interface Movie {
  title: string;
  year: number;
  ageRating: string;
  director: string;
  criticRating: string;
  genre: string;
  duration: string;
  studio: string;
  screenplay: string;
  actors: string;
  description: string;
}

interface MovieInfoProps {
  movie: Movie;
  onChange?: (updatedMovie: Movie) => void;
  onIconClick?: () => void;
}

const editableFields = ['title', 'year', 'ageRating', 'description'] as const;

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

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, onChange }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string | number>('');

  const startEditing = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const finishEditing = () => {
    if (editingField && onChange) {
      onChange({
        ...movie,
        [editingField]: tempValue,
      });
    }
    setEditingField(null);
  };

  const rows: { key: keyof Movie; label: string }[] = [
    { key: 'year', label: 'Рік' },
    { key: 'ageRating', label: 'Вікове обмеження' },
    { key: 'director', label: 'Режисер' },
    { key: 'criticRating', label: 'Оцінка критиків' },
    { key: 'genre', label: 'Жанр' },
    { key: 'duration', label: 'Тривалість' },
    { key: 'studio', label: 'Студія' },
    { key: 'screenplay', label: 'Сценарій' },
    { key: 'actors', label: 'Актори' },
    { key: 'description', label: 'Опис' },
  ];

  const hasIcon = (field: keyof Movie) =>
    editableFields.includes(field as (typeof editableFields)[number]);

  return (
    <table className="movie-info-table">
      <tbody>
        <tr>
          <td className="movie-title-cell">
            {editingField === 'title' ? (
              <input
                type="text"
                value={tempValue as string}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                autoFocus
                className="edit-input"
              />
            ) : (
              movie.title
            )}
          </td>
          <td></td>
          <td className="movie-title-icon-cell">
            <button
              type="button"
              className="icon-button"
              onClick={() => startEditing('title', movie.title)}
              aria-label="Редагувати назву фільму"
            >
              <img
                src="/img/free-icon-font-edit-alt-3917427.png"
                alt="Редагувати"
                className="icon-image"
              />
            </button>
          </td>
        </tr>

        {rows.map(({ key, label }) => (
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
                ) : key === 'ageRating' ? (
                  <CustomSelectGrey
                    value={{ value: movie.ageRating, label: movie.ageRating }}
                    options={ageOptions}
                    onChange={(option) => {
                      if (onChange) {
                        onChange({
                          ...movie,
                          ageRating: option.value,
                        });
                      }
                      setEditingField(null);
                    }}
                  />
                ) : (
                  <input
                    type={typeof movie[key] === 'number' ? 'number' : 'text'}
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
                movie[key]
              )}
            </td>
            <td className="icon-cell">
              {hasIcon(key) && (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => startEditing(key, movie[key])}
                  aria-label={`Редагувати ${label.toLowerCase()}`}
                >
                  <img
                    src="/img/free-icon-font-edit-alt-3917427.png"
                    alt="Редагувати"
                    className="icon-image"
                  />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MovieInfo;
