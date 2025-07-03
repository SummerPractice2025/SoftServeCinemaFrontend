import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelectGrey from './CustomSelectGrey';

interface Option {
  value: string;
  label: string;
}

interface Session {
  id: number;
  date: string;
  format: string;
  time: string;
}

interface RawSession {
  id: number;
  date: string;
  session_type_id: number;
}

interface ScheduleBlockProps {
  movieId: number;
  isAdminCheck?: boolean;
}

const getDateOptions = (): Option[] => {
  const now = new Date();
  const options: Option[] = [];

  const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthNames = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня',
  ];

  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const dayOfWeek = dayNames[date.getDay()];

    let label = '';
    if (i === 0) label = `Сьогодні, ${day} ${month}`;
    else if (i === 1) label = `Завтра, ${day} ${month}`;
    else label = `${dayOfWeek}, ${day} ${month}`;

    options.push({
      value: date.toISOString().split('T')[0],
      label,
    });
  }

  return options;
};

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const ScheduleBlock: React.FC<ScheduleBlockProps> = ({
  movieId,
  isAdminCheck = false,
}) => {
  const navigate = useNavigate();
  const dayOptions = getDateOptions();
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const [selectedDay, setSelectedDay] = useState<Option>(dayOptions[0]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTypeMap, setSessionTypeMap] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    const fetchSessionTypes = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}session/types`);
        const data: { id: number; type: string }[] = await res.json();
        const map: Record<number, string> = {};
        data.forEach((item) => {
          map[item.id] = item.type;
        });
        setSessionTypeMap(map);
      } catch (error) {
        console.error('Не вдалося завантажити типи сеансів:', error);
      }
    };

    fetchSessionTypes();
  }, [backendBaseUrl]);

  useEffect(() => {
    if (Object.keys(sessionTypeMap).length === 0) return;

    const fetchSessions = async () => {
      try {
        const startDate = `${selectedDay.value}T00:00:00`;
        const endDate = `${selectedDay.value}T23:59:59`;

        const res = await fetch(
          `${backendBaseUrl}session/by-movie/${movieId}?start_date=${encodeURIComponent(
            startDate,
          )}&end_date=${encodeURIComponent(endDate)}`,
        );
        const data: RawSession[] = await res.json();

        const formattedSessions: Session[] = data
          .map((s) => {
            const format = sessionTypeMap[s.session_type_id];
            if (!format) {
              console.warn(
                `Формат для session_type_id=${s.session_type_id} не знайдено!`,
              );
            }
            return {
              id: s.id,
              date: s.date,
              time: s.date.slice(11, 16),
              format: format || '2D',
            };
          })
          .sort((a, b) => a.time.localeCompare(b.time));

        setSessions(formattedSessions);
      } catch (error) {
        console.error('Не вдалося завантажити сеанси:', error);
      }
    };

    fetchSessions();
  }, [selectedDay, movieId, sessionTypeMap, backendBaseUrl]);

  const sessions2D = sessions.filter((s) => s.format === '2D');
  const sessions3D = sessions.filter((s) => s.format === '3D');

  const rows2D = chunkArray(sessions2D, 4);
  const rows3D = chunkArray(sessions3D, 4);

  return (
    <div className="schedule-block">
      <div className="schedule-header">
        <h3>Розклад сеансів</h3>
        <CustomSelectGrey
          options={dayOptions}
          value={selectedDay}
          onChange={setSelectedDay}
        />
      </div>

      <div className="schedule-middle">
        {rows2D.length === 0 && rows3D.length === 0 ? (
          <div className="no-sessions">В цей день сеансів більше немає</div>
        ) : (
          <>
            {rows2D.map((row, i) => (
              <div key={`2d-row-${i}`} className="schedule-row">
                {row.map(({ id, time, format }, j) => (
                  <div key={`2d-${i}-${j}`} className="schedule-time-wrapper">
                    <button
                      className="schedule-time-button"
                      onClick={() =>
                        navigate(
                          `/booking-session/${selectedDay.value}/${time}/${format}`,
                          {
                            state: { movieId, format, sessionId: id },
                          },
                        )
                      }
                    >
                      {time}
                    </button>
                    <div className="schedule-format">{format}</div>
                  </div>
                ))}
              </div>
            ))}

            {rows3D.map((row, i) => (
              <div key={`3d-row-${i}`} className="schedule-row">
                {row.map(({ id, time, format }, j) => (
                  <div key={`3d-${i}-${j}`} className="schedule-time-wrapper">
                    <button
                      className="schedule-time-button"
                      onClick={() =>
                        navigate(
                          `/booking-session/${selectedDay.value}/${time}/${format}`,
                          {
                            state: { movieId, format, sessionId: id },
                          },
                        )
                      }
                    >
                      {time}
                    </button>
                    <div className="schedule-format">{format}</div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {isAdminCheck && (
        <div className="schedule-footer">
          <button className="redact-button">Редагувати розклад</button>
        </div>
      )}
    </div>
  );
};

export default ScheduleBlock;
