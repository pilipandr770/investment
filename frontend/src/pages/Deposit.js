import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Deposit.css';
import { API_URL } from '../config/api';
import { formatNumber } from '../utils/numbers';

function Deposit() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [settings, setSettings] = useState([]);
  const [amount, setAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    loadSettings();
    loadHistory();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentHistory(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleCryptoPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      formData.append('amount', amount);
      formData.append('transactionHash', transactionHash);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      await axios.post(`${API_URL}/payments/crypto/request`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Запит на поповнення відправлено! Очікуйте підтвердження адміністратора.');
      setAmount('');
      setTransactionHash('');
      setScreenshot(null);
      setPaymentMethod('');
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка відправки запиту');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/stripe/payment-link`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { amount: amount || 100 }
      });

      if (response.data.url) {
        // Открываем платежную ссылку Stripe в новом окне
        window.open(response.data.url, '_blank');
        setSuccess('Відкрито вікно оплати Stripe. Після оплати баланс буде оновлено.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка створення платежу');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Очікує', class: 'status-pending' },
      approved: { text: 'Схвалено', class: 'status-approved' },
      rejected: { text: 'Відхилено', class: 'status-rejected' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedSetting = settings.find(s => s.payment_method === paymentMethod);

  return (
    <div className="container">
      <div className="deposit">
        <h1>💳 Поповнення балансу</h1>
        <p className="subtitle">Оберіть зручний спосіб оплати</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="payment-methods">
          <div className="card payment-card">
            <h2>Оберіть метод оплати</h2>
            <div className="method-buttons">
              <button
                className={`method-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <span className="method-icon">💳</span>
                <span>Stripe (Карта)</span>
              </button>
              
              {settings.filter(s => s.payment_method.includes('bitcoin')).map(setting => (
                <button
                  key={setting.payment_method}
                  className={`method-btn ${paymentMethod === setting.payment_method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(setting.payment_method)}
                  disabled={!setting.is_active || !setting.address}
                >
                  <span className="method-icon">₿</span>
                  <span>Bitcoin</span>
                </button>
              ))}

              {settings.filter(s => s.payment_method.includes('usdt')).map(setting => (
                <button
                  key={setting.payment_method}
                  className={`method-btn ${paymentMethod === setting.payment_method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(setting.payment_method)}
                  disabled={!setting.is_active || !setting.address}
                >
                  <span className="method-icon">₮</span>
                  <span>USDT {setting.payment_method.includes('trc20') ? 'TRC-20' : 'ERC-20'}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'stripe' && (
            <div className="card payment-form-card">
              <h2>💳 Оплата карткою через Stripe</h2>
              <p className="stripe-description">
                Безпечна оплата кредитною або дебетовою карткою через Stripe.
                Після оплати ваш баланс буде автоматично оновлено.
              </p>

              <div className="form-group">
                <label>Сума поповнення (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  step="10"
                  placeholder="Мінімум 10 USD"
                />
                <small>Мінімальна сума: 10 USD</small>
              </div>

              <button 
                className="btn btn-primary btn-full stripe-btn" 
                onClick={handleStripePayment}
                disabled={loading || !amount || amount < 10}
              >
                {loading ? '⏳ Завантаження...' : '💳 Оплатити через Stripe'}
              </button>

              <div className="payment-instructions">
                <h4>🔒 Безпека платежів</h4>
                <ul>
                  <li>✅ Захищені платежі через Stripe</li>
                  <li>✅ Підтримка всіх основних карт</li>
                  <li>✅ Миттєве зарахування коштів</li>
                </ul>
              </div>
            </div>
          )}

          {paymentMethod && paymentMethod !== 'stripe' && selectedSetting && (
            <div className="card payment-form-card">
              <h2>Поповнення через криптовалюту</h2>
              
              <div className="crypto-info">
                <div className="info-section">
                  <label>Адреса гаманця:</label>
                  <div className="address-box">
                    <code>{selectedSetting.address || 'Адреса не налаштована'}</code>
                    {selectedSetting.address && (
                      <button
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSetting.address);
                          setSuccess('Адресу скопійовано!');
                          setTimeout(() => setSuccess(''), 2000);
                        }}
                      >
                        📋 Копіювати
                      </button>
                    )}
                  </div>
                </div>

                {selectedSetting.qr_code_url && (
                  <div className="qr-section">
                    <label>QR-код для сканування:</label>
                    <img 
                      src={selectedSetting.qr_code_url} 
                      alt="QR Code" 
                      className="qr-code-image"
                    />
                  </div>
                )}
              </div>

              <form onSubmit={handleCryptoPayment}>
                <div className="form-group">
                  <label>Сума поповнення (USD) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Введіть суму"
                  />
                </div>

                <div className="form-group">
                  <label>Хеш транзакції (опціонально)</label>
                  <input
                    type="text"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    placeholder="0x..."
                  />
                </div>

                <div className="form-group">
                  <label>Скріншот підтвердження (опціонально)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {screenshot && <small>Файл: {screenshot.name}</small>}
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading || !selectedSetting.address}>
                  {loading ? 'Відправка...' : 'Відправити запит'}
                </button>
              </form>

              <div className="payment-instructions">
                <h4>📝 Інструкції:</h4>
                <ol>
                  <li>Скопіюйте адресу гаманця або відскануйте QR-код</li>
                  <li>Відправте криптовалюту на цю адресу</li>
                  <li>Заповніть форму з сумою та хешем транзакції</li>
                  <li>Очікуйте підтвердження від адміністратора</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {paymentHistory.length > 0 && (
          <div className="card history-card">
            <h2>📜 Історія поповнень</h2>
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Метод</th>
                    <th>Сума</th>
                    <th>Статус</th>
                    <th>Примітки</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => {
                    const statusInfo = getStatusBadge(payment.status);
                    return (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.created_at)}</td>
                        <td>{payment.payment_method}</td>
                        <td>${formatNumber(payment.amount)}</td>
                        <td>
                          <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td>{payment.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Deposit;
