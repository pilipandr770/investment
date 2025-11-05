import React, { useState, useEffect } from 'react';
import { userAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile({
        fullName: response.data.user.fullName,
        phone: response.data.user.phone || '',
        email: response.data.user.email
      });
    } catch (err) {
      setError('Помилка завантаження профілю');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone
      });
      updateUser({ ...user, fullName: profile.fullName });
      setSuccess('Профіль успішно оновлено');
      setIsEditing(false);
    } catch (err) {
      setError('Помилка оновлення профілю');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.email) return <div className="loading">Завантаження...</div>;

  return (
    <div className="container">
      <div className="profile">
        <h1>Профіль</h1>
        <p className="subtitle">Керуйте своїми особистими даними</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="profile-content">
          <div className="card profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <h2>{profile.fullName}</h2>
              <p>{profile.email}</p>
            </div>

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Повне ім'я:</span>
                  <span className="info-value">{profile.fullName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Телефон:</span>
                  <span className="info-value">{profile.phone || 'Не вказано'}</span>
                </div>
                
                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => setIsEditing(true)}
                >
                  Редагувати профіль
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Повне ім'я</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                  />
                  <small>Email не можна змінити</small>
                </div>

                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="+380 XX XXX XX XX"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    {loading ? 'Збереження...' : 'Зберегти'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    style={{ flex: 1 }}
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="card security-card">
            <h3>🔒 Безпека</h3>
            <p className="card-subtitle">Захист вашого акаунту</p>
            
            <div className="security-info">
              <div className="security-item">
                <div className="security-icon">✓</div>
                <div>
                  <h4>Пароль</h4>
                  <p>Ваш пароль захищено</p>
                </div>
              </div>
              <div className="security-item">
                <div className="security-icon">✓</div>
                <div>
                  <h4>Двофакторна аутентифікація</h4>
                  <p>Скоро буде доступна</p>
                </div>
              </div>
              <div className="security-item">
                <div className="security-icon">✓</div>
                <div>
                  <h4>Сесії</h4>
                  <p>Ваша сесія захищена JWT токеном</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card info-card">
            <h3>ℹ️ Інформація</h3>
            <p className="card-subtitle">Додаткові можливості</p>
            
            <ul className="info-list">
              <li>📄 Історія транзакцій - Скоро</li>
              <li>📊 Детальна аналітика - Скоро</li>
              <li>📧 Email повідомлення - Скоро</li>
              <li>📱 Мобільний додаток - Скоро</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
