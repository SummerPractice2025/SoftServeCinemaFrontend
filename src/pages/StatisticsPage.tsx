import React, { useState } from 'react';
import '../styles/StatisticsPage.css';

const halls = [
  { id: 1, percent: 25 },
  { id: 2, percent: 25 },
  { id: 3, percent: 25 },
  { id: 4, percent: 25 },
  { id: 5, percent: 25 },
];

const StatisticsPage: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState('week');

  return (
    <div className="statistics-page-root">
      <div className="statistics-page-content">
        <h2 className="statistics-title">ПАНЕЛЬ АДМІНІСТРАТОРА</h2>
        <div className="statistics-revenue">
          За сьогодні виручки: <span>20000000 грн</span>
        </div>
        <div className="statistics-halls-title">Завантаженість залів</div>
        <div className="statistics-halls">
          {halls.map((hall) => (
            <div key={hall.id} className="statistics-hall">
              <div className="statistics-hall-percent">{hall.percent}%</div>
              <div className="statistics-hall-label">Зала {hall.id}</div>
            </div>
          ))}
        </div>
        <div className="statistics-block">
          <div className="statistics-block-title">
            Топ фільмів за популярністю
          </div>
          <div className="statistics-block-list">
            <div className="statistics-block-row">
              <span>#1 Фільм</span>
              <span className="statistics-block-right">
                3000 квитків
                <br />
                <span className="statistics-block-sub">за тиждень</span>
              </span>
            </div>
            <div className="statistics-block-row">
              <span>#2 Фільм</span>
              <span className="statistics-block-right">
                3000 квитків
                <br />
                <span className="statistics-block-sub">за тиждень</span>
              </span>
            </div>
            <div className="statistics-block-row">
              <span>#3 Фільм</span>
              <span className="statistics-block-right">
                3000 квитків
                <br />
                <span className="statistics-block-sub">за тиждень</span>
              </span>
            </div>
          </div>
        </div>
        <div className="statistics-period-buttons">
          <button
            className={`statistics-period-btn${activePeriod === 'month' ? ' active' : ''}`}
            onClick={() => setActivePeriod('month')}
          >
            Місяць
          </button>
          <button
            className={`statistics-period-btn${activePeriod === 'week' ? ' active' : ''}`}
            onClick={() => setActivePeriod('week')}
          >
            Тиждень
          </button>
          <button
            className={`statistics-period-btn${activePeriod === 'day' ? ' active' : ''}`}
            onClick={() => setActivePeriod('day')}
          >
            День
          </button>
        </div>
        <div className="statistics-block">
          <div className="statistics-block-title">
            Топ фільмів за прибутковістю
          </div>
          <div className="statistics-block-list">
            <div className="statistics-block-row">
              <span>#1 Фільм</span>
              <span className="statistics-block-right">10000 грн</span>
            </div>
            <div className="statistics-block-row">
              <span>#2 Фільм</span>
              <span className="statistics-block-right">1000 грн</span>
            </div>
            <div className="statistics-block-row">
              <span>#3 Фільм</span>
              <span className="statistics-block-right">100 грн</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
