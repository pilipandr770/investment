import React, { useState, useEffect } from 'react';
import { userAPI } from '../api/api';
import './Dashboard.css';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showBalanceForm, setShowBalanceForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
    } catch (err) {
      setError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    try {
      await userAPI.addBalance(parseFloat(balanceAmount));
      setBalanceAmount('');
      setShowBalanceForm(false);
      loadProfile();
    } catch (err) {
      setError('Помилка поповнення балансу');
    }
  };

  if (loading) return <div className="loading">Завантаження...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Дашборд</h1>
        <p className="subtitle">Вітаємо, {profile.user.fullName}!</p>

        <div className="dashboard-grid">
          <div className="card stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Баланс</h3>
              <p className="stat-value">{parseFloat(profile.user.balance || 0).toFixed(2)} грн</p>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setShowBalanceForm(!showBalanceForm)}
              >
                Поповнити
              </button>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Інвестовано</h3>
              <p className="stat-value">{profile.stats.totalInvested.toFixed(2)} грн</p>
              <p className="stat-label">{profile.stats.totalInvestments} інвестицій</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Поточна вартість</h3>
              <p className="stat-value">{profile.stats.currentValue.toFixed(2)} грн</p>
              <p className={`stat-label ${profile.stats.profit >= 0 ? 'profit' : 'loss'}`}>
                {profile.stats.profit >= 0 ? '+' : ''}{profile.stats.profit.toFixed(2)} грн
              </p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Доходність</h3>
              <p className="stat-value">
                {profile.stats.totalInvested > 0 
                  ? ((profile.stats.profit / profile.stats.totalInvested) * 100).toFixed(2)
                  : 0}%
              </p>
              <p className="stat-label">загальна</p>
            </div>
          </div>
        </div>

        {showBalanceForm && (
          <div className="card balance-form">
            <h3>Поповнення балансу</h3>
            <form onSubmit={handleAddBalance}>
              <div className="form-group">
                <label>Сума (грн)</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  placeholder="Введіть суму"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  Поповнити
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBalanceForm(false)}
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card info-card">
          <h2>Швидкий старт</h2>
          <ul className="info-list">
            <li>💼 Перегляньте доступні інвестиційні продукти</li>
            <li>💰 Поповніть баланс для здійснення інвестицій</li>
            <li>📊 Створіть свій інвестиційний портфель</li>
            <li>📈 Відстежуйте прогрес та доходність</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
