import { useState } from 'react';
import CustomSelectGrey from './CustomSelectGrey';

interface Option {
  value: string;
  label: string;
}

interface Session {
  time: string;
  format: '2D' | '3D';
}

const sessions: Session[] = [
  { time: '12:00', format: '2D' },
  { time: '15:00', format: '2D' },
  { time: '18:00', format: '2D' },
  { time: '20:00', format: '2D' },
  { time: '12:00', format: '3D' },
  { time: '14:00', format: '3D' },
  { time: '17:00', format: '3D' },
  { time: '19:00', format: '3D' },
];

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

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
    if (i === 0) {
      label = `Сьогодні, ${day} ${month}`;
    } else if (i === 1) {
      label = `Завтра, ${day} ${month}`;
    } else {
      label = `${dayOfWeek}, ${day} ${month}`;
    }

    options.push({
      value: date.toISOString().split('T')[0], // формат YYYY-MM-DD
      label,
    });
  }

  return options;
};

const ScheduleBlock = () => {
  const dayOptions = getDateOptions();
  const [selectedDay, setSelectedDay] = useState<Option>(dayOptions[0]);

  const sessions2D = sessions.filter((s) => s.format === '2D');
  const sessions3D = sessions.filter((s) => s.format === '3D');

  const rows2D = chunkArray(sessions2D, 4);
  const rows3D = chunkArray(sessions3D, 4);

  return (
    <div className="schedule-block">
      {/* Верхня частина */}
      <div className="schedule-header">
        <h3>Розклад сеансів</h3>
        <CustomSelectGrey
          options={dayOptions}
          value={selectedDay}
          onChange={setSelectedDay}
        />
      </div>

      {/* Середня частина */}
      <div className="schedule-middle">
        {rows2D.map((row, i) => (
          <div key={`2d-row-${i}`} className="schedule-row">
            {row.map(({ time, format }, j) => (
              <div key={`2d-${i}-${j}`} className="schedule-time-wrapper">
                <button className="schedule-time-button">{time}</button>
                <div className="schedule-format">{format}</div>
              </div>
            ))}
          </div>
        ))}

        {rows3D.map((row, i) => (
          <div key={`3d-row-${i}`} className="schedule-row">
            {row.map(({ time, format }, j) => (
              <div key={`3d-${i}-${j}`} className="schedule-time-wrapper">
                <button className="schedule-time-button">{time}</button>
                <div className="schedule-format">{format}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Нижня частина */}
      <div className="schedule-footer">
        <button className="redact-button">Редагувати розклад</button>
      </div>
    </div>
  );
};

export default ScheduleBlock;
