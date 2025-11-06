import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  // Логирование для отладки админки
  console.log('🔍 Header - Current user:', user);
  console.log('🔍 Header - User role:', user?.role);
  console.log('🔍 Header - Is admin?', user?.role === 'admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            💰 Інвестиційна платформа
          </Link>
          
          <nav className="nav">
            {token ? (
              <>
                <Link to="/dashboard" className="nav-link">Дашборд</Link>
                <Link to="/investments" className="nav-link">Інвестиції</Link>
                <Link to="/my-investments" className="nav-link">Мій портфель</Link>
                <Link to="/deposit" className="nav-link">💳 Поповнити</Link>
                <Link to="/assistant" className="nav-link assistant-link">🤖 Асистент</Link>
                <Link to="/profile" className="nav-link">Профіль</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link admin-link">
                    🔐 Адмін
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-secondary">
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link to="/assistant" className="nav-link assistant-link">🤖 Асистент</Link>
                <Link to="/login" className="btn btn-secondary">Вхід</Link>
                <Link to="/register" className="btn btn-primary">Реєстрація</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
