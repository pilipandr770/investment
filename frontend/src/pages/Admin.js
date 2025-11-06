import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { API_URL, BACKEND_URL } from '../config/api';
import { formatNumber } from '../utils/numbers';

// Компонент для керування платежами
function PaymentsManagement() {
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('settings');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeSection === 'settings') {
        const response = await axios.get(`${API_URL}/admin/payment-settings`, config);
        setPaymentSettings(response.data);
      } else {
        const response = await axios.get(`${API_URL}/admin/payment-requests`, config);
        setPaymentRequests(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentSetting = async (method, address, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/payment-settings/${method}`,
        { address, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Налаштування оновлено');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка оновлення');
    }
  };

  const uploadQRCode = async (method, file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('qrCode', file);

      await axios.post(
        `${API_URL}/admin/payment-settings/${method}/qr`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSuccess('QR-код завантажено');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка завантаження');
    }
  };

  const processPaymentRequest = async (requestId, status, notes) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/payment-requests/${requestId}`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Запит ${status === 'approved' ? 'схвалено' : 'відхилено'}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка обробки');
    }
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

  const getMethodName = (method) => {
    const names = {
      bitcoin: 'Bitcoin',
      usdt_trc20: 'USDT (TRC-20)',
      usdt_erc20: 'USDT (ERC-20)',
      stripe: 'Stripe'
    };
    return names[method] || method;
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="payment-tabs">
        <button
          className={`tab-btn ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
        >
          ⚙️ Налаштування
        </button>
        <button
          className={`tab-btn ${activeSection === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveSection('requests')}
        >
          📥 Запити на поповнення
        </button>
      </div>

      {activeSection === 'settings' && (
        <div className="payment-settings">
          {paymentSettings.map((setting) => (
            <div key={setting.payment_method} className="card setting-card">
              <h3>{getMethodName(setting.payment_method)}</h3>
              
              <div className="setting-form">
                <div className="form-group">
                  <label>Адреса гаманця:</label>
                  <input
                    type="text"
                    value={setting.address || ''}
                    onChange={(e) => {
                      const updated = paymentSettings.map(s =>
                        s.payment_method === setting.payment_method
                          ? { ...s, address: e.target.value }
                          : s
                      );
                      setPaymentSettings(updated);
                    }}
                    placeholder={`Введіть ${getMethodName(setting.payment_method)} адресу`}
                  />
                </div>

                <div className="form-group">
                  <label>QR-код: {setting.qr_code_path && '✓ Завантажено'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadQRCode(setting.payment_method, e.target.files[0]);
                      }
                    }}
                  />
                  {setting.qr_code_path && (
                    <div className="qr-preview">
                      <img 
                        src={`${BACKEND_URL}/uploads/${setting.qr_code_path}`}
                        alt="QR Code"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={setting.is_active === 1}
                      onChange={(e) => {
                        const updated = paymentSettings.map(s =>
                          s.payment_method === setting.payment_method
                            ? { ...s, is_active: e.target.checked ? 1 : 0 }
                            : s
                        );
                        setPaymentSettings(updated);
                      }}
                    />
                    <span>Активний метод</span>
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    updatePaymentSetting(
                      setting.payment_method,
                      setting.address,
                      setting.is_active === 1
                    );
                  }}
                >
                  💾 Зберегти адресу
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'requests' && (
        <div className="card">
          <h2>Запити на поповнення</h2>
          {paymentRequests.length === 0 ? (
            <p>Немає запитів на поповнення</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Користувач</th>
                    <th>Метод</th>
                    <th>Сума</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>
                        <div>
                          <strong>{request.user_name}</strong>
                          <br />
                          <small>{request.user_email}</small>
                        </div>
                      </td>
                      <td>{getMethodName(request.payment_method)}</td>
                      <td>${formatNumber(request.amount)}</td>
                      <td>{formatDate(request.created_at)}</td>
                      <td>
                        <span className={`status-badge status-${request.status}`}>
                          {request.status === 'pending' && 'Очікує'}
                          {request.status === 'approved' && 'Схвалено'}
                          {request.status === 'rejected' && 'Відхилено'}
                        </span>
                      </td>
                      <td>
                        {request.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const notes = prompt('Примітка (опціонально):');
                                processPaymentRequest(request.id, 'approved', notes);
                              }}
                            >
                              ✓ Схвалити
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const notes = prompt('Причина відхилення:');
                                if (notes) {
                                  processPaymentRequest(request.id, 'rejected', notes);
                                }
                              }}
                            >
                              ✗ Відхилити
                            </button>
                          </div>
                        )}
                        {request.transaction_hash && (
                          <div>
                            <small>Hash: {request.transaction_hash.substring(0, 10)}...</small>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Компонент для керування продуктами
function ProductsManagement({ products, setProducts, setError, setSuccess, loadData }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_investment: '',
    expected_return: '',
    duration_months: '',
    risk_level: 'Низький',
    category: 'bonds',
    is_active: true
  });

  const riskLevels = ['Мінімальний', 'Низький', 'Середній', 'Високий'];
  const categories = [
    { value: 'bonds', label: 'Облігації' },
    { value: 'stocks', label: 'Акції' },
    { value: 'real_estate', label: 'Нерухомість' },
    { value: 'venture', label: 'Венчурні інвестиції' },
    { value: 'deposits', label: 'Депозити' },
    { value: 'commodities', label: 'Товарні ринки' },
    { value: 'crypto', label: 'Криптовалюта' },
    { value: 'other', label: 'Інше' }
  ];

  const startEdit = (product) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      min_investment: product.min_investment,
      expected_return: product.expected_return,
      duration_months: product.duration_months,
      risk_level: product.risk_level,
      category: product.category,
      is_active: product.is_active === 1
    });
    setShowCreateForm(false);
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      min_investment: '',
      expected_return: '',
      duration_months: '',
      risk_level: 'Низький',
      category: 'bonds',
      is_active: true
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      min_investment: '',
      expected_return: '',
      duration_months: '',
      risk_level: 'Низький',
      category: 'bonds',
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted:', formData);
    console.log('Editing product ID:', editingProduct);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Підготовка даних для відправки
      const submitData = {
        name: formData.name,
        description: formData.description || '',
        min_investment: parseFloat(formData.min_investment),
        expected_return: parseFloat(formData.expected_return),
        duration_months: parseInt(formData.duration_months),
        risk_level: formData.risk_level,
        category: formData.category,
        is_active: formData.is_active
      };

      console.log('Sending data:', submitData);

      if (editingProduct) {
        // Оновлення продукту
        const response = await axios.put(
          `${API_URL}/admin/products/${editingProduct}`,
          submitData,
          config
        );
        console.log('Update response:', response.data);
        setSuccess('Продукт успішно оновлено!');
      } else {
        // Створення нового продукту
        const response = await axios.post(
          `${API_URL}/admin/products`,
          submitData,
          config
        );
        console.log('Create response:', response.data);
        setSuccess('Продукт успішно створено!');
      }

      cancelEdit();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Submit error:', err.response || err);
      setError(err.response?.data?.error || 'Помилка збереження продукту');
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        setError('Продукт не знайдено');
        return;
      }

      console.log('Toggling product:', productId, 'Current status:', currentStatus);
      
      // Формуємо дані для відправки
      const updateData = {
        name: product.name,
        description: product.description || '',
        min_investment: product.min_investment,
        expected_return: product.expected_return,
        duration_months: product.duration_months,
        risk_level: product.risk_level,
        category: product.category,
        is_active: !currentStatus  // Інвертуємо статус
      };

      console.log('Sending update:', updateData);
      
      const response = await axios.put(
        `${API_URL}/admin/products/${productId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Response:', response.data);
      
      setSuccess(currentStatus ? 'Продукт деактивовано' : 'Продукт активовано');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Toggle error:', err.response || err);
      setError(err.response?.data?.error || 'Помилка оновлення статусу');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  return (
    <div className="products-management">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🎯 Керування продуктами</h2>
          <button className="btn btn-primary" onClick={startCreate}>
            ➕ Створити продукт
          </button>
        </div>

        {(showCreateForm || editingProduct) && (
          <div className="card product-form">
            <h3>{editingProduct ? '✏️ Редагування продукту' : '➕ Новий продукт'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Назва продукту *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Наприклад: Облігації державні"
                  />
                </div>

                <div className="form-group">
                  <label>Категорія *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Мінімальна інвестиція (USD) *</label>
                  <input
                    type="number"
                    value={formData.min_investment}
                    onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    placeholder="1000"
                  />
                </div>

                <div className="form-group">
                  <label>Очікувана прибутковість (% річних) *</label>
                  <input
                    type="number"
                    value={formData.expected_return}
                    onChange={(e) => setFormData({...formData, expected_return: e.target.value})}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="8.5"
                  />
                </div>

                <div className="form-group">
                  <label>Тривалість (місяців) *</label>
                  <input
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                    required
                    min="1"
                    placeholder="12"
                  />
                </div>

                <div className="form-group">
                  <label>Рівень ризику *</label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                    required
                  >
                    {riskLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Опис продукту</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Детальний опис інвестиційного продукту..."
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <span>Продукт активний (доступний для інвестування)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? '💾 Зберегти зміни' : '➕ Створити продукт'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  ❌ Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Категорія</th>
                <th>Мін. інвестиція</th>
                <th>Прибутковість</th>
                <th>Термін</th>
                <th>Ризик</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <strong>{product.name}</strong>
                    {product.description && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {product.description.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td>{getCategoryLabel(product.category)}</td>
                  <td>${product.min_investment.toLocaleString()}</td>
                  <td style={{ color: '#27ae60', fontWeight: '600' }}>
                    {product.expected_return}% річних
                  </td>
                  <td>{product.duration_months} міс.</td>
                  <td>
                    <span className={`risk-badge risk-${product.risk_level.toLowerCase()}`}>
                      {product.risk_level}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                      {product.is_active ? '✓ Активний' : '✗ Неактивний'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startEdit(product)}
                      >
                        ✏️ Редагувати
                      </button>
                      <button
                        className={`btn ${product.is_active ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                      >
                        {product.is_active ? '🚫 Деактивувати' : '✓ Активувати'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Компонент для керування соціальними мережами
function SocialLinksManagement() {
  const [socialLinks, setSocialLinks] = useState({
    facebook: { url: '', is_active: false },
    instagram: { url: '', is_active: false },
    twitter: { url: '', is_active: false },
    telegram: { url: '', is_active: false }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/social-links`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Loaded social links:', response.data);

      // Перетворюємо масив в об'єкт
      const linksObj = {};
      response.data.forEach(link => {
        linksObj[link.platform] = {
          url: link.url || '',
          is_active: link.is_active === 1
        };
      });

      setSocialLinks(linksObj);
    } catch (err) {
      console.error('Load error:', err);
      setError(err.response?.data?.error || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (platform, field, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Saving social links:', socialLinks);

      await axios.put(
        `${API_URL}/admin/social-links`,
        socialLinks,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Налаштування соціальних мереж збережено!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.error || 'Помилка збереження');
      setTimeout(() => setError(''), 3000);
    }
  };

  const platformsInfo = [
    { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/yourpage' },
    { key: 'twitter', label: 'Twitter (X)', icon: '🐦', placeholder: 'https://twitter.com/yourpage' },
    { key: 'telegram', label: 'Telegram', icon: '✈️', placeholder: 'https://t.me/yourchannel' }
  ];

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="social-links-management">
      <div className="card">
        <h2>🌐 Соціальні мережі</h2>
        <p className="subtitle">Налаштуйте посилання на ваші соціальні мережі</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="social-links-form">
          {platformsInfo.map(platform => (
            <div key={platform.key} className="social-link-item">
              <div className="social-link-header">
                <span className="social-icon">{platform.icon}</span>
                <h3>{platform.label}</h3>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={socialLinks[platform.key]?.is_active || false}
                    onChange={(e) => handleChange(platform.key, 'is_active', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label>Посилання:</label>
                <input
                  type="url"
                  value={socialLinks[platform.key]?.url || ''}
                  onChange={(e) => handleChange(platform.key, 'url', e.target.value)}
                  placeholder={platform.placeholder}
                  disabled={!socialLinks[platform.key]?.is_active}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSave}>
          💾 Зберегти налаштування
        </button>

        <div className="info-box">
          <h4>ℹ️ Підказка:</h4>
          <p>Активуйте перемикач для кожної соціальної мережі, яку хочете відобразити на сайті.</p>
          <p>Посилання будуть відображатися у футері сайту з кликабельними іконками.</p>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (activeTab === 'stats') {
        const response = await axios.get(`${API_URL}/admin/stats`, config);
        setStats(response.data);
      } else if (activeTab === 'users') {
        const response = await axios.get(`${API_URL}/admin/users`, config);
        setUsers(response.data);
      } else if (activeTab === 'products') {
        const response = await axios.get(`${API_URL}/investments`, config);
        setProducts(response.data);
      } else if (activeTab === 'investments') {
        const response = await axios.get(`${API_URL}/admin/investments`, config);
        setInvestments(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !stats && !users.length) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="container">
      <div className="admin-panel">
        <div className="admin-header">
          <h1>🔐 Панель адміністратора</h1>
          <p className="subtitle">Керування платформою</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Статистика
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Користувачі
          </button>
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🎯 Продукти
          </button>
          <button
            className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`}
            onClick={() => setActiveTab('investments')}
          >
            💼 Інвестиції
          </button>
          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💳 Платежі
          </button>
          <button
            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            🌐 Соц. мережі
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'stats' && stats && (
            <div className="stats-grid">
              <div className="card stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Користувачів</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-info">
                  <h3>Всього інвестицій</h3>
                  <p className="stat-value">{stats.totalInvestments}</p>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Інвестовано</h3>
                  <p className="stat-value">{stats.totalInvestedAmount.toFixed(2)} грн</p>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>Активних інвестицій</h3>
                  <p className="stat-value">{stats.activeInvestments}</p>
                </div>
              </div>
              <div className="card stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <h3>Продуктів</h3>
                  <p className="stat-value">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card table-card">
              <h2>Список користувачів</h2>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ім'я</th>
                      <th>Email</th>
                      <th>Телефон</th>
                      <th>Баланс</th>
                      <th>Роль</th>
                      <th>Дата реєстрації</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || '-'}</td>
                        <td>{parseFloat(user.balance || 0).toFixed(2)} грн</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role === 'admin' ? '👑 Адмін' : '👤 Користувач'}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductsManagement 
              products={products}
              setProducts={setProducts}
              setError={setError}
              setSuccess={setSuccess}
              loadData={loadData}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsManagement />
          )}

          {activeTab === 'social' && (
            <SocialLinksManagement />
          )}

          {activeTab === 'investments' && (
            <div className="card table-card">
              <h2>Всі інвестиції</h2>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Користувач</th>
                      <th>Продукт</th>
                      <th>Сума</th>
                      <th>Статус</th>
                      <th>Дата початку</th>
                      <th>Дата закінчення</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.id}</td>
                        <td>
                          <div>
                            <strong>{inv.user_name}</strong>
                            <br />
                            <small>{inv.user_email}</small>
                          </div>
                        </td>
                        <td>{inv.product_name}</td>
                        <td>{formatNumber(inv.amount)} грн</td>
                        <td>
                          <span className={`status-badge status-${inv.status}`}>
                            {inv.status === 'active' ? 'Активна' : inv.status}
                          </span>
                        </td>
                        <td>{formatDate(inv.start_date)}</td>
                        <td>{formatDate(inv.end_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
