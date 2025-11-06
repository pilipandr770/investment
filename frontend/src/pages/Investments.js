import React, { useState, useEffect } from 'react';
import { investmentAPI, userAPI } from '../api/api';
import './Investments.css';

function Investments() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, profileRes] = await Promise.all([
        investmentAPI.getAll(),
        userAPI.getProfile()
      ]);
      setProducts(productsRes.data);
      setBalance(profileRes.data.user.balance);
    } catch (err) {
      setError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await investmentAPI.invest({
        productId: selectedProduct.id,
        amount: parseFloat(investAmount)
      });
      setSuccess('Інвестицію успішно створено!');
      setSelectedProduct(null);
      setInvestAmount('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка створення інвестиції');
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      'Мінімальний': '#27ae60',
      'Низький': '#2ecc71',
      'Середній': '#f39c12',
      'Високий': '#e74c3c'
    };
    return colors[risk] || '#95a5a6';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'bonds': '🏦',
      'stocks': '📈',
      'real_estate': '🏢',
      'venture': '🚀',
      'deposits': '💰',
      'commodities': '🥇'
    };
    return icons[category] || '💼';
  };

  if (loading) return <div className="loading">Завантаження...</div>;

  return (
    <div className="container">
      <div className="investments">
        <div className="page-header">
          <div>
            <h1>Інвестиційні продукти</h1>
            <p className="subtitle">Оберіть найкращий варіант для ваших інвестицій</p>
          </div>
          <div className="balance-info">
            <span>Доступний баланс:</span>
            <strong>{parseFloat(balance || 0).toFixed(2)} грн</strong>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="card product-card">
              <div className="product-header">
                <div className="product-icon">{getCategoryIcon(product.category)}</div>
                <div 
                  className="risk-badge" 
                  style={{ backgroundColor: getRiskColor(product.risk_level) }}
                >
                  {product.risk_level}
                </div>
              </div>
              
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>

              <div className="product-details">
                <div className="detail-item">
                  <span className="detail-label">Очікувана доходність</span>
                  <span className="detail-value return">{product.expected_return}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Мінімальна сума</span>
                  <span className="detail-value">{product.min_investment} грн</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Термін</span>
                  <span className="detail-value">{product.duration_months} міс</span>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-full"
                onClick={() => setSelectedProduct(product)}
                disabled={parseFloat(balance) < parseFloat(product.min_investment)}
              >
                {parseFloat(balance) < parseFloat(product.min_investment) ? 'Недостатньо коштів' : 'Інвестувати'}
              </button>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <h2>Інвестувати в {selectedProduct.name}</h2>
              <form onSubmit={handleInvest}>
                <div className="form-group">
                  <label>Сума інвестиції (грн)</label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    required
                    min={selectedProduct.min_investment}
                    max={balance}
                    step="0.01"
                    placeholder={`Мінімум ${selectedProduct.min_investment} грн`}
                  />
                  <small>Доступно: {parseFloat(balance || 0).toFixed(2)} грн</small>
                </div>

                <div className="investment-preview">
                  <div className="preview-item">
                    <span>Очікуваний дохід:</span>
                    <strong className="profit">
                      +{investAmount ? (parseFloat(investAmount) * parseFloat(selectedProduct.expected_return) / 100).toFixed(2) : 0} грн
                    </strong>
                  </div>
                  <div className="preview-item">
                    <span>Загальна сума після закінчення:</span>
                    <strong>
                      {investAmount ? (parseFloat(investAmount) * (1 + parseFloat(selectedProduct.expected_return) / 100)).toFixed(2) : 0} грн
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Підтвердити
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setSelectedProduct(null)}
                    style={{ flex: 1 }}
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Investments;
