import React, { useState, useEffect } from 'react';
import '../styles/StatisticsPage.css';
import apiService from '../services/api';

const StatisticsPage: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState('week');
  const [money, setMoney] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [halls, setHalls] = useState<
    { hall_id: number; hall_name: string; occupancy: number }[]
  >([]);
  const [hallsLoading, setHallsLoading] = useState(true);
  const [hallsError, setHallsError] = useState<string | null>(null);
  const [topTickets, setTopTickets] = useState<
    { film_name: string; sold_tickets: number }[]
  >([]);
  const [topTicketsLoading, setTopTicketsLoading] = useState(true);
  const [topTicketsError, setTopTicketsError] = useState<string | null>(null);
  const [topMoney, setTopMoney] = useState<
    { film_name: string; money: number }[]
  >([]);
  const [topMoneyLoading, setTopMoneyLoading] = useState(true);
  const [topMoneyError, setTopMoneyError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiService
      .getStatsMoney()
      .then((data) => {
        setMoney(data.money);
        setError(null);
      })
      .catch(() => {
        setError('Не вдалося отримати дані про виручку');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setHallsLoading(true);
    apiService
      .getStatsOccupancy()
      .then((data) => {
        setHalls(data.halls);
        setHallsError(null);
      })
      .catch(() => {
        setHallsError('Не вдалося отримати дані про завантаженість залів');
      })
      .finally(() => setHallsLoading(false));
  }, []);

  useEffect(() => {
    setTopTicketsLoading(true);
    apiService
      .getStatsTopTickets()
      .then((data) => {
        setTopTickets(Array.isArray(data.films) ? data.films : []);
        setTopTicketsError(null);
      })
      .catch(() => {
        setTopTicketsError('Не вдалося отримати топ фільмів за популярністю');
      })
      .finally(() => setTopTicketsLoading(false));
  }, []);

  useEffect(() => {
    setTopMoneyLoading(true);
    apiService
      .getStatsTopMoney(activePeriod as 'day' | 'week' | 'month')
      .then((films) => {
        setTopMoney(Array.isArray(films) ? films : []);
        setTopMoneyError(null);
      })
      .catch(() => {
        setTopMoneyError('Не вдалося отримати топ фільмів за прибутковістю');
      })
      .finally(() => setTopMoneyLoading(false));
  }, [activePeriod]);

  return (
    <div className="statistics-page-root">
      <div className="statistics-page-content">
        <h2 className="statistics-title">ПАНЕЛЬ АДМІНІСТРАТОРА</h2>
        <div className="statistics-revenue">
          {loading ? (
            'Завантаження...'
          ) : error ? (
            <span style={{ color: 'red' }}>{error}</span>
          ) : (
            <>
              За сьогодні виручки:{' '}
              <span>
                {money?.toLocaleString('uk-UA', { maximumFractionDigits: 2 })}{' '}
                грн
              </span>
            </>
          )}
        </div>
        <div className="statistics-halls-title">Завантаженість залів</div>
        <div className="statistics-halls">
          {hallsLoading ? (
            <span>Завантаження...</span>
          ) : hallsError ? (
            <span style={{ color: 'red' }}>{hallsError}</span>
          ) : halls.length === 0 ? (
            <span>Дані відсутні</span>
          ) : (
            halls.map((hall) => (
              <div key={hall.hall_id} className="statistics-hall">
                <div className="statistics-hall-percent">{hall.occupancy}%</div>
                <div className="statistics-hall-label">{hall.hall_name}</div>
              </div>
            ))
          )}
        </div>
        <div className="statistics-block">
          <div className="statistics-block-title">
            Топ фільмів за популярністю
          </div>
          <div className="statistics-block-list">
            {topTicketsLoading ? (
              <span>Завантаження...</span>
            ) : topTicketsError ? (
              <span style={{ color: 'red' }}>{topTicketsError}</span>
            ) : topTickets.length === 0 ? (
              <span>Дані відсутні</span>
            ) : (
              topTickets.map((film, idx) => (
                <div className="statistics-block-row" key={film.film_name}>
                  <span>
                    #{idx + 1} {film.film_name}
                  </span>
                  <span className="statistics-block-right">
                    {film.sold_tickets} квитків
                    <br />
                    <span className="statistics-block-sub">за тиждень</span>
                  </span>
                </div>
              ))
            )}
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
            {topMoneyLoading ? (
              <span>Завантаження...</span>
            ) : topMoneyError ? (
              <span style={{ color: 'red' }}>{topMoneyError}</span>
            ) : topMoney.length === 0 ? (
              <span>Дані відсутні</span>
            ) : (
              topMoney.map((film, idx) => (
                <div className="statistics-block-row" key={film.film_name}>
                  <span>
                    #{idx + 1} {film.film_name}
                  </span>
                  <span className="statistics-block-right">
                    {film.money} грн
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
