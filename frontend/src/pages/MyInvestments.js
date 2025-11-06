import React, { useState, useEffect } from 'react';
import { investmentAPI } from '../api/api';
import { formatNumber } from '../utils/numbers';
import './MyInvestments.css';

function MyInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const response = await investmentAPI.getMyInvestments();
      setInvestments(response.data);
    } catch (err) {
      setError('Помилка завантаження інвестицій');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getTotalStats = () => {
    const total = investments.reduce((acc, inv) => {
      acc.invested += inv.amount;
      acc.current += inv.current_value || inv.amount;
      return acc;
    }, { invested: 0, current: 0 });
    
    total.profit = total.current - total.invested;
    total.return = total.invested > 0 ? ((total.profit / total.invested) * 100) : 0;
    
    return total;
  };

  if (loading) return <div className="loading">Завантаження...</div>;

  const stats = getTotalStats();

  return (
    <div className="container">
      <div className="my-investments">
        <h1>Мій портфель</h1>
        <p className="subtitle">Відстежуйте свої інвестиції та їх прогрес</p>

        {error && <div className="error">{error}</div>}

        {investments.length > 0 ? (
          <>
            <div className="portfolio-stats">
              <div className="card stat-card">
                <h3>Загальна сума інвестицій</h3>
                <p className="stat-value">{stats.invested.toFixed(2)} грн</p>
              </div>
              <div className="card stat-card">
                <h3>Поточна вартість</h3>
                <p className="stat-value">{stats.current.toFixed(2)} грн</p>
              </div>
              <div className="card stat-card">
                <h3>Прибуток</h3>
                <p className={`stat-value ${stats.profit >= 0 ? 'profit' : 'loss'}`}>
                  {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(2)} грн
                </p>
              </div>
              <div className="card stat-card">
                <h3>Доходність</h3>
                <p className={`stat-value ${stats.return >= 0 ? 'profit' : 'loss'}`}>
                  {stats.return >= 0 ? '+' : ''}{stats.return.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="investments-list">
              {investments.map((investment) => {
                const progress = calculateProgress(investment.start_date, investment.end_date);
                const daysLeft = getDaysRemaining(investment.end_date);
                const expectedProfit = investment.amount * (investment.expected_return / 100);
                
                return (
                  <div key={investment.id} className="card investment-item">
                    <div className="investment-header">
                      <div>
                        <h3>{investment.product_name}</h3>
                        <span className={`status-badge status-${investment.status}`}>
                          {investment.status === 'active' ? 'Активна' : investment.status}
                        </span>
                      </div>
                      <div className="investment-amount">
                        <span className="amount-label">Сума інвестиції</span>
                        <span className="amount-value">{formatNumber(investment.amount)} грн</span>
                      </div>
                    </div>

                    <div className="investment-details">
                      <div className="detail-row">
                        <span>Очікувана доходність:</span>
                        <strong>{investment.expected_return}%</strong>
                      </div>
                      <div className="detail-row">
                        <span>Очікуваний прибуток:</span>
                        <strong className="profit">+{expectedProfit.toFixed(2)} грн</strong>
                      </div>
                      <div className="detail-row">
                        <span>Дата початку:</span>
                        <strong>{formatDate(investment.start_date)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Дата закінчення:</span>
                        <strong>{formatDate(investment.end_date)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Залишилось днів:</span>
                        <strong>{daysLeft} днів</strong>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Прогрес</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="risk-info">
                      <span className="risk-label">Рівень ризику:</span>
                      <span className={`risk-value risk-${investment.risk_level.toLowerCase()}`}>
                        {investment.risk_level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">📊</div>
            <h2>У вас поки немає інвестицій</h2>
            <p>Почніть інвестувати, щоб побачити свій портфель тут</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/investments'}
            >
              Переглянути інвестиційні продукти
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInvestments;
